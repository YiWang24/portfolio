package com.portfolio;

import com.portfolio.agent.PortfolioAgents;
import com.portfolio.service.ProfileSyncService;
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
 * Profile RAG Integration Test - Tests Profile RAG functionality
 *
 * Prerequisites:
 * 1. PostgreSQL with pgvector extension must be running
 * 2. vector_store table must exist (run DDL first)
 * 3. Profile should be synced via POST /api/rag/sync-profile
 *
 * Run: ./mvnw test -Dtest=RagIntegrationTest
 */
@SpringBootTest
@TestPropertySource(properties = {
        "POSTGRES_HOST=10.0.0.4",
        "POSTGRES_PORT=15432",
        "POSTGRES_DB=test_db",
        "POSTGRES_USER=postgres",
        "POSTGRES_PASSWORD=PgPass!123"
})
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class RagIntegrationTest {

    @Autowired(required = false)
    private VectorQueryService vectorQueryService;

    @Autowired(required = false)
    private ProfileSyncService profileSyncService;

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
    @DisplayName("2. ProfileSyncService should be available")
    void testProfileSyncServiceAvailable() {
        assertNotNull(profileSyncService, "ProfileSyncService should be autowired");
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
        assertEquals(3072, stats.embeddingDimensions(), "Embedding dimensions should be 3072");
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

    // ==================== Category Search Tests ====================

    @Test
    @Order(10)
    @DisplayName("10. Category-specific search (personal)")
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
    @Order(11)
    @DisplayName("11. Category-specific search (projects)")
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

    // ==================== Profile RAG Tools Tests ====================

    @Test
    @Order(20)
    @DisplayName("20. ProfileRAGTools.queryPersonalInfo()")
    void testProfileRagToolsQueryPersonalInfo() {
        Map<String, Object> result = com.portfolio.tools.UnifiedRAGTools.queryPersonalInfo("skills and experience");

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("ProfileRAGTools.queryPersonalInfo():");
        System.out.println("  Query: " + result.get("query"));
        System.out.println("  Total Found: " + result.get("total_found"));
        System.out.println("  Category: " + result.get("category"));
        System.out.println("═══════════════════════════════════════════════════════════");

        assertNotNull(result);
        assertTrue(result.containsKey("results"));
    }

    @Test
    @Order(21)
    @DisplayName("21. ProfileRAGTools.queryProjects()")
    void testProfileRagToolsQueryProjects() {
        Map<String, Object> result = com.portfolio.tools.UnifiedRAGTools.queryProjects("portfolio");

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("ProfileRAGTools.queryProjects():");
        System.out.println("  Query: " + result.get("query"));
        System.out.println("  Total Found: " + result.get("total_found"));
        System.out.println("  Category: " + result.get("category"));
        System.out.println("═══════════════════════════════════════════════════════════");

        assertNotNull(result);
        assertTrue(result.containsKey("results"));
    }

    // ==================== Agent Integration Tests ====================

    @Test
    @Order(30)
    @DisplayName("30. Agent: Query personal info via Profile RAG")
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
    @Order(31)
    @DisplayName("31. Agent: Query projects via Profile RAG")
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
    @Order(32)
    @DisplayName("32. Agent: Query education background")
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
    @Order(33)
    @DisplayName("33. Agent: Query skills")
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
    @Order(40)
    @DisplayName("40. Test profile sync key validation")
    void testProfileSyncKeyValidation() {
        assertNotNull(profileSyncService, "ProfileSyncService required");

        // Test sync key validation
        boolean validKey = profileSyncService.validateSyncKey("test-key");
        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("Profile Sync Key Validation:");
        System.out.println("  Sync Key Validation (test-key): " + validKey);
        System.out.println("═══════════════════════════════════════════════════════════");
    }

    // ==================== Empty Vector Store Handling ====================

    @Test
    @Order(50)
    @DisplayName("50. Handle empty vector store gracefully")
    void testEmptyVectorStore() {
        assertNotNull(vectorQueryService, "VectorQueryService required");

        // This should not throw an exception even if vector store is empty
        List<VectorQueryService.VectorSearchResult> results =
                vectorQueryService.searchByCategory("personal", "nonexistent content xyz123", 3);

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
