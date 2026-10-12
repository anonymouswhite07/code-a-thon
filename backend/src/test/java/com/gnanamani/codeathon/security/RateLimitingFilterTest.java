package com.gnanamani.codeathon.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RateLimitingFilterTest {

    private RateLimitingFilter rateLimitingFilter;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        rateLimitingFilter = new RateLimitingFilter();
        filterChain = mock(FilterChain.class);
    }

    @Test
    @DisplayName("Normal requests under limit pass through and receive rate limit headers")
    void testNormalRequestAllowed() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/rounds");
        request.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        rateLimitingFilter.doFilterInternal(request, response, filterChain);

        assertEquals(200, response.getStatus());
        assertNotNull(response.getHeader("X-RateLimit-Limit"));
        assertNotNull(response.getHeader("X-RateLimit-Remaining"));
        verify(filterChain, times(1)).doFilter(request, response);
    }

    @Test
    @DisplayName("Auth endpoint enforces 20 req/min limit and returns HTTP 429 when exceeded")
    void testAuthEndpointRateLimiting() throws ServletException, IOException {
        String testIp = "192.168.100.50";

        // First 20 requests succeed
        for (int i = 0; i < 20; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            req.setRemoteAddr(testIp);
            MockHttpServletResponse resp = new MockHttpServletResponse();
            rateLimitingFilter.doFilterInternal(req, resp, filterChain);
            assertEquals(200, resp.getStatus(), "Request " + (i + 1) + " should be allowed");
        }

        // 21st request is blocked with HTTP 429 Too Many Requests
        MockHttpServletRequest blockedReq = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        blockedReq.setRemoteAddr(testIp);
        MockHttpServletResponse blockedResp = new MockHttpServletResponse();

        rateLimitingFilter.doFilterInternal(blockedReq, blockedResp, filterChain);

        assertEquals(429, blockedResp.getStatus(), "21st request must receive HTTP 429");
        assertEquals("60", blockedResp.getHeader("Retry-After"));
        assertEquals("0", blockedResp.getHeader("X-RateLimit-Remaining"));
        assertTrue(blockedResp.getContentAsString().contains("TOO_MANY_REQUESTS"));
    }
}
