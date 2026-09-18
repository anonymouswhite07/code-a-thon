package com.gnanamani.codeathon.controller;

import com.gnanamani.codeathon.dto.ApiResponse;
import com.gnanamani.codeathon.dto.LeaderboardEntryResponse;
import com.gnanamani.codeathon.service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping("/live")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryResponse>>> getLiveLeaderboard() {
        List<LeaderboardEntryResponse> list = leaderboardService.getLeaderboard();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatus() {
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "frozen", leaderboardService.isLeaderboardFrozen(),
                "finalResultsPublished", leaderboardService.isFinalResultsPublished()
        )));
    }
}
