package com.gnanamani.codeathon.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private static final String TEST_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final long EXPIRATION_MS = 3600000; // 1 hour

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(TEST_SECRET, EXPIRATION_MS);
    }

    @Test
    @DisplayName("Generate token with claims and successfully validate")
    void testGenerateAndValidateToken() {
        String token = jwtTokenProvider.generateToken("student@gct.ac.in", "ROLE_PARTICIPANT", 1L, "Student Name");
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));

        String email = jwtTokenProvider.getEmailFromToken(token);
        assertEquals("student@gct.ac.in", email);

        Claims claims = jwtTokenProvider.getClaimsFromToken(token);
        assertEquals(1L, claims.get("userId", Long.class));
        assertEquals("ROLE_PARTICIPANT", claims.get("role", String.class));
        assertEquals("Student Name", claims.get("fullName", String.class));
    }

    @Test
    @DisplayName("Reject expired token")
    void testExpiredTokenValidation() {
        // Provider with -1000ms expiration (immediately expired)
        JwtTokenProvider expiredProvider = new JwtTokenProvider(TEST_SECRET, -1000);
        String expiredToken = expiredProvider.generateToken("user@gct.ac.in", "ROLE_PARTICIPANT", 2L, "Expired User");

        assertFalse(jwtTokenProvider.validateToken(expiredToken));
    }

    @Test
    @DisplayName("Reject token signed with different secret key")
    void testWrongSecretKeyValidation() {
        String altSecret = "994E635266556A586E3272357538782F413F4428472B4B6250645367566B5999";
        JwtTokenProvider altProvider = new JwtTokenProvider(altSecret, EXPIRATION_MS);
        String forgedToken = altProvider.generateToken("attacker@gct.ac.in", "ROLE_SUPER_ADMIN", 99L, "Attacker");

        assertFalse(jwtTokenProvider.validateToken(forgedToken));
    }

    @Test
    @DisplayName("Reject malformed or empty token")
    void testMalformedTokenValidation() {
        assertFalse(jwtTokenProvider.validateToken("malformed.token.string"));
        assertFalse(jwtTokenProvider.validateToken(""));
        assertFalse(jwtTokenProvider.validateToken(null));
    }
}
