package com.portfolio.service;

import com.portfolio.model.ApiLog;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for API logging operations
 * Provides async logging to avoid blocking API responses
 */
@Service
public class ApiLoggingService {

    private static final Logger log = LoggerFactory.getLogger(ApiLoggingService.class);

    private final JdbcTemplate jdbcTemplate;

    public ApiLoggingService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Asynchronously save API log to database
     * Uses @Async to avoid blocking the response
     *
     * @param apiLog The API log entry to save
     */
    @Async("apiLoggingExecutor")
    public void logAsync(ApiLog apiLog) {
        try {
            String sql = """
                INSERT INTO api_logs (
                    request_method, request_path, request_params, request_body,
                    response_body, status_code, duration_ms, ip_address, user_agent, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

            jdbcTemplate.update(
                sql,
                apiLog.requestMethod(),
                apiLog.requestPath(),
                apiLog.requestParams(),
                apiLog.requestBody(),
                apiLog.responseBody(),
                apiLog.statusCode(),
                apiLog.durationMs(),
                apiLog.ipAddress(),
                apiLog.userAgent(),
                apiLog.createdAt()
            );

        } catch (Exception e) {
            // Don't throw - logging failures shouldn't affect API responses
            log.error("Failed to save API log", e);
        }
    }

    /**
     * Query logs by endpoint path and method
     *
     * @param path   Request path (e.g., /api/v1/health)
     * @param method HTTP method (GET, POST, etc.)
     * @return List of matching API logs
     */
    public List<ApiLog> getLogsByEndpoint(String path, String method) {
        String sql = """
            SELECT
                request_method, request_path, request_params, request_body,
                response_body, status_code, duration_ms, ip_address, user_agent, created_at
            FROM api_logs
            WHERE request_path = ? AND request_method = ?
            ORDER BY created_at DESC
            LIMIT 100
            """;

        return jdbcTemplate.query(sql, apiLogRowMapper(), path, method);
    }

    /**
     * Query all error logs (status code >= 400)
     *
     * @return List of error logs
     */
    public List<ApiLog> getErrorLogs() {
        String sql = """
            SELECT
                request_method, request_path, request_params, request_body,
                response_body, status_code, duration_ms, ip_address, user_agent, created_at
            FROM api_logs
            WHERE status_code >= ?
            ORDER BY created_at DESC
            LIMIT 100
            """;

        return jdbcTemplate.query(sql, apiLogRowMapper(), 400);
    }

    /**
     * Query slow requests above a duration threshold
     *
     * @param thresholdMs Duration threshold in milliseconds
     * @return List of slow request logs
     */
    public List<ApiLog> getSlowLogs(long thresholdMs) {
        String sql = """
            SELECT
                request_method, request_path, request_params, request_body,
                response_body, status_code, duration_ms, ip_address, user_agent, created_at
            FROM api_logs
            WHERE duration_ms >= ?
            ORDER BY duration_ms DESC
            LIMIT 100
            """;

        return jdbcTemplate.query(sql, apiLogRowMapper(), thresholdMs);
    }

    /**
     * Delete logs older than specified number of days
     * Useful for cleanup and maintenance
     *
     * @param days Number of days to retain logs
     * @return Number of deleted records
     */
    public int deleteLogsOlderThan(int days) {
        String sql = "DELETE FROM api_logs WHERE created_at < ?";
        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
        return jdbcTemplate.update(sql, cutoff);
    }

    /**
     * RowMapper for converting ResultSet to ApiLog
     */
    private RowMapper<ApiLog> apiLogRowMapper() {
        return (rs, rowNum) -> new ApiLog(
            rs.getString("request_method"),
            rs.getString("request_path"),
            rs.getString("request_params"),
            rs.getString("request_body"),
            rs.getString("response_body"),
            rs.getInt("status_code"),
            rs.getLong("duration_ms"),
            rs.getString("ip_address"),
            rs.getString("user_agent"),
            rs.getTimestamp("created_at").toLocalDateTime()
        );
    }
}
