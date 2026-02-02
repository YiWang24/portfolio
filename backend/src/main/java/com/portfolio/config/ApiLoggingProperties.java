package com.portfolio.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for API logging
 * Can be configured via application.properties or environment variables
 */
@Component
@ConfigurationProperties(prefix = "api.logging")
public class ApiLoggingProperties {

    /**
     * Enable/disable API logging
     * Default: true
     */
    private boolean enabled = true;

    /**
     * Maximum request/response body size before truncation (in bytes)
     * Default: 10KB (10240 bytes)
     */
    private int maxBodySize = 10 * 1024;

    /**
     * Number of days to retain API logs before cleanup
     * Default: 90 days
     */
    private int retentionDays = 90;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getMaxBodySize() {
        return maxBodySize;
    }

    public void setMaxBodySize(int maxBodySize) {
        this.maxBodySize = maxBodySize;
    }

    public int getRetentionDays() {
        return retentionDays;
    }

    public void setRetentionDays(int retentionDays) {
        this.retentionDays = retentionDays;
    }
}
