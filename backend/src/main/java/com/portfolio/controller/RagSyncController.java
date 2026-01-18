package com.portfolio.controller;

import com.portfolio.service.RagSyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * RAG Sync Controller - Push mode RAG synchronization
 *
 * Receives Markdown documents from frontend (during build time),
 * generates embeddings using Google AI SDK, and stores in PostgreSQL.
 */
@RestController
@RequestMapping("/api/rag")
public class RagSyncController {

    private static final Logger log = LoggerFactory.getLogger(RagSyncController.class);
    private static final String SYNC_KEY_HEADER = "X-SYNC-KEY";

    private final RagSyncService ragSyncService;

    public RagSyncController(RagSyncService ragSyncService) {
        this.ragSyncService = ragSyncService;
    }

    /**
     * POST /api/rag/sync
     *
     * Synchronize documents to vector store.
     *
     * Request body:
     * [
     *   { "path": "blog/post-1.md", "content": "# Title\nContent..." },
     *   { "path": "projects/project-a.md", "content": "..." }
     * ]
     *
     * Headers:
     * - X-SYNC-KEY: Must match RAG_SYNC_KEY environment variable
     */
    @PostMapping("/sync")
    public ResponseEntity<SyncResponse> sync(
            @RequestHeader(value = SYNC_KEY_HEADER, required = false) String syncKey,
            @RequestBody List<RagSyncService.DocumentChunk> documents) {

        // Validate API key
        if (!ragSyncService.validateSyncKey(syncKey)) {
            log.warn("Invalid sync key attempt from {}", getClientIp());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new SyncResponse(false, "Invalid or missing sync key", 0));
        }

        if (documents == null || documents.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new SyncResponse(false, "No documents provided", 0));
        }

        log.info("Received sync request for {} documents from {}", documents.size(), getClientIp());

        try {
            int chunksStored = ragSyncService.syncDocuments(documents);
            return ResponseEntity.ok(new SyncResponse(
                    true,
                    "Successfully synchronized " + chunksStored + " chunks",
                    chunksStored
            ));

        } catch (Exception e) {
            log.error("RAG sync failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new SyncResponse(false, "Sync failed: " + e.getMessage(), 0));
        }
    }

    /**
     * POST /api/rag/clear
     *
     * Clear all documents from vector store.
     * Requires X-SYNC-KEY header.
     */
    @PostMapping("/clear")
    public ResponseEntity<ClearResponse> clear(
            @RequestHeader(value = SYNC_KEY_HEADER, required = false) String syncKey) {

        if (!ragSyncService.validateSyncKey(syncKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ClearResponse(false, "Invalid or missing sync key"));
        }

        try {
            int deleted = ragSyncService.clearVectorStore();
            return ResponseEntity.ok(new ClearResponse(true, deleted + " documents cleared"));

        } catch (Exception e) {
            log.error("Failed to clear vector store", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ClearResponse(false, "Clear failed: " + e.getMessage()));
        }
    }

    /**
     * GET /api/rag/health
     *
     * Health check endpoint (no auth required)
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "service", "rag-sync",
                "model", "embedding-001",
                "dimensions", 768
        ));
    }

    /**
     * Extract client IP from request
     */
    private String getClientIp() {
        // In production, might need to check X-Forwarded-For header
        return "unknown";
    }

    // ========== Response DTOs ==========

    public record SyncResponse(
            boolean success,
            String message,
            int chunksStored
    ) {}

    public record ClearResponse(
            boolean success,
            String message
    ) {}
}
