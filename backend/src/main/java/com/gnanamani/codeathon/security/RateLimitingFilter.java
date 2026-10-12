package com.gnanamani.codeathon.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnanamani.codeathon.dto.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Production Rate Limiting Filter to prevent brute-force login attacks,
 * automated credential stuffing, and DoS against evaluation and integrity APIs.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int AUTH_LIMIT_PER_MINUTE = 20;
    private static final int SUBMISSION_LIMIT_PER_MINUTE = 30;
    private static final int GENERAL_LIMIT_PER_MINUTE = 150;

    private static class WindowCounter {
        final long windowEpochMinute;
        final AtomicInteger count;

        WindowCounter(long windowEpochMinute) {
            this.windowEpochMinute = windowEpochMinute;
            this.count = new AtomicInteger(1);
        }
    }

    private final ConcurrentHashMap<String, WindowCounter> requestCounts = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/actuator/health") ||
               path.startsWith("/health") ||
               path.startsWith("/h2-console") ||
               path.startsWith("/_next") ||
               path.startsWith("/favicon.ico");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String ip = extractClientIp(request);
        String path = request.getRequestURI();
        long currentMinute = System.currentTimeMillis() / 60000;

        int limit = GENERAL_LIMIT_PER_MINUTE;
        String bucketKey = "gen:" + ip;

        if (path.contains("/auth/login") || path.contains("/auth/register")) {
            limit = AUTH_LIMIT_PER_MINUTE;
            bucketKey = "auth:" + ip;
        } else if (path.contains("/submissions/")) {
            limit = SUBMISSION_LIMIT_PER_MINUTE;
            bucketKey = "sub:" + ip;
        }

        // Periodic cleanup if map grows large (> 5000 entries)
        if (requestCounts.size() > 5000) {
            requestCounts.entrySet().removeIf(e -> e.getValue().windowEpochMinute < currentMinute);
        }

        WindowCounter counter = requestCounts.compute(bucketKey, (k, existing) -> {
            if (existing == null || existing.windowEpochMinute != currentMinute) {
                return new WindowCounter(currentMinute);
            }
            existing.count.incrementAndGet();
            return existing;
        });

        if (counter.count.get() > limit) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", "60");
            response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
            response.setHeader("X-RateLimit-Remaining", "0");

            ApiResponse<Void> apiError = ApiResponse.error(
                    "TOO_MANY_REQUESTS",
                    "Rate limit exceeded (" + limit + " req/min). Please slow down and try again."
            );
            response.getWriter().write(objectMapper.writeValueAsString(apiError));
            return;
        }

        response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, limit - counter.count.get())));

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        String rip = request.getHeader("X-Real-IP");
        if (rip != null && !rip.isBlank()) {
            return rip.trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }
}
