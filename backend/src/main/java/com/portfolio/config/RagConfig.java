package com.portfolio.config;

import com.portfolio.service.VectorQueryService;
import com.portfolio.tools.UnifiedRAGTools;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

/**
 * RAG Configuration - Injects Spring services into static tool classes
 *
 * This bridges the gap between Spring's dependency injection and ADK's static tool methods.
 */
@Configuration
public class RagConfig {

    private static final Logger log = LoggerFactory.getLogger(RagConfig.class);

    private final VectorQueryService vectorQueryService;

    public RagConfig(VectorQueryService vectorQueryService) {
        this.vectorQueryService = vectorQueryService;
    }

    @PostConstruct
    public void init() {
        log.info("[RagConfig] Initializing RAG tools...");

        // Inject VectorQueryService into UnifiedRAGTools
        UnifiedRAGTools.setVectorQueryService(vectorQueryService);

        // Get and log vector store stats
        try {
            var stats = vectorQueryService.getStats();
            log.info("[RagConfig] Vector store initialized: {} chunks, {} documents, {} dimensions",
                    stats.totalChunks(), stats.totalDocuments(), stats.embeddingDimensions());

            if (stats.totalChunks() == 0) {
                log.warn("[RagConfig] Vector store is EMPTY! Please sync documents via POST /api/rag/sync");
            }
        } catch (Exception e) {
            log.error("[RagConfig] Failed to get vector store stats", e);
        }

        log.info("[RagConfig] RAG tools initialized successfully");
    }
}
