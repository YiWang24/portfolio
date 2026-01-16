package com.portfolio.filter;

import com.portfolio.service.RateLimitService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import java.io.IOException;

/**
 * Rate limit filter that only applies to chat endpoints (/api/v1/chat/*)
 * Other endpoints like health, contact, etc. are not rate limited.
 */
@Component
public class RateLimitFilter implements Filter {
    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);
    private final RateLimitService rateLimitService;

    public RateLimitFilter(RateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String requestURI = req.getRequestURI();

        // Only apply rate limiting to /api/v1/chat/* endpoints
        if (!requestURI.startsWith("/api/v1/chat/")) {
            chain.doFilter(request, response);
            return;
        }

        String ip = getClientIP(req);

        if (!rateLimitService.allowRequest(ip)) {
            log.warn("Rate limit exceeded for IP: {} on URI: {}", ip, requestURI);
            res.setStatus(429);
            res.setContentType("application/json");
            res.getWriter().write("{\"error\":\"Rate limit exceeded\",\"message\":\"Too many requests. Please try again later.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    /**
     * Get client IP from request.
     * Uses X-Forwarded-For header when behind a proxy (nginx, etc.)
     * Requires server.forward-headers-strategy=native in application.properties
     */
    private String getClientIP(HttpServletRequest request) {
        // When server.forward-headers-strategy=native, Spring processes X-Forwarded-For
        // and request.getRemoteAddr() returns the real client IP
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty()) {
            // X-Forwarded-For can contain multiple IPs, take the first one (original client)
            return ip.split(",")[0].trim();
        }

        ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isEmpty()) {
            return ip.split(",")[0].trim();
        }

        // Fallback to remote address (will be real IP when forward-headers-strategy=native)
        return request.getRemoteAddr();
    }
}
