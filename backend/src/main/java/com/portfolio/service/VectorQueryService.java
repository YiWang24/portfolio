package com.portfolio.service;

import com.google.genai.Client;
import com.google.genai.types.EmbedContentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Vector Query Service - Query the PostgreSQL vector store using Google GenAI embeddings
 *
 * This service:
 * 1. Takes a user query
 * 2. Generates embedding using Google GenAI SDK (gemini-embedding-001)
 * 3. Performs cosine similarity search in PostgreSQL using pgvector
 * 4. Returns the most relevant document chunks
 */
@Service
public class VectorQueryService {

    private static final Logger log = LoggerFactory.getLogger(VectorQueryService.class);
    private static final String EMBEDDING_MODEL = "gemini-embedding-001";
    private static final int EMBEDDING_DIMENSIONS = 768;

    private final Client genaiClient;
    private final JdbcTemplate jdbcTemplate;

    public VectorQueryService(
            @Value("${google.api.key}") String apiKey,
            JdbcTemplate jdbcTemplate) {
        this.genaiClient = Client.builder().apiKey(apiKey).build();
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Semantic search across all documents in the vector store
     *
     * @param query User's query text
     * @param topK  Number of results to return
     * @return List of relevant chunks with similarity scores
     */
    public List<VectorSearchResult> semanticSearch(String query, int topK) {
        try {
            // Step 1: Generate embedding for the query
            float[] queryVector = embedQuery(query);
            if (queryVector == null) {
                log.warn("Failed to generate embedding for query: {}", query);
                return Collections.emptyList();
            }

            // Step 2: Search PostgreSQL using cosine similarity
            String vectorStr = floatArrayToVectorString(queryVector);

            String sql = """
                SELECT
                    path,
                    chunk_index,
                    content,
                    start_pos,
                    end_pos,
                    1 - (embedding <=> ?::vector) as similarity
                FROM vector_store
                ORDER BY embedding <=> ?::vector
                LIMIT ?
                """;

            List<VectorSearchResult> results = jdbcTemplate.query(sql,
                    rs -> {
                        List<VectorSearchResult> list = new ArrayList<>();
                        while (rs.next()) {
                            list.add(new VectorSearchResult(
                                    rs.getString("path"),
                                    rs.getInt("chunk_index"),
                                    rs.getString("content"),
                                    rs.getInt("start_pos"),
                                    rs.getInt("end_pos"),
                                    rs.getFloat("similarity")
                            ));
                        }
                        return list;
                    },
                    vectorStr, vectorStr, topK
            );

            log.debug("Found {} results for query: {}", results.size(), query);
            return results;

        } catch (Exception e) {
            log.error("Error during semantic search", e);
            return Collections.emptyList();
        }
    }

    /**
     * Search within a specific category (path prefix)
     *
     * @param category Category to filter by (e.g., "personal", "projects", "blog")
     * @param query    Search query
     * @param topK     Number of results
     * @return Filtered search results
     */
    public List<VectorSearchResult> searchByCategory(String category, String query, int topK) {
        try {
            float[] queryVector = embedQuery(query);
            if (queryVector == null) {
                return Collections.emptyList();
            }

            String vectorStr = floatArrayToVectorString(queryVector);

            // Filter by path starting with category/
            String sql = """
                SELECT
                    path,
                    chunk_index,
                    content,
                    start_pos,
                    end_pos,
                    1 - (embedding <=> ?::vector) as similarity
                FROM vector_store
                WHERE path LIKE ?
                ORDER BY embedding <=> ?::vector
                LIMIT ?
                """;

            String categoryPattern = category + "/%";

            List<VectorSearchResult> results = jdbcTemplate.query(sql,
                    rs -> {
                        List<VectorSearchResult> list = new ArrayList<>();
                        while (rs.next()) {
                            list.add(new VectorSearchResult(
                                    rs.getString("path"),
                                    rs.getInt("chunk_index"),
                                    rs.getString("content"),
                                    rs.getInt("start_pos"),
                                    rs.getInt("end_pos"),
                                    rs.getFloat("similarity")
                            ));
                        }
                        return list;
                    },
                    vectorStr, categoryPattern, vectorStr, topK
            );

            return results;

        } catch (Exception e) {
            log.error("Error during category search", e);
            return Collections.emptyList();
        }
    }

    /**
     * Get statistics about the vector store
     */
    public VectorStoreStats getStats() {
        try {
            String sql = """
                SELECT
                    COUNT(*) as total_chunks,
                    COUNT(DISTINCT path) as total_documents
                FROM vector_store
                """;

            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> new VectorStoreStats(
                    rs.getInt("total_chunks"),
                    rs.getInt("total_documents"),
                    EMBEDDING_DIMENSIONS
            ));

        } catch (Exception e) {
            log.error("Error getting vector store stats", e);
            return new VectorStoreStats(0, 0, EMBEDDING_DIMENSIONS);
        }
    }

    /**
     * List all documents in the vector store grouped by category
     */
    public Map<String, List<String>> listDocuments() {
        try {
            String sql = "SELECT DISTINCT path FROM vector_store ORDER BY path";

            List<String> paths = jdbcTemplate.queryForList(sql, String.class);
            Map<String, List<String>> byCategory = new LinkedHashMap<>();

            for (String path : paths) {
                String category = path.contains("/") ? path.split("/")[0] : "general";
                byCategory.computeIfAbsent(category, k -> new ArrayList<>()).add(path);
            }

            return byCategory;

        } catch (Exception e) {
            log.error("Error listing documents", e);
            return Collections.emptyMap();
        }
    }

    /**
     * Generate embedding for a query using Google GenAI SDK
     */
    private float[] embedQuery(String query) {
        try {
            EmbedContentResponse response = genaiClient.models.embedContent(
                    EMBEDDING_MODEL,
                    query,
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
                return vector;
            }

            log.error("Empty embedding response for query: {}", query);
            return null;

        } catch (Exception e) {
            log.error("Failed to embed query: {}", query, e);
            return null;
        }
    }

    /**
     * Convert float array to pgvector string format
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

    // ========== Result Records ==========

    /**
     * Result of a vector similarity search
     */
    public record VectorSearchResult(
            String path,        // Source document path
            int chunkIndex,     // Chunk index within document
            String content,     // Chunk content
            Integer startPos,   // Start position in original document
            Integer endPos,     // End position in original document
            float similarity    // Similarity score (0-1, higher is better)
    ) {
        public Map<String, Object> toMap() {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("source", path);
            map.put("chunk_index", chunkIndex);
            map.put("content", content);
            map.put("similarity", Math.round(similarity * 1000.0) / 1000.0);
            return map;
        }
    }

    /**
     * Statistics about the vector store
     */
    public record VectorStoreStats(
            int totalChunks,
            int totalDocuments,
            int embeddingDimensions
    ) {}
}
