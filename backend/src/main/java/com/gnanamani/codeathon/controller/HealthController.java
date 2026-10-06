package com.gnanamani.codeathon.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping(value = {"/", "/health", "/api/v1/health"})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "codeathon-backend",
                "institution", "Gnanamani College of Technology",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
