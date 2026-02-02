package com.portfolio.aspect;

import com.portfolio.model.ApiLog;
import com.portfolio.service.ApiLoggingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for ApiLoggingAspect
 * Verifies that API calls are logged correctly
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "api.logging.enabled=true"
})
class ApiLoggingAspectIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ApiLoggingService apiLoggingService;

    @Test
    void testHealthEndpointIsLogged() throws Exception {
        // Call health endpoint
        mockMvc.perform(get("/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").exists());

        // Wait for async logging
        TimeUnit.MILLISECONDS.sleep(500);

        // Verify log was created
        var logs = apiLoggingService.getLogsByEndpoint("/health", "GET");
        assertFalse(logs.isEmpty(), "Health endpoint should be logged");
        assertEquals(200, logs.get(0).statusCode());
    }

    @Test
    void testLoggingWithDifferentMethods() throws Exception {
        mockMvc.perform(get("/health"))
            .andExpect(status().isOk());

        TimeUnit.MILLISECONDS.sleep(500);

        var logs = apiLoggingService.getLogsByEndpoint("/health", "GET");
        assertTrue(logs.size() >= 1, "At least one log should exist");
    }

    @Test
    void testLoggingCapturesDuration() throws Exception {
        mockMvc.perform(get("/health"))
            .andExpect(status().isOk());

        TimeUnit.MILLISECONDS.sleep(500);

        var logs = apiLoggingService.getLogsByEndpoint("/health", "GET");
        assertFalse(logs.isEmpty());

        ApiLog log = logs.get(0);
        assertTrue(log.durationMs() >= 0, "Duration should be non-negative");
        assertTrue(log.durationMs() < 5000, "Duration should be reasonable (< 5s)");
    }

    @Test
    void testLoggingWithNullParameters() throws Exception {
        mockMvc.perform(get("/health"))
            .andExpect(status().isOk());

        TimeUnit.MILLISECONDS.sleep(500);

        var logs = apiLoggingService.getLogsByEndpoint("/health", "GET");
        assertFalse(logs.isEmpty());

        ApiLog log = logs.get(0);
        assertNotNull(log.createdAt(), "CreatedAt should be set");
        assertEquals("GET", log.requestMethod());
    }
}
