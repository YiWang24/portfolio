package com.portfolio.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.config.ApiLoggingProperties;
import com.portfolio.model.ApiLog;
import com.portfolio.service.ApiLoggingService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.stream.Collectors;

/**
 * AOP Aspect for intercepting all REST controller calls
 * Logs request/response data asynchronously to database
 */
@Aspect
@Component
public class ApiLoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(ApiLoggingAspect.class);

    private final ApiLoggingService apiLoggingService;
    private final ObjectMapper objectMapper;
    private final ApiLoggingProperties properties;

    public ApiLoggingAspect(
        ApiLoggingService apiLoggingService,
        ObjectMapper objectMapper,
        ApiLoggingProperties properties
    ) {
        this.apiLoggingService = apiLoggingService;
        this.objectMapper = objectMapper;
        this.properties = properties;
    }

    /**
     * Intercept all methods in classes annotated with @RestController
     * Logs request/response data without affecting the response
     */
    @Around("@within(org.springframework.web.bind.annotation.RestController)")
    public Object logApiCall(ProceedingJoinPoint joinPoint) throws Throwable {
        // Check if logging is enabled
        if (!properties.isEnabled()) {
            return joinPoint.proceed();
        }
        long startTime = System.currentTimeMillis();

        // Get current request
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            // No active request - proceed without logging
            return joinPoint.proceed();
        }

        HttpServletRequest request = attributes.getRequest();

        // Extract request information
        String method = request.getMethod();
        String path = getRequestPath(request);
        String params = getRequestParams(request);
        String requestBody = getRequestBody(request);
        String ipAddress = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");

        Object response = null;
        int statusCode = 200;
        String responseBody = null;
        Exception exception = null;

        try {
            // Execute the controller method
            response = joinPoint.proceed();

            // Try to extract status code from ResponseEntity
            if (response instanceof org.springframework.http.ResponseEntity) {
                statusCode = ((org.springframework.http.ResponseEntity<?>) response).getStatusCodeValue();
                responseBody = serializeBody(((org.springframework.http.ResponseEntity<?>) response).getBody());
            } else {
                responseBody = serializeBody(response);
            }

            return response;

        } catch (Exception e) {
            exception = e;
            statusCode = getStatusCodeFromException(e);
            responseBody = serializeError(e);
            throw e;

        } finally {
            // Calculate duration
            long durationMs = System.currentTimeMillis() - startTime;

            // Truncate large bodies
            requestBody = truncate(requestBody, properties.getMaxBodySize());
            responseBody = truncate(responseBody, properties.getMaxBodySize());

            // Create and save log asynchronously
            ApiLog apiLog = ApiLog.create(
                method,
                path,
                params,
                requestBody,
                responseBody,
                statusCode,
                durationMs,
                ipAddress,
                userAgent
            );

            // Async logging - won't affect response
            try {
                apiLoggingService.logAsync(apiLog);
            } catch (Exception e) {
                // Logging failure shouldn't affect the API response
                log.error("Failed to queue API log for async processing", e);
            }
        }
    }

    /**
     * Extract request path including query string
     */
    private String getRequestPath(HttpServletRequest request) {
        String path = request.getRequestURI();
        String queryString = request.getQueryString();
        return queryString != null ? path + "?" + queryString : path;
    }

    /**
     * Extract request parameters as string
     */
    private String getRequestParams(HttpServletRequest request) {
        if (request.getParameterMap().isEmpty()) {
            return null;
        }
        return request.getParameterMap().entrySet().stream()
            .flatMap(entry -> java.util.Arrays.stream(entry.getValue())
                .map(value -> entry.getKey() + "=" + value))
            .collect(Collectors.joining("&"));
    }

    /**
     * Extract request body
     * Note: This is best-effort as the input stream may already be consumed
     */
    private String getRequestBody(HttpServletRequest request) {
        // Can't read body if stream has been consumed
        // Spring wraps request for certain content types to allow re-reading
        // For most cases, we'll return null and focus on logging responses
        return null;
    }

    /**
     * Extract client IP address, handling proxy headers
     */
    private String getClientIpAddress(HttpServletRequest request) {
        // Check for proxy headers
        String[] headers = {
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_CLIENT_IP",
            "HTTP_X_FORWARDED_FOR"
        };

        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // X-Forwarded-For may contain multiple IPs
                if (ip.contains(",")) {
                    return ip.split(",")[0].trim();
                }
                return ip;
            }
        }

        // Fall back to remote address
        return request.getRemoteAddr();
    }

    /**
     * Serialize response body to JSON string
     */
    private String serializeBody(Object body) {
        if (body == null) {
            return null;
        }

        try {
            // Don't serialize certain types that don't serialize well
            if (body instanceof byte[]) {
                return "<binary data>";
            }
            if (body instanceof org.springframework.web.servlet.mvc.method.annotation.SseEmitter) {
                return "<SseEmitter>";
            }

            return objectMapper.writeValueAsString(body);
        } catch (Exception e) {
            log.warn("Failed to serialize response body for logging", e);
            return "<serialization failed>";
        }
    }

    /**
     * Serialize exception to error message
     */
    private String serializeError(Exception e) {
        return "{\"error\":\"" + e.getClass().getSimpleName() + "\",\"message\":\"" +
            (e.getMessage() != null ? escapeJson(e.getMessage()) : "") + "\"}";
    }

    /**
     * Escape special characters in JSON string
     */
    private String escapeJson(String value) {
        return value.replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }

    /**
     * Get HTTP status code from exception
     */
    private int getStatusCodeFromException(Exception e) {
        // Check for Spring web exceptions
        if (e instanceof org.springframework.web.server.ResponseStatusException rse) {
            return rse.getStatusCode().value();
        }

        // Default to 500 for unhandled exceptions
        return 500;
    }

    /**
     * Truncate string to maximum length
     */
    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength) + "... [truncated]";
    }
}
