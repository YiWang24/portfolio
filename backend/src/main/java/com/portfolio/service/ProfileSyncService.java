package com.portfolio.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.EmbedContentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

/**
 * Profile Sync Service - Converts profile.json to RAG-friendly document chunks
 *
 * This service:
 * 1. Receives profile.json from frontend
 * 2. Extracts structured data (about, education, experience, projects)
 * 3. Converts to natural language text chunks
 * 4. Generates embeddings using Google GenAI SDK
 * 5. Stores in PostgreSQL via pgvector
 */
@Service
public class ProfileSyncService {

    private static final Logger log = LoggerFactory.getLogger(ProfileSyncService.class);

    // RAG configuration
    private static final int CHUNK_SIZE = 1000;
    private static final int CHUNK_OVERLAP = 100;
    private static final String EMBEDDING_MODEL = "gemini-embedding-001";
    private static final int EMBEDDING_DIMENSIONS = 3072;

    private final Client genaiClient;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    @Value("${rag.sync.key:}")
    private String syncKey;

    public ProfileSyncService(
            @Value("${google.api.key}") String apiKey,
            JdbcTemplate jdbcTemplate) {
        this.genaiClient = Client.builder().apiKey(apiKey).build();
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = new ObjectMapper();
        log.info("ProfileSyncService initialized with model: {}", EMBEDDING_MODEL);
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
     * Load profile.json from classpath resources (src/main/resources/profile.json)
     * Called during application startup instead of receiving via HTTP.
     *
     * @return Raw profile.json content as string
     * @throws IOException if profile.json not found in classpath
     */
    public String loadProfileFromResources() throws IOException {
        log.info("Loading profile.json from classpath resources");

        ClassPathResource resource = new ClassPathResource("profile.json");

        if (!resource.exists()) {
            throw new IllegalStateException(
                "profile.json not found in classpath. " +
                "Ensure build script copies it to src/main/resources/ or target/classes/"
            );
        }

        String profileJson = Files.readString(resource.getFile().toPath());
        log.info("Successfully loaded profile.json ({} chars)", profileJson.length());

        return profileJson;
    }

    /**
     * Sync profile.json to vector store
     *
     * @param profileJson Raw JSON string from frontend
     * @return Number of chunks embedded and stored
     */
    @Transactional
    public int syncProfile(String profileJson) throws Exception {
        log.info("Processing profile.json for vector sync");

        // Parse JSON
        JsonNode root = objectMapper.readTree(profileJson);

        // Convert to document chunks
        List<DocumentChunk> documents = new ArrayList<>();

        // 1. About section
        documents.add(convertAbout(root.get("about")));

        // 2. Education
        JsonNode education = root.get("education");
        if (education != null && education.isArray()) {
            documents.add(convertEducation(education));
        }

        // 3. Experience
        JsonNode experience = root.get("experience");
        if (experience != null && experience.isArray()) {
            documents.add(convertExperience(experience));
        }

        // 4. Projects
        JsonNode projects = root.get("projects");
        if (projects != null && projects.isArray()) {
            documents.add(convertProjects(projects));
        }

        // 5. Skills (if exists)
        JsonNode skills = root.get("skills");
        if (skills != null) {
            documents.add(convertSkills(skills));
        }

        log.info("Converted profile.json to {} document chunks", documents.size());

        // Sync to vector store
        return syncDocuments(documents);
    }

    /**
     * Sync documents to vector store
     */
    private int syncDocuments(List<DocumentChunk> documents) {
        log.info("Starting Profile RAG sync for {} documents", documents.size());

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

            } catch (Exception e) {
                log.error("Failed to sync document: {}", doc.path(), e);
            }
        }

        log.info("Profile RAG sync completed. Total chunks stored: {}", totalChunksStored);
        return totalChunksStored;
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
     * Get embeddings from Google GenAI public REST API
     * Uses HTTP client directly to avoid SDK's private API requirement
     */
    private List<EmbeddedChunk> embedChunks(List<TextChunk> chunks) {
        List<EmbeddedChunk> embeddedChunks = new ArrayList<>();
        log.info("embedChunks: Processing {} chunks", chunks.size());

        // Get API key from the client
        String apiKey = genaiClient.apiKey();

        for (TextChunk chunk : chunks) {
            try {
                // Call Google Generative Language API public endpoint
                java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();

                // Build request body
                String requestBody = String.format(
                    "{\"content\":{\"parts\":[{\"text\":\"%s\"}]}}",
                    escapeJson(chunk.text())
                );

                java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                        .uri(java.net.URI.create("https://generativelanguage.googleapis.com/v1beta/models/" + EMBEDDING_MODEL + ":embedContent?key=" + apiKey))
                        .header("Content-Type", "application/json")
                        .POST(java.net.http.HttpRequest.BodyPublishers.ofString(requestBody))
                        .build();

                java.net.http.HttpResponse<String> response = client.send(request,
                        java.net.http.HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 200) {
                    // Parse response using Jackson
                    String responseBody = response.body();
                    log.info("API Response for chunk {}: {}", chunk.index(), responseBody.substring(0, Math.min(200, responseBody.length())));

                    com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(responseBody);
                    log.info("Parsed JSON - hasEmbedding: {}, hasValues: {}, hasValuesArray: {}",
                            root.has("embedding"),
                            root.has("embedding") && root.get("embedding").has("values"),
                            root.has("embedding") && root.get("embedding").has("values") && root.get("embedding").get("values").isArray());

                    if (root.has("embedding") && root.get("embedding").has("values")) {
                        com.fasterxml.jackson.databind.JsonNode valueArray = root.get("embedding").get("values");
                        float[] vector = new float[valueArray.size()];
                        for (int i = 0; i < valueArray.size(); i++) {
                            vector[i] = (float) valueArray.get(i).asDouble();
                        }

                        embeddedChunks.add(new EmbeddedChunk(chunk, vector));
                        log.info("Successfully embedded chunk {} of {} with vector size {}", chunk.index(), chunk.path(), vector.length);
                    } else {
                        log.error("Invalid response format for chunk {} of {}: {}", chunk.index(), chunk.path(), responseBody);
                        embeddedChunks.add(new EmbeddedChunk(chunk, null));
                    }
                } else {
                    log.error("API returned status {} for chunk {} of {}: {}",
                            response.statusCode(), chunk.index(), chunk.path(), response.body());
                    embeddedChunks.add(new EmbeddedChunk(chunk, null));
                }

            } catch (Exception e) {
                log.error("Failed to embed chunk {} of {}", chunk.index(), chunk.path(), e);
                embeddedChunks.add(new EmbeddedChunk(chunk, null));
            }
        }

        log.info("embedChunks: Returning {} embedded chunks", embeddedChunks.size());
        return embeddedChunks;
    }

    /**
     * Escape special characters for JSON
     */
    private String escapeJson(String text) {
        return text.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }

    /**
     * Store chunks in PostgreSQL with pgvector
     */
    private int storeChunks(List<EmbeddedChunk> embeddedChunks) {
        int stored = 0;

        for (EmbeddedChunk embedded : embeddedChunks) {
            if (embedded.vector() == null) {
                log.warn("Skipping chunk with null embedding: {}[{}]",
                        embedded.chunk().path(), embedded.chunk().index());
                continue;
            }

            try {
                // Convert float array to pgvector string format
                String vectorStr = floatArrayToVectorString(embedded.vector());

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

    // ========== Profile Conversion Methods ==========

    /**
     * Convert "about" section to natural language
     */
    private DocumentChunk convertAbout(JsonNode about) {
        StringBuilder content = new StringBuilder();
        content.append("# About Yi Wang\n\n");

        // Basic info
        content.append(String.format("**Name:** %s\n", about.get("name").asText()));
        content.append(String.format("**Role:** %s\n", about.get("role").asText()));
        content.append(String.format("**Location:** %s\n", about.get("location").asText()));
        content.append(String.format("**Experience:** %s years\n\n", about.get("experience").asText()));

        // Tagline and bio
        content.append(String.format("**Tagline:** %s\n\n", about.get("tagline").asText()));
        content.append(String.format("**Bio:** %s\n\n", about.get("bio").asText()));

        // Focus areas
        JsonNode focusAreas = about.get("focusAreas");
        if (focusAreas != null && focusAreas.isArray()) {
            content.append("## Focus Areas\n\n");
            for (JsonNode area : focusAreas) {
                content.append(String.format("### %s\n", area.get("title").asText()));
                content.append(String.format("%s\n", area.get("description").asText()));

                JsonNode tags = area.get("tags");
                if (tags != null && tags.isArray()) {
                    content.append("**Technologies:** ");
                    List<String> tagList = new ArrayList<>();
                    tags.forEach(tag -> tagList.add(tag.asText()));
                    content.append(String.join(", ", tagList));
                    content.append("\n\n");
                }
            }
        }

        // Contact info
        JsonNode socials = about.get("socials");
        if (socials != null) {
            content.append("## Contact Information\n\n");
            if (socials.has("email")) {
                content.append(String.format("**Email:** %s\n", socials.get("email").asText()));
            }
            if (socials.has("github")) {
                content.append(String.format("**GitHub:** %s\n", socials.get("github").asText()));
            }
            if (socials.has("linkedin")) {
                content.append(String.format("**LinkedIn:** %s\n", socials.get("linkedin").asText()));
            }
        }

        return new DocumentChunk("personal/profile-about.md", content.toString());
    }

    /**
     * Convert education array to natural language
     */
    private DocumentChunk convertEducation(JsonNode education) {
        StringBuilder content = new StringBuilder();
        content.append("# Education Background\n\n");

        for (JsonNode edu : education) {
            content.append(String.format("## %s\n", edu.get("degree").asText()));
            content.append(String.format("**School:** %s\n", edu.get("school").asText()));
            content.append(String.format("**Period:** %s\n\n", edu.get("period").asText()));
        }

        return new DocumentChunk("personal/education.md", content.toString());
    }

    /**
     * Convert experience array to natural language
     */
    private DocumentChunk convertExperience(JsonNode experience) {
        StringBuilder content = new StringBuilder();
        content.append("# Work Experience\n\n");

        for (JsonNode job : experience) {
            content.append(String.format("## %s\n", job.get("title").asText()));
            content.append(String.format("**Company:** %s\n", job.get("company").asText()));
            content.append(String.format("**Period:** %s\n", job.get("period").asText()));

            if (job.has("location")) {
                content.append(String.format("**Location:** %s\n", job.get("location").asText()));
            }

            content.append("\n**Key Achievements:**\n");
            JsonNode achievements = job.get("achievements");
            if (achievements != null && achievements.isArray()) {
                for (JsonNode achievement : achievements) {
                    content.append(String.format("- %s\n", achievement.asText()));
                }
            }

            JsonNode tech = job.get("tech");
            if (tech != null && tech.isArray()) {
                content.append("\n**Technologies Used:** ");
                List<String> techList = new ArrayList<>();
                tech.forEach(t -> techList.add(t.asText()));
                content.append(String.join(", ", techList));
                content.append("\n\n");
            }
        }

        return new DocumentChunk("personal/experience.md", content.toString());
    }

    /**
     * Convert projects array to natural language
     */
    private DocumentChunk convertProjects(JsonNode projects) {
        StringBuilder content = new StringBuilder();
        content.append("# Project Portfolio\n\n");

        for (JsonNode project : projects) {
            content.append(String.format("## %s\n\n", project.get("title").asText()));

            if (project.has("summary")) {
                content.append(String.format("%s\n\n", project.get("summary").asText()));
            }

            JsonNode tech = project.get("tech");
            if (tech != null && tech.isArray()) {
                content.append("**Tech Stack:** ");
                List<String> techList = new ArrayList<>();
                tech.forEach(t -> techList.add(t.asText()));
                content.append(String.join(", ", techList));
                content.append("\n\n");
            }

            if (project.has("github")) {
                content.append(String.format("**GitHub:** %s\n", project.get("github").asText()));
            }
            if (project.has("demo")) {
                content.append(String.format("**Demo:** %s\n", project.get("demo").asText()));
            }

            content.append("\n");
        }

        return new DocumentChunk("projects/portfolio.md", content.toString());
    }

    /**
     * Convert skills to natural language
     */
    private DocumentChunk convertSkills(JsonNode skills) {
        StringBuilder content = new StringBuilder();
        content.append("# Skills and Technologies\n\n");

        skills.fieldNames().forEachRemaining(category -> {
            content.append(String.format("## %s\n\n", category));
            JsonNode skillList = skills.get(category);
            if (skillList.isArray()) {
                for (JsonNode skill : skillList) {
                    if (skill.isTextual()) {
                        content.append(String.format("- %s\n", skill.asText()));
                    } else if (skill.isObject()) {
                        String name = skill.get("name").asText();
                        String level = skill.has("level") ? skill.get("level").asText() : "";
                        content.append(String.format("- %s", name));
                        if (!level.isEmpty()) {
                            content.append(String.format(" (%s)", level));
                        }
                        content.append("\n");
                    }
                }
            }
            content.append("\n");
        });

        return new DocumentChunk("personal/skills.md", content.toString());
    }

    // ========== Records ==========

    /**
     * Input document from profile.json
     */
    private record DocumentChunk(
            String path,     // File path (e.g., "personal/profile-about.md")
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
            float[] vector      // Embedding vector (3072 dimensions)
    ) {}
}
