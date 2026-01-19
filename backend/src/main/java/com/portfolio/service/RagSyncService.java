package com.portfolio.service;

import com.google.genai.Client;
import com.google.genai.types.EmbedContentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * RAG Sync Service - Native implementation using Google GenAI SDK + PostgreSQL pgvector
 *
 * Flow:
 * 1. Receive Markdown documents from frontend
 * 2. Split text into chunks (~1000 chars, 100 chars overlap)
 * 3. Call Google SDK to get embeddings (gemini-embedding-001, 768 dimensions)
 * 4. Store vectors in PostgreSQL via pgvector
 */
@Service
public class RagSyncService {

    private static final Logger log = LoggerFactory.getLogger(RagSyncService.class);

    private static final int CHUNK_SIZE = 1000;
    private static final int CHUNK_OVERLAP = 100;
    private static final String EMBEDDING_MODEL = "gemini-embedding-001";
    private static final int EMBEDDING_DIMENSIONS = 3072;

    private final Client genaiClient;
    private final JdbcTemplate jdbcTemplate;

    @Value("${rag.sync.key:}")
    private String syncKey;

    public RagSyncService(
            @Value("${google.api.key}") String apiKey,
            JdbcTemplate jdbcTemplate) {
        this.genaiClient = Client.builder().apiKey(apiKey).build();
        this.jdbcTemplate = jdbcTemplate;
        log.info("RagSyncService initialized with model: {}", EMBEDDING_MODEL);
    }

    /**
     * Validate sync key from header
     */
    public boolean validateSyncKey(String providedKey) {
        if (syncKey == null || syncKey.isBlank()) {
            log.warn("RAG_SYNC_KEY is not configured");
            return false;
        }
        return syncKey.equals(providedKey);
    }

    /**
     * Debug sync - returns information about what would happen without storing
     */
    public Map<String, Object> debugSync(List<DocumentChunk> documents) {
        Map<String, Object> result = new HashMap<>();
        result.put("documents_received", documents.size());

        List<Map<String, Object>> docInfo = new ArrayList<>();

        for (DocumentChunk doc : documents) {
            Map<String, Object> info = new HashMap<>();
            info.put("path", doc.path());
            info.put("content_length", doc.content() != null ? doc.content().length() : 0);
            info.put("content_preview", doc.content() != null ? doc.content().substring(0, Math.min(100, doc.content().length())) : "null");

            // Test splitting
            List<TextChunk> chunks = splitText(doc.content(), doc.path());
            info.put("chunks_created", chunks.size());

            // Test embedding for first chunk
            if (!chunks.isEmpty()) {
                TextChunk firstChunk = chunks.get(0);
                info.put("first_chunk_length", firstChunk.text().length());

                try {
                    EmbedContentResponse response = genaiClient.models.embedContent(
                            EMBEDDING_MODEL,
                            firstChunk.text(),
                            null
                    );

                    if (response.embeddings().isPresent() &&
                        !response.embeddings().get().isEmpty() &&
                        response.embeddings().get().get(0).values().isPresent()) {

                        List<Float> values = response.embeddings().get().get(0).values().get();
                        info.put("embedding_generated", true);
                        info.put("embedding_length", values.size());
                    } else {
                        info.put("embedding_generated", false);
                        info.put("embedding_error", "Empty response");
                    }
                } catch (Exception e) {
                    info.put("embedding_generated", false);
                    info.put("embedding_error", e.getMessage());
                }
            }

            docInfo.add(info);
        }

        result.put("documents_info", docInfo);
        return result;
    }

    /**
     * Sync documents to vector store
     *
     * @param documents List of {path, content} pairs
     * @return Number of chunks embedded and stored
     */
    @Transactional
    public int syncDocuments(List<DocumentChunk> documents) {
        log.info("Starting RAG sync for {} documents", documents.size());

        int totalChunksStored = 0;

        for (DocumentChunk doc : documents) {
            try {
                // Step 1: Split text into chunks
                List<TextChunk> chunks = splitText(doc.content(), doc.path());
                log.info("Document {} split into {} chunks", doc.path(), chunks.size());

                // Step 2: Get embeddings for each chunk
                List<EmbeddedChunk> embeddedChunks = embedChunks(chunks);
                log.info("Generated {} embeddings for document {}", embeddedChunks.size(), doc.path());

                // Step 3: Store in database
                int stored = storeChunks(embeddedChunks);
                log.info("Stored {} chunks for document {}", stored, doc.path());

                totalChunksStored += stored;
                log.debug("Stored {} chunks for document: {}", stored, doc.path());

            } catch (Exception e) {
                log.error("Failed to sync document: {}", doc.path(), e);
                // Continue with next document
            }
        }

        log.info("RAG sync completed. Total chunks stored: {}", totalChunksStored);
        return totalChunksStored;
    }

    /**
     * Clear all documents from vector store
     */
    @Transactional
    public int clearVectorStore() {
        int deleted = jdbcTemplate.update("DELETE FROM vector_store");
        log.info("Cleared vector store: {} rows deleted", deleted);
        return deleted;
    }

    /**
     * Recreate the vector_store table with correct schema
     */
    @Transactional
    public void recreateTable() {
        log.info("Recreating vector_store table with {} dimensions...", EMBEDDING_DIMENSIONS);
        jdbcTemplate.update("DROP TABLE IF EXISTS vector_store CASCADE");
        jdbcTemplate.update(String.format("""
            CREATE TABLE vector_store (
                id SERIAL PRIMARY KEY,
                path VARCHAR(255) NOT NULL,
                chunk_index INTEGER NOT NULL,
                content TEXT NOT NULL,
                start_pos INTEGER,
                end_pos INTEGER,
                embedding vector(%d),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(path, chunk_index)
            )
            """, EMBEDDING_DIMENSIONS));
        // Note: ivfflat index only supports up to 2000 dimensions
        // For high-dimensional embeddings, we skip the similarity index
        // PostgreSQL can still do sequential scan for similarity search
        if (EMBEDDING_DIMENSIONS <= 2000) {
            jdbcTemplate.update("""
                CREATE INDEX idx_vector_store_embedding
                    ON vector_store
                    USING ivfflat (embedding vector_cosine_ops)
                    WITH (lists = 100)
                """);
        }
        jdbcTemplate.update("CREATE INDEX idx_vector_store_path ON vector_store(path)");
        log.info("vector_store table recreated successfully with {} dimensions (index: {})",
                EMBEDDING_DIMENSIONS, EMBEDDING_DIMENSIONS <= 2000 ? "ivfflat" : "none (high-dim)");
    }

    /**
     * Split text into overlapping chunks
     */
    private List<TextChunk> splitText(String text, String path) {
        List<TextChunk> chunks = new ArrayList<>();

        if (text == null || text.isBlank()) {
            return chunks;
        }

        int textLength = text.length();
        int chunkIndex = 0;

        for (int start = 0; start < textLength; start += (CHUNK_SIZE - CHUNK_OVERLAP)) {
            int end = Math.min(start + CHUNK_SIZE, textLength);

            // Try to break at word boundary
            if (end < textLength) {
                int lastSpace = text.lastIndexOf(' ', end);
                if (lastSpace > start) {
                    end = lastSpace;
                }
            }

            String chunkText = text.substring(start, end).trim();
            if (!chunkText.isEmpty()) {
                chunks.add(new TextChunk(
                        path,
                        chunkIndex++,
                        chunkText,
                        start,
                        end
                ));
            }

            if (end >= textLength) {
                break;
            }
        }

        return chunks;
    }

    /**
     * Get embeddings from Google GenAI SDK
     */
    private List<EmbeddedChunk> embedChunks(List<TextChunk> chunks) {
        List<EmbeddedChunk> embeddedChunks = new ArrayList<>();
        log.info("embedChunks: Processing {} chunks", chunks.size());

        for (TextChunk chunk : chunks) {
            try {
                // Call Google SDK for embedding
                EmbedContentResponse response = genaiClient.models.embedContent(
                        EMBEDDING_MODEL,
                        chunk.text(),
                        null
                );

                // Extract embedding values
                if (response.embeddings().isPresent() &&
                    !response.embeddings().get().isEmpty() &&
                    response.embeddings().get().get(0).values().isPresent()) {

                    List<Float> values = response.embeddings().get().get(0).values().get();
                    float[] vector = new float[values.size()];
                    for (int i = 0; i < values.size(); i++) {
                        vector[i] = values.get(i);
                    }

                    embeddedChunks.add(new EmbeddedChunk(chunk, vector));
                    log.info("Successfully embedded chunk {} of {}, vector length: {}", chunk.index(), chunk.path(), vector.length);
                } else {
                    log.error("Empty embedding response for chunk {} of {}", chunk.index(), chunk.path());
                    embeddedChunks.add(new EmbeddedChunk(chunk, null));
                }

            } catch (Exception e) {
                log.error("Failed to embed chunk {} of {}", chunk.index(), chunk.path(), e);
                // Add chunk with null embedding to handle error
                embeddedChunks.add(new EmbeddedChunk(chunk, null));
            }
        }

        log.info("embedChunks: Returning {} embedded chunks (with nulls)", embeddedChunks.size());
        return embeddedChunks;
    }

    /**
     * Store chunks in PostgreSQL with pgvector
     *
     * Vector format for pgvector: '[0.1, 0.2, 0.3, ...]'
     */
    private int storeChunks(List<EmbeddedChunk> embeddedChunks) {
        int stored = 0;
        log.info("storeChunks: Processing {} embedded chunks", embeddedChunks.size());

        for (EmbeddedChunk embedded : embeddedChunks) {
            if (embedded.vector() == null) {
                log.warn("Skipping chunk with null embedding: {}[{}]",
                        embedded.chunk().path(), embedded.chunk().index());
                continue;
            }

            try {
                // Convert float array to pgvector string format
                String vectorStr = floatArrayToVectorString(embedded.vector());
                log.info("Storing chunk {} of {}, vector string length: {}",
                        embedded.chunk().index(), embedded.chunk().path(), vectorStr.length());

                // Upsert: delete existing chunks for same path+index, then insert
                jdbcTemplate.update(
                        "INSERT INTO vector_store (path, chunk_index, content, start_pos, end_pos, embedding) " +
                                "VALUES (?, ?, ?, ?, ?, ?::vector) " +
                                "ON CONFLICT (path, chunk_index) DO UPDATE " +
                                "SET content = EXCLUDED.content, " +
                                "    start_pos = EXCLUDED.start_pos, " +
                                "    end_pos = EXCLUDED.end_pos, " +
                                "    embedding = EXCLUDED.embedding, " +
                                "    updated_at = NOW()",
                        embedded.chunk().path(),
                        embedded.chunk().index(),
                        embedded.chunk().text(),
                        embedded.chunk().startPos(),
                        embedded.chunk().endPos(),
                        vectorStr
                );

                stored++;
                log.info("Successfully stored chunk {} of {}", embedded.chunk().index(), embedded.chunk().path());

            } catch (Exception e) {
                log.error("Failed to store chunk {} of {}",
                        embedded.chunk().index(), embedded.chunk().path(), e);
            }
        }

        log.info("storeChunks: Stored {} chunks total", stored);
        return stored;
    }

    /**
     * Convert float array to pgvector string format: '[0.1, 0.2, ...]'
     */
    private String floatArrayToVectorString(float[] vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) {
                sb.append(", ");
            }
            sb.append(vector[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Convert pgvector string back to float array
     */
    public static float[] vectorStringToFloatArray(String vectorStr) {
        if (vectorStr == null || vectorStr.isEmpty()) {
            return new float[0];
        }

        // Remove brackets and split by comma
        String cleaned = vectorStr.replaceAll("[\\[\\]]", "").trim();
        if (cleaned.isEmpty()) {
            return new float[0];
        }

        String[] parts = cleaned.split("\\s*,\\s*");
        float[] result = new float[parts.length];

        for (int i = 0; i < parts.length; i++) {
            result[i] = Float.parseFloat(parts[i]);
        }

        return result;
    }

    // ========== Records ==========

    /**
     * Input document from frontend
     */
    public record DocumentChunk(
            String path,     // File path (e.g., "blog/post-1.md")
            String content   // Markdown content
    ) {}

    /**
     * Text chunk after splitting
     */
    private record TextChunk(
            String path,        // Source file path
            int index,          // Chunk index within document
            String text,        // Chunk text content
            int startPos,       // Start position in original text
            int endPos          // End position in original text
    ) {}

    /**
     * Chunk with embedding vector
     */
    private record EmbeddedChunk(
            TextChunk chunk,
            float[] vector      // Embedding vector (768 dimensions)
    ) {}
}
