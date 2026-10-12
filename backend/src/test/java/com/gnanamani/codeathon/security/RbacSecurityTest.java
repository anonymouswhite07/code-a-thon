package com.gnanamani.codeathon.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RbacSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Public endpoints are accessible without authentication")
    void testPublicEndpointsAccessible() throws Exception {
        mockMvc.perform(get("/api/v1/rounds"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/leaderboard/live"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/announcements"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Participant cannot access Admin dashboard or controls (HTTP 403)")
    @WithMockUser(username = "participant@gct.ac.in", authorities = {"ROLE_PARTICIPANT"})
    void testParticipantCannotAccessAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/admin/rounds/1/control")
                        .contentType("application/json")
                        .content("{\"action\":\"START\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/admin/leaderboard/freeze?freeze=true"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Participant cannot access Judge endpoints (HTTP 403)")
    @WithMockUser(username = "participant@gct.ac.in", authorities = {"ROLE_PARTICIPANT"})
    void testParticipantCannotAccessJudge() throws Exception {
        mockMvc.perform(get("/api/v1/judge/submissions"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Judge can access Judge endpoints but cannot access Admin endpoints")
    @WithMockUser(username = "judge@gct.ac.in", authorities = {"ROLE_JUDGE"})
    void testJudgeCannotAccessAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/judge/submissions"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin can access Admin and Judge endpoints")
    @WithMockUser(username = "admin@gct.ac.in", authorities = {"ROLE_ADMIN"})
    void testAdminCanAccessAdminAndJudge() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/judge/submissions"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Unauthenticated user accessing protected endpoints receives HTTP 401 Unauthorized")
    void testUnauthenticatedAccessForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/submissions/my-submissions"))
                .andExpect(status().isUnauthorized());
    }
}
