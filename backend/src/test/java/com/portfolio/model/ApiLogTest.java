package com.portfolio.model;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for ApiLog record
 */
class ApiLogTest {

    @Test
    void testApiLogCreation() {
        LocalDateTime now = LocalDateTime.now();

        ApiLog log = new ApiLog(
            "GET",
            "/api/v1/health",
            null,
            null,
            "{\"status\":\"UP\"}",
            200,
            15L,
            "127.0.0.1",
            "Mozilla/5.0",
            now
        );

        assertEquals("GET", log.requestMethod());
        assertEquals("/api/v1/health", log.requestPath());
        assertNull(log.requestParams());
        assertNull(log.requestBody());
        assertEquals("{\"status\":\"UP\"}", log.responseBody());
        assertEquals(200, log.statusCode());
        assertEquals(15L, log.durationMs());
        assertEquals("127.0.0.1", log.ipAddress());
        assertEquals("Mozilla/5.0", log.userAgent());
        assertEquals(now, log.createdAt());
    }

    @Test
    void testCreateFactoryMethod() {
        LocalDateTime before = LocalDateTime.now();
        ApiLog log = ApiLog.create(
            "POST",
            "/api/v1/chat/message",
            "sessionId=abc123",
            "{\"message\":\"hello\"}",
            "{\"response\":\"hi there\"}",
            200,
            123L,
            "192.168.1.1",
            "PostmanRuntime/7.0"
        );
        LocalDateTime after = LocalDateTime.now();

        assertEquals("POST", log.requestMethod());
        assertEquals("/api/v1/chat/message", log.requestPath());
        assertEquals("sessionId=abc123", log.requestParams());
        assertEquals("{\"message\":\"hello\"}", log.requestBody());
        assertEquals("{\"response\":\"hi there\"}", log.responseBody());
        assertEquals(200, log.statusCode());
        assertEquals(123L, log.durationMs());
        assertEquals("192.168.1.1", log.ipAddress());
        assertEquals("PostmanRuntime/7.0", log.userAgent());

        // Verify createdAt is set and is within expected time range
        assertNotNull(log.createdAt());
        assertFalse(log.createdAt().isBefore(before));
        assertFalse(log.createdAt().isAfter(after));
    }

    @Test
    void testCreateWithAllNulls() {
        ApiLog log = ApiLog.create(
            "DELETE",
            "/api/v1/session/123",
            null,
            null,
            null,
            204,
            5L,
            null,
            null
        );

        assertEquals("DELETE", log.requestMethod());
        assertEquals("/api/v1/session/123", log.requestPath());
        assertNull(log.requestParams());
        assertNull(log.requestBody());
        assertNull(log.responseBody());
        assertEquals(204, log.statusCode());
        assertEquals(5L, log.durationMs());
        assertNull(log.ipAddress());
        assertNull(log.userAgent());
        assertNotNull(log.createdAt());
    }

    @Test
    void testImmutability() {
        LocalDateTime now = LocalDateTime.now();
        ApiLog log = new ApiLog(
            "GET",
            "/test",
            "param=value",
            "body",
            "response",
            200,
            10L,
            "1.1.1.1",
            "Agent",
            now
        );

        // Records are immutable by design
        // This test documents that behavior
        assertEquals("GET", log.requestMethod());
        assertEquals(10L, log.durationMs());
        assertEquals(now, log.createdAt());
    }

    @Test
    void testLargeRequestBody() {
        String largeBody = "x".repeat(100000); // 100KB body
        String truncatedBody = "x".repeat(10000); // 10KB limit

        ApiLog log = ApiLog.create(
            "POST",
            "/api/v1/upload",
            null,
            largeBody,
            "{\"success\":true}",
            201,
            1500L,
            "10.0.0.1",
            "curl/7.0"
        );

        // The model should store whatever is passed to it
        // Truncation happens at the service/aspect layer
        assertEquals(largeBody, log.requestBody());
    }

    @Test
    void testEdgeCaseStatusCode() {
        ApiLog log = ApiLog.create(
            "GET",
            "/api/v1/error",
            null,
            null,
            "{\"error\":\"Internal Server Error\"}",
            500,
            99L,
            "localhost",
            "TestClient"
        );

        assertEquals(500, log.statusCode());
        assertEquals(99L, log.durationMs());
    }

    @Test
    void testEdgeCaseZeroDuration() {
        ApiLog log = ApiLog.create(
            "GET",
            "/api/v1/cache",
            null,
            null,
            "{\"cached\":true}",
            200,
            0L,
            "127.0.0.1",
            "FastClient"
        );

        assertEquals(0L, log.durationMs());
    }

    @Test
    void testSpecialCharactersInPath() {
        ApiLog log = ApiLog.create(
            "GET",
            "/api/v1/users/123/posts/456?sort=desc&filter=active",
            "sort=desc&filter=active",
            null,
            "[]",
            200,
            25L,
            "10.20.30.40",
            "Browser/1.0"
        );

        assertEquals("/api/v1/users/123/posts/456?sort=desc&filter=active", log.requestPath());
        assertEquals("sort=desc&filter=active", log.requestParams());
    }
}
