package com.portfolio.config;

import com.portfolio.service.ProfileSyncService;
import com.portfolio.service.VectorQueryService;
import com.portfolio.tools.UnifiedRAGTools;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

/**
 * Profile RAG Configuration - Injects Spring services into static tool classes
 *
 * This bridges the gap between Spring's dependency injection and ADK's static tool methods.
 * Only Profile RAG (personal info and projects) is supported.
 */
@Configuration
public class RagConfig {

    private static final Logger log = LoggerFactory.getLogger(RagConfig.class);

    private final VectorQueryService vectorQueryService;
    private final ProfileSyncService profileSyncService;

    public RagConfig(
            ProfileSyncService profileSyncService,
            VectorQueryService vectorQueryService) {
        this.profileSyncService = profileSyncService;
        this.vectorQueryService = vectorQueryService;
    }

    @PostConstruct
    public void init() {
        log.info("[RagConfig] Initializing Profile RAG tools...");

        // Inject VectorQueryService into UnifiedRAGTools
        UnifiedRAGTools.setVectorQueryService(vectorQueryService);

        // Load profile.json from resources and sync on startup
        try {
            log.info("[RagConfig] Loading profile.json and generating embeddings...");
            String profileJson = profileSyncService.loadProfileFromResources();
            int chunksStored = profileSyncService.syncProfile(profileJson);
            log.info("[RagConfig] ✅ Profile synced successfully: {} chunks", chunksStored);
        } catch (Exception e) {
            log.error("[RagConfig] ❌ Failed to sync profile on startup", e);
            // Don't prevent application from starting - RAG unavailable but other features work
        }

        // Get and log vector store stats
        try {
            var stats = vectorQueryService.getStats();
            log.info("[RagConfig] Profile vector store initialized: {} chunks, {} documents, {} dimensions",
                    stats.totalChunks(), stats.totalDocuments(), stats.embeddingDimensions());
        } catch (Exception e) {
            log.error("[RagConfig] Failed to get vector store stats", e);
        }

        log.info("[RagConfig] Profile RAG tools initialized successfully");
    }
}
