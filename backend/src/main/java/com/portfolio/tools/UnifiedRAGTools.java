package com.portfolio.tools;

import com.google.adk.tools.Annotations.Schema;
import com.portfolio.service.VectorQueryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * Unified RAG Tools - Integrated knowledge base access for ADK Agents
 *
 * This class provides static methods that ADK Agents can call via FunctionTool.
 * It delegates to VectorQueryService for actual vector search operations.
 *
 * Features:
 * - Semantic search using Google AI embeddings (768 dimensions)
 * - Category-based filtering (personal, projects, blog, notes)
 * - Full knowledge base access via PostgreSQL + pgvector
 */
public class UnifiedRAGTools {

    private static final Logger log = LoggerFactory.getLogger(UnifiedRAGTools.class);

    // Static reference to the service (set by Spring on initialization)
    private static VectorQueryService vectorQueryService;

    /**
     * Called by Spring to inject the VectorQueryService
     */
    public static void setVectorQueryService(VectorQueryService service) {
        vectorQueryService = service;
        log.info("[UnifiedRAG] VectorQueryService injected successfully");
    }

    // ==================== Personal Information ====================

    @Schema(description = "Search personal information including resume, experience, skills, education, and contact details")
    public static Map<String, Object> queryPersonalInfo(
            @Schema(name = "question", description = "Question about experience, skills, education, or contact info") String question) {
        ensureInitialized();

        try {
            List<VectorQueryService.VectorSearchResult> results =
                    vectorQueryService.searchByCategory("personal", question, 5);

            return buildResponse(results, question, "personal");

        } catch (Exception e) {
            log.error("[UnifiedRAG] Error in queryPersonalInfo", e);
            return errorResponse(question, e.getMessage());
        }
    }

    // ==================== Projects ====================

    @Schema(description = "Search project descriptions and technical details")
    public static Map<String, Object> queryProjects(
            @Schema(name = "query", description = "Project name or technology to search for") String query) {
        ensureInitialized();

        try {
            List<VectorQueryService.VectorSearchResult> results =
                    vectorQueryService.searchByCategory("projects", query, 5);

            return buildResponse(results, query, "projects");

        } catch (Exception e) {
            log.error("[UnifiedRAG] Error in queryProjects", e);
            return errorResponse(query, e.getMessage());
        }
    }

    // ==================== Blog Posts ====================

    @Schema(description = "Search blog posts and technical articles")
    public static Map<String, Object> queryBlogPosts(
            @Schema(name = "topic", description = "Topic or keyword to search in blog posts") String topic) {
        ensureInitialized();

        try {
            List<VectorQueryService.VectorSearchResult> results =
                    vectorQueryService.searchByCategory("blog", topic, 5);

            return buildResponse(results, topic, "blog");

        } catch (Exception e) {
            log.error("[UnifiedRAG] Error in queryBlogPosts", e);
            return errorResponse(topic, e.getMessage());
        }
    }

    // ==================== Notes ====================

    @Schema(description = "Search personal notes and documentation")
    public static Map<String, Object> queryNotes(
            @Schema(name = "query", description = "Query to search in notes") String query) {
        ensureInitialized();

        try {
            List<VectorQueryService.VectorSearchResult> results =
                    vectorQueryService.searchByCategory("notes", query, 5);

            return buildResponse(results, query, "notes");

        } catch (Exception e) {
            log.error("[UnifiedRAG] Error in queryNotes", e);
            return errorResponse(query, e.getMessage());
        }
    }

    // ==================== Global Semantic Search ====================

    @Schema(description = "Semantic search across ALL knowledge base documents using vector similarity")
    public static Map<String, Object> semanticSearch(
            @Schema(name = "query", description = "Natural language query to search for") String query,
            @Schema(name = "topK", description = "Number of results to return (default 3)") Integer topK) {
        ensureInitialized();

        try {
            int k = topK != null && topK > 0 ? Math.min(topK, 10) : 3;

            List<VectorQueryService.VectorSearchResult> results =
                    vectorQueryService.semanticSearch(query, k);

            List<Map<String, Object>> formattedResults = new ArrayList<>();
            for (VectorQueryService.VectorSearchResult result : results) {
                formattedResults.add(result.toMap());
            }

            return Map.of(
                    "results", formattedResults,
                    "query", query,
                    "total_found", formattedResults.size()
            );

        } catch (Exception e) {
            log.error("[UnifiedRAG] Error in semanticSearch", e);
            return errorResponse(query, e.getMessage());
        }
    }

    // ==================== Category Search ====================

    @Schema(description = "Search documents within a specific category using semantic similarity")
    public static Map<String, Object> searchByCategory(
            @Schema(name = "category", description = "Category to search: personal, projects, blog, notes") String category,
            @Schema(name = "query", description = "Search query") String query) {
        ensureInitialized();

        try {
            List<VectorQueryService.VectorSearchResult> results =
                    vectorQueryService.searchByCategory(category, query, 5);

            return buildResponse(results, query, category);

        } catch (Exception e) {
            log.error("[UnifiedRAG] Error in searchByCategory", e);
            return errorResponse(query, e.getMessage());
        }
    }

    // ==================== List Documents ====================

    @Schema(description = "List all available knowledge base documents grouped by category")
    public static Map<String, Object> listDocuments() {
        ensureInitialized();

        try {
            Map<String, List<String>> docs = vectorQueryService.listDocuments();
            VectorQueryService.VectorStoreStats stats = vectorQueryService.getStats();

            return Map.of(
                    "documents", docs,
                    "total_documents", stats.totalDocuments(),
                    "total_chunks", stats.totalChunks(),
                    "embedding_dimensions", stats.embeddingDimensions()
            );

        } catch (Exception e) {
            log.error("[UnifiedRAG] Error in listDocuments", e);
            return Map.of("error", e.getMessage());
        }
    }

    // ==================== Vector Store Stats ====================

    @Schema(description = "Get statistics about the vector store")
    public static Map<String, Object> getVectorStoreStats() {
        ensureInitialized();

        try {
            VectorQueryService.VectorStoreStats stats = vectorQueryService.getStats();

            return Map.of(
                    "total_chunks", stats.totalChunks(),
                    "total_documents", stats.totalDocuments(),
                    "embedding_dimensions", stats.embeddingDimensions(),
                    "status", stats.totalChunks() > 0 ? "ready" : "empty"
            );

        } catch (Exception e) {
            log.error("[UnifiedRAG] Error in getVectorStoreStats", e);
            return Map.of("error", e.getMessage());
        }
    }

    // ==================== Utility Methods ====================

    private static void ensureInitialized() {
        if (vectorQueryService == null) {
            log.warn("[UnifiedRAG] VectorQueryService not initialized - knowledge base may not be available");
        }
    }

    private static Map<String, Object> buildResponse(
            List<VectorQueryService.VectorSearchResult> results,
            String query,
            String category) {

        List<Map<String, Object>> formattedResults = new ArrayList<>();

        for (VectorQueryService.VectorSearchResult result : results) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("source", result.path());
            item.put("content", result.content());
            item.put("similarity", Math.round(result.similarity() * 1000.0) / 1000.0);

            // Extract source file name from path
            String fileName = result.path();
            if (fileName.contains("/")) {
                fileName = fileName.substring(fileName.lastIndexOf("/") + 1);
            }
            item.put("file", fileName);

            formattedResults.add(item);
        }

        return Map.of(
                "results", formattedResults,
                "query", query,
                "category", category,
                "total_found", formattedResults.size()
        );
    }

    private static Map<String, Object> errorResponse(String query, String error) {
        return Map.of(
                "error", error,
                "query", query,
                "results", Collections.emptyList(),
                "total_found", 0
        );
    }

    // ==================== Legacy Compatibility ====================

    @Schema(description = "Query resume knowledge base (legacy - use queryPersonalInfo instead)")
    public static Map<String, Object> queryResumeKnowledge(
            @Schema(name = "question", description = "Question about experience, skills, or background") String question) {
        return queryPersonalInfo(question);
    }

    @Schema(description = "Query technical documentation (legacy - use queryBlogPosts instead)")
    public static Map<String, Object> queryTechDocs(
            @Schema(name = "concept", description = "Technical concept to search for") String concept) {
        return queryBlogPosts(concept);
    }

    @Schema(description = "Search across all content (legacy - use semanticSearch instead)")
    public static Map<String, Object> searchAllContent(
            @Schema(name = "query", description = "Search query") String query) {
        return semanticSearch(query, 5);
    }

    @Schema(description = "List knowledge base (legacy - use listDocuments instead)")
    public static Map<String, Object> listKnowledgeBase() {
        return listDocuments();
    }
}
