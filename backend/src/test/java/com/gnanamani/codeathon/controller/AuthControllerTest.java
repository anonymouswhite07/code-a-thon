package com.gnanamani.codeathon.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnanamani.codeathon.dto.LoginRequest;
import com.gnanamani.codeathon.dto.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/v1/auth/register with valid payload creates participant")
    void testRegisterSuccess() throws Exception {
        RegisterRequest req = new RegisterRequest();
        long ts = System.currentTimeMillis();
        req.setEmail("reg_test_" + ts + "@gct.ac.in");
        req.setPassword("Password@2026");
        req.setFullName("Test Participant");
        req.setPhone("9876543210");
        req.setCollege("Gnanamani College of Technology");
        req.setDepartment("CSE");
        req.setYear("3rd Year");
        req.setProgrammingExp("Intermediate");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isString())
                .andExpect(jsonPath("$.data.email").value("reg_test_" + ts + "@gct.ac.in"))
                .andExpect(jsonPath("$.data.role").value("ROLE_PARTICIPANT"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register with missing fields returns 400 Validation Error")
    void testRegisterValidationFailure() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("invalid-email");
        req.setPassword("123"); // Too short

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login with seeded admin credentials returns JWT")
    void testAdminLoginSuccess() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("admin@gct.ac.in");
        req.setPassword("Admin@2026");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isString())
                .andExpect(jsonPath("$.data.role").value("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me without token returns 401 Unauthorized")
    void testGetMeUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
