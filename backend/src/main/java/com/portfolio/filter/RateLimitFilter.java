package com.portfolio.filter;

import com.portfolio.service.RateLimitService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import java.io.IOException;

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
        
        // Skip rate limiting for stats endpoint
        if (req.getRequestURI().endsWith("/stats")) {
            chain.doFilter(request, response);
            return;
        }
        
        String ip = getClientIP(req);
        
        if (!rateLimitService.allowRequest(ip)) {
            res.setStatus(429);
            res.setContentType("application/json");
            res.getWriter().write("{\"error\":\"Rate limit exceeded\",\"message\":\"Too many requests. Please try again later.\"}");
            return;
        }
        
        chain.doFilter(request, response);
    }

    private String getClientIP(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) ip = request.getHeader("X-Real-IP");
        if (ip == null || ip.isEmpty()) ip = request.getRemoteAddr();
        return ip != null ? ip.split(",")[0].trim() : "unknown";
    }
}
