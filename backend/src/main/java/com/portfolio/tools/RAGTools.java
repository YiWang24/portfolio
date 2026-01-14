package com.portfolio.tools;

import com.google.adk.tools.Annotations.Schema;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.stream.*;

public class RAGTools {

    private static final String CONTENT_DIR = resolveContentDir();
    private static final Map<String, String> knowledgeCache = new HashMap<>();
    private static final Map<String, String> fileCategories = new HashMap<>();

    static {
        loadKnowledge();
    }

    private static String resolveContentDir() {
        String envDir = System.getenv("CONTENT_DIR");
        if (envDir != null && !envDir.isBlank()) {
            return envDir;
        }
        Path siblingContent = Paths.get("..", "content");
        if (Files.exists(siblingContent)) {
            return siblingContent.toString();
        }
        return "content";
    }

    private static void loadKnowledge() {
        try {
            Path dir = Paths.get(CONTENT_DIR);
            if (Files.exists(dir)) {
                Files.walk(dir)
                        .filter(p -> p.toString().endsWith(".md") || p.toString().endsWith(".txt"))
                        .forEach(p -> {
                            try {
                                String relativePath = dir.relativize(p).toString();
                                String category = relativePath.contains("/") ? 
                                        relativePath.split("/")[0] : "general";
                                String content = Files.readString(p);
                                knowledgeCache.put(relativePath, content);
                                fileCategories.put(relativePath, category);
                            } catch (IOException ignored) {}
                        });
            }
            System.out.println("[RAG] Loaded " + knowledgeCache.size() + " documents from " + CONTENT_DIR);
        } catch (IOException e) {
            System.err.println("[RAG] Failed to load knowledge: " + e.getMessage());
        }
    }

    @Schema(description = "Search personal information including resume, experience, skills, and contact info")
    public static Map<String, Object> queryPersonalInfo(
            @Schema(name = "question", description = "Question about experience, skills, education, or contact") String question) {
        return searchInCategory("personal", question);
    }

    @Schema(description = "Search project descriptions and technical details")
    public static Map<String, Object> queryProjects(
            @Schema(name = "query", description = "Project name or technology to search for") String query) {
        return searchInCategory("projects", query);
    }

    @Schema(description = "Search blog posts and technical articles")
    public static Map<String, Object> queryBlogPosts(
            @Schema(name = "topic", description = "Topic or keyword to search in blog posts") String topic) {
        return searchInCategory("blog", topic);
    }

    @Schema(description = "Search across all knowledge base content")
    public static Map<String, Object> searchAllContent(
            @Schema(name = "query", description = "Search query") String query) {
        String q = query.toLowerCase();
        List<Map<String, String>> results = new ArrayList<>();

        for (Map.Entry<String, String> entry : knowledgeCache.entrySet()) {
            String content = entry.getValue();
            if (content.toLowerCase().contains(q) || matchesKeywords(content.toLowerCase(), q)) {
                List<String> relevantChunks = extractRelevantChunks(content, q);
                for (String chunk : relevantChunks) {
                    results.add(Map.of(
                            "source", entry.getKey(),
                            "category", fileCategories.getOrDefault(entry.getKey(), "general"),
                            "content", chunk
                    ));
                    if (results.size() >= 5) break;
                }
            }
            if (results.size() >= 5) break;
        }

        return Map.of("results", results, "query", query, "total_found", results.size());
    }

    @Schema(description = "List all available knowledge base documents")
    public static Map<String, Object> listDocuments() {
        Map<String, List<String>> byCategory = new HashMap<>();
        
        for (Map.Entry<String, String> entry : fileCategories.entrySet()) {
            byCategory.computeIfAbsent(entry.getValue(), k -> new ArrayList<>())
                    .add(entry.getKey());
        }
        
        return Map.of(
                "documents", byCategory,
                "total", knowledgeCache.size()
        );
    }

    private static Map<String, Object> searchInCategory(String category, String query) {
        String q = query.toLowerCase();
        List<Map<String, String>> results = new ArrayList<>();

        for (Map.Entry<String, String> entry : knowledgeCache.entrySet()) {
            if (!category.equals(fileCategories.get(entry.getKey()))) continue;
            
            String content = entry.getValue();
            if (content.toLowerCase().contains(q) || matchesKeywords(content.toLowerCase(), q)) {
                List<String> relevantChunks = extractRelevantChunks(content, q);
                for (String chunk : relevantChunks) {
                    results.add(Map.of(
                            "source", entry.getKey(),
                            "content", chunk
                    ));
                }
            }
        }

        // If no specific match, return summary from category
        if (results.isEmpty()) {
            for (Map.Entry<String, String> entry : knowledgeCache.entrySet()) {
                if (category.equals(fileCategories.get(entry.getKey()))) {
                    results.add(Map.of(
                            "source", entry.getKey(),
                            "content", truncate(entry.getValue(), 500)
                    ));
                }
            }
        }

        return Map.of("results", results, "query", query, "category", category);
    }

    private static List<String> extractRelevantChunks(String content, String query) {
        List<String> chunks = new ArrayList<>();
        String[] paragraphs = content.split("\n\n");
        
        for (String para : paragraphs) {
            if (para.toLowerCase().contains(query) || matchesKeywords(para.toLowerCase(), query)) {
                chunks.add(para.trim());
                if (chunks.size() >= 3) break;
            }
        }
        
        return chunks;
    }

    private static boolean matchesKeywords(String content, String query) {
        String[] keywords = query.split("\\s+");
        int matches = 0;
        for (String kw : keywords) {
            if (kw.length() > 2 && content.contains(kw)) matches++;
        }
        return matches >= Math.max(1, keywords.length / 2);
    }

    private static String truncate(String text, int maxLen) {
        return text.length() > maxLen ? text.substring(0, maxLen) + "..." : text;
    }

    // Keep old method for backward compatibility
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
}
