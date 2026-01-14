package com.portfolio.tools;

import com.google.adk.tools.Annotations.Schema;
import com.portfolio.config.EnvConfig;
import okhttp3.*;
import com.google.gson.*;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

public class KnowledgeTools {

    // Support both local dev (../content) and Docker (/app/content)
    private static final String CONTENT_DIR = System.getenv("CONTENT_DIR") != null 
            ? System.getenv("CONTENT_DIR") 
            : (new java.io.File("/app/content").exists() ? "/app/content" : "../content");
    private static final Map<String, Document> documents = new ConcurrentHashMap<>();
    private static final Map<String, float[]> embeddings = new ConcurrentHashMap<>();
    private static WatchService watchService;
    private static volatile boolean watching = false;

    static {
        loadDocuments();
        startFileWatcher();
    }

    // ==================== 向量搜索 ====================

    @Schema(description = "Semantic search across all knowledge base documents using vector similarity")
    public static Map<String, Object> semanticSearch(
            @Schema(name = "query", description = "Natural language query to search for") String query,
            @Schema(name = "topK", description = "Number of results to return (default 3)") Integer topK) {
        int k = topK != null ? topK : 3;
        float[] queryVec = simpleEmbed(query);
        
        List<Map<String, Object>> results = new ArrayList<>();
        List<Map.Entry<String, Float>> scores = new ArrayList<>();
        
        for (Map.Entry<String, float[]> entry : embeddings.entrySet()) {
            float score = cosineSimilarity(queryVec, entry.getValue());
            scores.add(Map.entry(entry.getKey(), score));
        }
        
        scores.sort((a, b) -> Float.compare(b.getValue(), a.getValue()));
        
        for (int i = 0; i < Math.min(k, scores.size()); i++) {
            String docId = scores.get(i).getKey();
            Document doc = documents.get(docId);
            if (doc != null) {
                Map<String, Object> result = new HashMap<>();
                result.put("source", doc.path);
                result.put("category", doc.category);
                result.put("content", truncate(doc.content, 800));
                result.put("score", scores.get(i).getValue());
                results.add(result);
            }
        }
        
        return Map.of("results", results, "query", query, "total", results.size());
    }

    @Schema(description = "Search documents by category (personal, projects, blog)")
    public static Map<String, Object> searchByCategory(
            @Schema(name = "category", description = "Category: personal, projects, or blog") String category,
            @Schema(name = "query", description = "Search query") String query) {
        float[] queryVec = simpleEmbed(query);
        List<Map<String, Object>> results = new ArrayList<>();
        
        for (Map.Entry<String, Document> entry : documents.entrySet()) {
            if (!entry.getValue().category.equals(category)) continue;
            
            float score = cosineSimilarity(queryVec, embeddings.getOrDefault(entry.getKey(), new float[64]));
            if (score > 0.3f || entry.getValue().content.toLowerCase().contains(query.toLowerCase())) {
                Map<String, Object> result = new HashMap<>();
                result.put("source", entry.getValue().path);
                result.put("content", truncate(entry.getValue().content, 600));
                result.put("score", score);
                results.add(result);
            }
        }
        
        results.sort((a, b) -> Float.compare((Float) b.get("score"), (Float) a.get("score")));
        return Map.of("results", results.subList(0, Math.min(3, results.size())), "category", category);
    }

    @Schema(description = "List all documents in the knowledge base with their categories")
    public static Map<String, Object> listKnowledgeBase() {
        Map<String, List<String>> byCategory = new HashMap<>();
        for (Document doc : documents.values()) {
            byCategory.computeIfAbsent(doc.category, k -> new ArrayList<>()).add(doc.path);
        }
        return Map.of("documents", byCategory, "total", documents.size(), "indexed", embeddings.size());
    }

    // ==================== 联网搜索 ====================

    @Schema(description = "Search the web for current information using Tavily API")
    public static Map<String, Object> webSearch(
            @Schema(name = "query", description = "Search query for web search") String query,
            @Schema(name = "maxResults", description = "Maximum results (default 3)") Integer maxResults) {
        String apiKey = EnvConfig.get("TAVILY_API_KEY");
        if (apiKey == null || apiKey.startsWith("your-")) {
            return Map.of("error", "TAVILY_API_KEY not configured", "query", query);
        }
        
        int max = maxResults != null ? maxResults : 3;
        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();
        
        JsonObject body = new JsonObject();
        body.addProperty("api_key", apiKey);
        body.addProperty("query", query);
        body.addProperty("max_results", max);
        body.addProperty("include_answer", true);
        
        Request request = new Request.Builder()
                .url("https://api.tavily.com/search")
                .post(RequestBody.create(body.toString(), MediaType.parse("application/json")))
                .build();
        
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                return Map.of("error", "Search failed: " + response.code(), "query", query);
            }
            
            JsonObject json = JsonParser.parseString(response.body().string()).getAsJsonObject();
            List<Map<String, String>> results = new ArrayList<>();
            
            if (json.has("results")) {
                for (JsonElement el : json.getAsJsonArray("results")) {
                    JsonObject r = el.getAsJsonObject();
                    Map<String, String> item = new HashMap<>();
                    item.put("title", r.has("title") ? r.get("title").getAsString() : "");
                    item.put("url", r.has("url") ? r.get("url").getAsString() : "");
                    item.put("content", r.has("content") ? truncate(r.get("content").getAsString(), 300) : "");
                    results.add(item);
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("query", query);
            result.put("answer", json.has("answer") ? json.get("answer").getAsString() : null);
            result.put("results", results);
            return result;
        } catch (Exception e) {
            return Map.of("error", e.getMessage(), "query", query);
        }
    }

    // ==================== 文件监控 ====================

    private static void loadDocuments() {
        try {
            Path dir = Paths.get(CONTENT_DIR);
            if (!Files.exists(dir)) return;
            
            Files.walk(dir)
                    .filter(p -> p.toString().endsWith(".md") || p.toString().endsWith(".txt"))
                    .forEach(KnowledgeTools::indexDocument);
            
            System.out.println("[Knowledge] Indexed " + documents.size() + " documents");
        } catch (IOException e) {
            System.err.println("[Knowledge] Load failed: " + e.getMessage());
        }
    }

    private static void indexDocument(Path path) {
        try {
            String content = Files.readString(path);
            String relativePath = Paths.get(CONTENT_DIR).relativize(path).toString();
            String category = relativePath.contains("/") ? relativePath.split("/")[0] : "general";
            
            Document doc = new Document(relativePath, category, content);
            documents.put(relativePath, doc);
            embeddings.put(relativePath, simpleEmbed(content));
            
            System.out.println("[Knowledge] Indexed: " + relativePath);
        } catch (IOException e) {
            System.err.println("[Knowledge] Failed to index " + path + ": " + e.getMessage());
        }
    }

    private static void startFileWatcher() {
        if (watching) return;
        
        try {
            watchService = FileSystems.getDefault().newWatchService();
            Path contentPath = Paths.get(CONTENT_DIR);
            if (!Files.exists(contentPath)) return;
            
            // Register content dir and subdirs
            Files.walk(contentPath)
                    .filter(Files::isDirectory)
                    .forEach(p -> {
                        try {
                            p.register(watchService, 
                                    StandardWatchEventKinds.ENTRY_CREATE,
                                    StandardWatchEventKinds.ENTRY_MODIFY,
                                    StandardWatchEventKinds.ENTRY_DELETE);
                        } catch (IOException ignored) {}
                    });
            
            watching = true;
            Thread watchThread = new Thread(() -> {
                while (watching) {
                    try {
                        WatchKey key = watchService.poll(1, TimeUnit.SECONDS);
                        if (key == null) continue;
                        
                        for (WatchEvent<?> event : key.pollEvents()) {
                            Path changed = ((Path) key.watchable()).resolve((Path) event.context());
                            if (!changed.toString().endsWith(".md") && !changed.toString().endsWith(".txt")) continue;
                            
                            if (event.kind() == StandardWatchEventKinds.ENTRY_DELETE) {
                                String rel = Paths.get(CONTENT_DIR).relativize(changed).toString();
                                documents.remove(rel);
                                embeddings.remove(rel);
                                System.out.println("[Knowledge] Removed: " + rel);
                            } else {
                                indexDocument(changed);
                            }
                        }
                        key.reset();
                    } catch (InterruptedException e) {
                        break;
                    }
                }
            }, "knowledge-watcher");
            watchThread.setDaemon(true);
            watchThread.start();
            
            System.out.println("[Knowledge] File watcher started");
        } catch (IOException e) {
            System.err.println("[Knowledge] Watcher failed: " + e.getMessage());
        }
    }

    @Schema(description = "Manually refresh the knowledge base index")
    public static Map<String, Object> refreshIndex() {
        documents.clear();
        embeddings.clear();
        loadDocuments();
        return Map.of("status", "refreshed", "documents", documents.size());
    }

    // ==================== 工具方法 ====================

    // Simple bag-of-words embedding (production should use real embedding model)
    private static float[] simpleEmbed(String text) {
        float[] vec = new float[64];
        String lower = text.toLowerCase();
        String[] words = lower.split("\\W+");
        
        for (String word : words) {
            if (word.length() < 2) continue;
            int hash = Math.abs(word.hashCode()) % 64;
            vec[hash] += 1.0f;
        }
        
        // Normalize
        float norm = 0;
        for (float v : vec) norm += v * v;
        norm = (float) Math.sqrt(norm);
        if (norm > 0) {
            for (int i = 0; i < vec.length; i++) vec[i] /= norm;
        }
        return vec;
    }

    private static float cosineSimilarity(float[] a, float[] b) {
        float dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return (float) (dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8));
    }

    private static String truncate(String text, int max) {
        return text.length() > max ? text.substring(0, max) + "..." : text;
    }

    private static class Document {
        final String path, category, content;
        Document(String path, String category, String content) {
            this.path = path;
            this.category = category;
            this.content = content;
        }
    }
}
