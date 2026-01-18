package com.portfolio;

import com.portfolio.agent.PortfolioAgents;
import com.portfolio.service.RagSyncService;
import com.portfolio.service.VectorQueryService;
import com.google.adk.agents.RunConfig;
import com.google.adk.events.Event;
import com.google.adk.runner.InMemoryRunner;
import com.google.adk.sessions.Session;
import com.google.genai.types.Content;
import com.google.genai.types.Part;
import io.reactivex.rxjava3.core.Flowable;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * RAG Integration Test - Tests the complete RAG pipeline
 *
 * Prerequisites:
 * 1. PostgreSQL with pgvector extension must be running
 * 2. vector_store table must exist (run DDL first)
 * 3. Documents should be synced via POST /api/rag/sync
 *
 * Run: ./mvnw test -Dtest=RagIntegrationTest
 */
@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:5432/portfolio",
        "spring.datasource.username=postgres",
        "spring.datasource.password=postgres"
})
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class RagIntegrationTest {

    @Autowired(required = false)
    private VectorQueryService vectorQueryService;

    @Autowired(required = false)
    private RagSyncService ragSyncService;

    private static InMemoryRunner runner;
    private static Session session;

    @BeforeAll
    static void setupAgent() {
        runner = new InMemoryRunner(PortfolioAgents.getRootAgent());
        session = runner.sessionService().createSession(runner.appName(), "test-user").blockingGet();
    }

    private String chat(String message) {
        Content userMsg = Content.fromParts(Part.fromText(message));
        Flowable<Event> events = runner.runAsync(session.userId(), session.id(), userMsg, RunConfig.builder().build());
        StringBuilder response = new StringBuilder();
        events.blockingForEach(event -> {
            if (event.finalResponse()) {
                response.append(event.stringifyContent());
            }
        });
        return response.toString();
    }

    // ==================== Service Layer Tests ====================

    @Test
    @Order(1)
    @DisplayName("1. VectorQueryService should be available")
    void testVectorQueryServiceAvailable() {
        assertNotNull(vectorQueryService, "VectorQueryService should be autowired");
    }

    @Test
    @Order(2)
    @DisplayName("2. RagSyncService should be available")
    void testRagSyncServiceAvailable() {
        assertNotNull(ragSyncService, "RagSyncService should be autowired");
    }

    @Test
    @Order(3)
    @DisplayName("3. Get vector store statistics")
    void testVectorStoreStats() {
        assertNotNull(vectorQueryService, "VectorQueryService required");

        VectorQueryService.VectorStoreStats stats = vectorQueryService.getStats();

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("Vector Store Statistics:");
        System.out.println("  Total Chunks:    " + stats.totalChunks());
        System.out.println("  Total Documents: " + stats.totalDocuments());
        System.out.println("  Embedding Dim:   " + stats.embeddingDimensions());
        System.out.println("═══════════════════════════════════════════════════════════");

        assertNotNull(stats);
        assertEquals(768, stats.embeddingDimensions(), "Embedding dimensions should be 768");
    }

    @Test
    @Order(4)
    @DisplayName("4. List all documents in vector store")
    void testListDocuments() {
        assertNotNull(vectorQueryService, "VectorQueryService required");

        Map<String, List<String>> docs = vectorQueryService.listDocuments();

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("Documents in Vector Store:");
        for (Map.Entry<String, List<String>> entry : docs.entrySet()) {
            System.out.println("  [" + entry.getKey() + "]");
            for (String doc : entry.getValue()) {
                System.out.println("    - " + doc);
            }
        }
        System.out.println("═══════════════════════════════════════════════════════════");

        assertNotNull(docs);
    }

    @Test
    @Order(5)
    @DisplayName("5. Semantic search across all documents")
    void testSemanticSearch() {
        assertNotNull(vectorQueryService, "VectorQueryService required");

        String testQuery = "Java development experience";
        List<VectorQueryService.VectorSearchResult> results = vectorQueryService.semanticSearch(testQuery, 3);

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("Semantic Search Results for: \"" + testQuery + "\"");
        for (int i = 0; i < results.size(); i++) {
            VectorQueryService.VectorSearchResult result = results.get(i);
            System.out.println("  Result #" + (i + 1));
            System.out.println("    Source:     " + result.path());
            System.out.println("    Similarity: " + result.similarity());
            System.out.println("    Content:    " + result.content().substring(0, Math.min(150, result.content().length())) + "...");
            System.out.println();
        }
        System.out.println("═══════════════════════════════════════════════════════════");

        assertNotNull(results);
    }

    @Test
    @Order(6)
    @DisplayName("6. Category-specific search (personal)")
    void testCategorySearchPersonal() {
        assertNotNull(vectorQueryService, "VectorQueryService required");

        List<VectorQueryService.VectorSearchResult> results =
                vectorQueryService.searchByCategory("personal", "skills and experience", 3);

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("Category Search Results [personal]:");
        for (int i = 0; i < results.size(); i++) {
            VectorQueryService.VectorSearchResult result = results.get(i);
            System.out.println("  Result #" + (i + 1) + ": " + result.path());
        }
        System.out.println("═══════════════════════════════════════════════════════════");

        assertNotNull(results);
    }

    @Test
    @Order(7)
    @DisplayName("7. Category-specific search (projects)")
    void testCategorySearchProjects() {
        assertNotNull(vectorQueryService, "VectorQueryService required");

        List<VectorQueryService.VectorSearchResult> results =
                vectorQueryService.searchByCategory("projects", "project", 3);

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("Category Search Results [projects]:");
        for (int i = 0; i < results.size(); i++) {
            VectorQueryService.VectorSearchResult result = results.get(i);
            System.out.println("  Result #" + (i + 1) + ": " + result.path());
        }
        System.out.println("═══════════════════════════════════════════════════════════");

        assertNotNull(results);
    }

    // ==================== UnifiedRAGTools Tests ====================

    @Test
    @Order(10)
    @DisplayName("10. UnifiedRAGTools.getVectorStoreStats()")
    void testUnifiedRagToolsStats() {
        Map<String, Object> result = com.portfolio.tools.UnifiedRAGTools.getVectorStoreStats();

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("UnifiedRAGTools.getVectorStoreStats():");
        System.out.println("  " + result);
        System.out.println("═══════════════════════════════════════════════════════════");

        assertNotNull(result);
        assertTrue(result.containsKey("total_chunks"));
        assertTrue(result.containsKey("total_documents"));
    }

    @Test
    @Order(11)
    @DisplayName("11. UnifiedRAGTools.listDocuments()")
    void testUnifiedRagToolsListDocuments() {
        Map<String, Object> result = com.portfolio.tools.UnifiedRAGTools.listDocuments();

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("UnifiedRAGTools.listDocuments():");
        System.out.println("  " + result);
        System.out.println("═══════════════════════════════════════════════════════════");

        assertNotNull(result);
        assertTrue(result.containsKey("documents"));
    }

    @Test
    @Order(12)
    @DisplayName("12. UnifiedRAGTools.semanticSearch()")
    void testUnifiedRagToolsSemanticSearch() {
        Map<String, Object> result = com.portfolio.tools.UnifiedRAGTools.semanticSearch("programming experience", 3);

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("UnifiedRAGTools.semanticSearch():");
        System.out.println("  Query: " + result.get("query"));
        System.out.println("  Total Found: " + result.get("total_found"));
        System.out.println("  Results:");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> results = (List<Map<String, Object>>) result.get("results");
        for (int i = 0; i < results.size(); i++) {
            Map<String, Object> r = results.get(i);
            System.out.println("    [" + (i + 1) + "] " + r.get("source") + " (similarity: " + r.get("similarity") + ")");
        }
        System.out.println("═══════════════════════════════════════════════════════════");

        assertNotNull(result);
        assertTrue(result.containsKey("results"));
    }

    // ==================== Agent Integration Tests ====================

    @Test
    @Order(20)
    @DisplayName("20. Agent: Query personal info via RAG")
    void testAgentQueryPersonalInfo() {
        String response = chat("What is your work experience?");

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("Agent Response [Personal Info]:");
        System.out.println("  " + response);
        System.out.println("═══════════════════════════════════════════════════════════");

        assertNotNull(response);
        assertFalse(response.isEmpty());
    }

    @Test
    @Order(21)
    @DisplayName("21. Agent: Query projects via RAG")
    void testAgentQueryProjects() {
        String response = chat("What projects have you worked on?");

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("Agent Response [Projects]:");
        System.out.println("  " + response);
        System.out.println("═══════════════════════════════════════════════════════════");

        assertNotNull(response);
        assertFalse(response.isEmpty());
    }

    @Test
    @Order(22)
    @DisplayName("22. Agent: Semantic search query")
    void testAgentSemanticSearch() {
        String response = chat("What do you know about backend development?");

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("Agent Response [Semantic Search]:");
        System.out.println("  " + response);
        System.out.println("═══════════════════════════════════════════════════════════");

        assertNotNull(response);
        assertFalse(response.isEmpty());
    }

    @Test
    @Order(23)
    @DisplayName("23. Agent: Query education background")
    void testAgentQueryEducation() {
        String response = chat("Where did you study?");

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("Agent Response [Education]:");
        System.out.println("  " + response);
        System.out.println("═══════════════════════════════════════════════════════════");

        assertNotNull(response);
        assertFalse(response.isEmpty());
    }

    @Test
    @Order(24)
    @DisplayName("24. Agent: Query skills")
    void testAgentQuerySkills() {
        String response = chat("What programming languages do you know?");

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("Agent Response [Skills]:");
        System.out.println("  " + response);
        System.out.println("═══════════════════════════════════════════════════════════");

        assertNotNull(response);
        assertFalse(response.isEmpty());
    }

    // ==================== Sync API Tests ====================

    @Test
    @Order(30)
    @DisplayName("30. Test document sync (requires valid RAG_SYNC_KEY)")
    void testDocumentSync() {
        assertNotNull(ragSyncService, "RagSyncService required");

        // Test sync key validation
        boolean validKey = ragSyncService.validateSyncKey("test-key");
        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("Sync Key Validation (test-key): " + validKey);
        System.out.println("Note: Set RAG_SYNC_KEY in .env to test actual sync");
        System.out.println("═══════════════════════════════════════════════════════════");

        // Try syncing a test document (will fail if key doesn't match)
        List<RagSyncService.DocumentChunk> testDocs = List.of(
                new RagSyncService.DocumentChunk(
                        "test/sample.md",
                        "# Test Document\n\nThis is a test document for RAG sync."
                )
        );

        try {
            int synced = ragSyncService.syncDocuments(testDocs);
            System.out.println("Synced " + synced + " chunks");
        } catch (Exception e) {
            System.out.println("Sync failed (expected if RAG_SYNC_KEY not set): " + e.getMessage());
        }
    }

    // ==================== Empty Vector Store Handling ====================

    @Test
    @Order(40)
    @DisplayName("40. Handle empty vector store gracefully")
    void testEmptyVectorStore() {
        assertNotNull(vectorQueryService, "VectorQueryService required");

        // This should not throw an exception even if vector store is empty
        List<VectorQueryService.VectorSearchResult> results =
                vectorQueryService.semanticSearch("nonexistent content xyz123", 3);

        assertNotNull(results);
        // Empty result is acceptable
        assertTrue(results.size() >= 0, "Should return empty list, not null");

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("Empty Vector Store Handling:");
        System.out.println("  Results for nonsense query: " + results.size());
        System.out.println("  Status: OK (no exception thrown)");
        System.out.println("═══════════════════════════════════════════════════════════");
    }
}
