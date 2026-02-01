package com.portfolio.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Profile RAG Health Check Controller
 *
 * Profile sync now happens automatically on backend startup via RagConfig.
 * This controller only provides health check endpoint for monitoring.
 */
@RestController
@RequestMapping("/rag")
public class RagSyncController {

    private static final Logger log = LoggerFactory.getLogger(RagSyncController.class);

    /**
     * GET /api/rag/health
     *
     * Health check endpoint for RAG system
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "service", "profile-rag",
                "model", "gemini-embedding-001",
                "dimensions", 3072,
                "synced", "startup"));
    }
}
