package com.gnanamani.codeathon.controller;

import com.gnanamani.codeathon.domain.Round;
import com.gnanamani.codeathon.dto.ApiResponse;
import com.gnanamani.codeathon.dto.RoundResponse;
import com.gnanamani.codeathon.repository.QuestionRepository;
import com.gnanamani.codeathon.repository.RoundRepository;
import com.gnanamani.codeathon.service.CompetitionEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/rounds")
public class RoundController {

    private final RoundRepository roundRepository;
    private final QuestionRepository questionRepository;
    private final CompetitionEngineService competitionEngineService;

    public RoundController(
            RoundRepository roundRepository,
            QuestionRepository questionRepository,
            CompetitionEngineService competitionEngineService) {
        this.roundRepository = roundRepository;
        this.questionRepository = questionRepository;
        this.competitionEngineService = competitionEngineService;
    }

    private RoundResponse mapToDto(Round r) {
        RoundResponse dto = new RoundResponse();
        dto.setId(r.getId());
        dto.setRoundNumber(r.getRoundNumber());
        dto.setTitle(r.getTitle());
        dto.setSubtitle(r.getSubtitle());
        dto.setLanguage(r.getLanguage());
        dto.setDescription(r.getDescription());
        dto.setStatus(r.getStatus());
        dto.setStartTime(r.getStartTime());
        dto.setEndTime(r.getEndTime());
        dto.setDurationMinutes(r.getDurationMinutes());
        dto.setRemainingSeconds(competitionEngineService.getAuthoritativeRemainingSeconds(r));
        dto.setIsLocked(r.getIsLocked());
        dto.setQuestionCount(questionRepository.findByRoundIdAndIsEnabledTrueOrderByOrderIndexAsc(r.getId()).size());
        return dto;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoundResponse>>> getAllRounds() {
        List<RoundResponse> dtos = roundRepository.findAllByOrderByRoundNumberAsc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<RoundResponse>> getActiveRound() {
        return roundRepository.findByStatus("LIVE")
                .map(r -> ResponseEntity.ok(ApiResponse.ok(mapToDto(r))))
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.ok(null)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoundResponse>> getRoundById(@PathVariable Long id) {
        Round round = roundRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Round not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.ok(mapToDto(round)));
    }
}
