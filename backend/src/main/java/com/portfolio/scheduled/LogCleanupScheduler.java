package com.portfolio.scheduled;

import com.portfolio.config.ApiLoggingProperties;
import com.portfolio.service.ApiLoggingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled task for cleaning up old API logs
 * Runs daily at 2 AM by default
 */
@Component
public class LogCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(LogCleanupScheduler.class);

    private final ApiLoggingService apiLoggingService;
    private final ApiLoggingProperties properties;

    public LogCleanupScheduler(
        ApiLoggingService apiLoggingService,
        ApiLoggingProperties properties
    ) {
        this.apiLoggingService = apiLoggingService;
        this.properties = properties;
    }

    /**
     * Cleanup old API logs
     * Runs every day at 2:00 AM
     * Cron expression: seconds minutes hours day month weekday
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupOldLogs() {
        if (!properties.isEnabled()) {
            log.debug("API logging is disabled, skipping log cleanup");
            return;
        }

        try {
            int retentionDays = properties.getRetentionDays();
            log.info("Starting API log cleanup for logs older than {} days", retentionDays);

            int deletedCount = apiLoggingService.deleteLogsOlderThan(retentionDays);

            log.info("API log cleanup completed. Deleted {} log entries older than {} days",
                deletedCount, retentionDays);

        } catch (Exception e) {
            log.error("Failed to cleanup old API logs", e);
        }
    }
}
