package com.portfolio.model;

import java.time.LocalDateTime;

/**
 * Immutable API log record for tracking REST API calls
 *
 * @param requestMethod HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param requestPath   Request path (e.g., /api/v1/health)
 * @param requestParams Query parameters as string
 * @param requestBody   Request body (JSON or text)
 * @param responseBody  Response body (JSON or text)
 * @param statusCode    HTTP status code
 * @param durationMs    Request duration in milliseconds
 * @param ipAddress     Client IP address
 * @param userAgent     Client user agent
 * @param createdAt     Timestamp when the log was created
 */
public record ApiLog(
    String requestMethod,
    String requestPath,
    String requestParams,
    String requestBody,
    String responseBody,
    int statusCode,
    long durationMs,
    String ipAddress,
    String userAgent,
    LocalDateTime createdAt
) {
    /**
     * Factory method to create a new ApiLog with current timestamp
     *
     * @param requestMethod HTTP method
     * @param requestPath   Request path
     * @param requestParams Query parameters
     * @param requestBody   Request body
     * @param responseBody  Response body
     * @param statusCode    HTTP status code
     * @param durationMs    Duration in milliseconds
     * @param ipAddress     Client IP address
     * @param userAgent     Client user agent
     * @return New ApiLog instance with current timestamp
     */
    public static ApiLog create(
        String requestMethod,
        String requestPath,
        String requestParams,
        String requestBody,
        String responseBody,
        int statusCode,
        long durationMs,
        String ipAddress,
        String userAgent
    ) {
        return new ApiLog(
            requestMethod,
            requestPath,
            requestParams,
            requestBody,
            responseBody,
            statusCode,
            durationMs,
            ipAddress,
            userAgent,
            LocalDateTime.now()
        );
    }
}
