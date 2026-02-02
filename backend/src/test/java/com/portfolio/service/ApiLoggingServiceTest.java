package com.portfolio.service;

import com.portfolio.model.ApiLog;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for ApiLoggingService
 * Uses real database connection
 */
@SpringBootTest
class ApiLoggingServiceTest {

    @Autowired
    private ApiLoggingService apiLoggingService;

    @Test
    void testLogAsyncAndRetrieve() throws InterruptedException {
        ApiLog log = ApiLog.create(
            "GET",
            "/api/v1/health",
            null,
            null,
            "{\"status\":\"UP\"}",
            200,
            15L,
            "127.0.0.1",
            "Mozilla/5.0"
        );

        // Async log
        apiLoggingService.logAsync(log);

        // Wait for async operation
        Thread.sleep(500);

        // Verify we can retrieve the log
        List<ApiLog> logs = apiLoggingService.getLogsByEndpoint("/api/v1/health", "GET");
        assertFalse(logs.isEmpty());
        assertEquals("/api/v1/health", logs.get(0).requestPath());
        assertEquals("GET", logs.get(0).requestMethod());
    }

    @Test
    void testGetLogsByEndpoint() throws InterruptedException {
        String path = "/api/v1/test";
        String method = "GET";

        ApiLog log = ApiLog.create(
            method,
            path,
            "param=value",
            null,
            "{\"result\":\"ok\"}",
            200,
            10L,
            "10.0.0.1",
            "TestClient"
        );

        apiLoggingService.logAsync(log);
        Thread.sleep(500);

        List<ApiLog> logs = apiLoggingService.getLogsByEndpoint(path, method);

        assertFalse(logs.isEmpty());
        assertEquals(path, logs.get(0).requestPath());
        assertEquals(method, logs.get(0).requestMethod());
        assertEquals("param=value", logs.get(0).requestParams());
    }

    @Test
    void testGetErrorLogs() throws InterruptedException {
        ApiLog errorLog = ApiLog.create(
            "POST",
            "/api/v1/error",
            null,
            "{}",
            "{\"error\":\"Internal Server Error\"}",
            500,
            99L,
            "10.0.0.1",
            "TestClient"
        );

        apiLoggingService.logAsync(errorLog);
        Thread.sleep(500);

        List<ApiLog> errorLogs = apiLoggingService.getErrorLogs();

        assertFalse(errorLogs.isEmpty());
        assertTrue(errorLogs.get(0).statusCode() >= 400);
        assertEquals(500, errorLogs.get(0).statusCode());
    }

    @Test
    void testGetSlowLogs() throws InterruptedException {
        long thresholdMs = 100L;

        ApiLog slowLog = ApiLog.create(
            "POST",
            "/api/v1/slow",
            null,
            "{}",
            "{\"response\":\"done\"}",
            200,
            500L,  // Above threshold
            "127.0.0.1",
            "TestClient"
        );

        ApiLog fastLog = ApiLog.create(
            "GET",
            "/api/v1/fast",
            null,
            null,
            "{\"ok\":true}",
            200,
            10L,  // Below threshold
            "127.0.0.1",
            "TestClient"
        );

        apiLoggingService.logAsync(slowLog);
        apiLoggingService.logAsync(fastLog);
        Thread.sleep(500);

        List<ApiLog> slowLogs = apiLoggingService.getSlowLogs(thresholdMs);

        assertFalse(slowLogs.isEmpty());
        assertTrue(slowLogs.get(0).durationMs() >= thresholdMs);
    }

    @Test
    void testDeleteLogsOlderThan() throws InterruptedException {
        // Test the method doesn't throw
        assertDoesNotThrow(() -> {
            int deleted = apiLoggingService.deleteLogsOlderThan(90);
            assertTrue(deleted >= 0);
        });
    }

    @Test
    void testLogAsyncWithNullFields() throws InterruptedException {
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

        apiLoggingService.logAsync(log);
        Thread.sleep(500);

        List<ApiLog> logs = apiLoggingService.getLogsByEndpoint("/api/v1/session/123", "DELETE");

        assertFalse(logs.isEmpty());
        assertEquals("DELETE", logs.get(0).requestMethod());
        assertNull(logs.get(0).requestParams());
        assertNull(logs.get(0).requestBody());
        assertNull(logs.get(0).responseBody());
        assertNull(logs.get(0).ipAddress());
        assertNull(logs.get(0).userAgent());
    }

    @Test
    void testMultipleLogsForSameEndpoint() throws InterruptedException {
        String path = "/api/v1/multi";
        String method = "GET";

        for (int i = 0; i < 3; i++) {
            ApiLog log = ApiLog.create(
                method,
                path,
                null,
                null,
                "{\"index\":" + i + "}",
                200,
                (long) (i * 10),
                "127.0.0.1",
                "TestClient"
            );
            apiLoggingService.logAsync(log);
        }

        Thread.sleep(1000);

        List<ApiLog> logs = apiLoggingService.getLogsByEndpoint(path, method);

        assertTrue(logs.size() >= 3);
        // Logs are ordered by created_at DESC
        assertEquals(path, logs.get(0).requestPath());
    }

    @Test
    void testErrorLogsWithMultipleErrors() throws InterruptedException {
        ApiLog error1 = ApiLog.create("GET", "/notfound", null, null, "404", 404, 10L, "1.1.1.1", "Agent");
        ApiLog error2 = ApiLog.create("POST", "/error", null, null, "500", 500, 20L, "2.2.2.2", "Bot");

        apiLoggingService.logAsync(error1);
        apiLoggingService.logAsync(error2);
        Thread.sleep(500);

        List<ApiLog> errors = apiLoggingService.getErrorLogs();

        assertTrue(errors.size() >= 2);
        assertTrue(errors.stream().anyMatch(log -> log.statusCode() == 404));
        assertTrue(errors.stream().anyMatch(log -> log.statusCode() == 500));
    }

    @Test
    void testGetSlowLogsWithCustomThreshold() throws InterruptedException {
        long lowThreshold = 50L;

        ApiLog mediumLog = ApiLog.create("GET", "/medium", null, null, "data", 200, 100L, "3.3.3.3", "Client");
        ApiLog verySlowLog = ApiLog.create("POST", "/veryslow", null, null, "data", 200, 2000L, "4.4.4.4", "Client");

        apiLoggingService.logAsync(mediumLog);
        apiLoggingService.logAsync(verySlowLog);
        Thread.sleep(500);

        List<ApiLog> slowLogs = apiLoggingService.getSlowLogs(lowThreshold);

        assertTrue(slowLogs.stream().anyMatch(log -> log.durationMs() >= lowThreshold));
    }
}
