package com.portfolio.tools;

import com.google.adk.tools.Annotations.Schema;
import com.portfolio.service.VectorQueryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * Profile RAG Tools - Personal profile and projects knowledge base for ADK Agents
 *
 * This class provides static methods that ADK Agents can call via FunctionTool.
 * It delegates to VectorQueryService for actual vector search operations.
 *
 * Features:
 * - Semantic search using Google AI embeddings (3072 dimensions)
 * - Profile-based filtering (personal, projects)
 * - Profile knowledge base access via PostgreSQL + pgvector
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
        log.info("[ProfileRAG] VectorQueryService injected successfully");
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
            log.error("[ProfileRAG] Error in queryPersonalInfo", e);
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
            log.error("[ProfileRAG] Error in queryProjects", e);
            return errorResponse(query, e.getMessage());
        }
    }

    // ==================== Utility Methods ====================

    private static void ensureInitialized() {
        if (vectorQueryService == null) {
            log.warn("[ProfileRAG] VectorQueryService not initialized - profile knowledge base may not be available");
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
}
