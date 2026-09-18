package com.gnanamani.codeathon.controller;

import com.gnanamani.codeathon.domain.*;
import com.gnanamani.codeathon.dto.*;
import com.gnanamani.codeathon.repository.*;
import com.gnanamani.codeathon.service.SubmissionEvaluationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/submissions")
public class SubmissionController {

    private final SubmissionEvaluationService submissionEvaluationService;
    private final SubmissionRepository submissionRepository;
    private final SubmissionResultRepository submissionResultRepository;
    private final ParticipantRepository participantRepository;

    public SubmissionController(
            SubmissionEvaluationService submissionEvaluationService,
            SubmissionRepository submissionRepository,
            SubmissionResultRepository submissionResultRepository,
            ParticipantRepository participantRepository) {
        this.submissionEvaluationService = submissionEvaluationService;
        this.submissionRepository = submissionRepository;
        this.submissionResultRepository = submissionResultRepository;
        this.participantRepository = participantRepository;
    }

    private SubmissionResponse mapToDto(Submission s) {
        SubmissionResponse dto = new SubmissionResponse();
        dto.setId(s.getId());
        dto.setParticipantId(s.getParticipant().getId());
        dto.setParticipantName(s.getParticipant().getUser().getFullName());
        dto.setRoundId(s.getRound().getId());
        dto.setRoundNumber(s.getRound().getRoundNumber());
        dto.setQuestionId(s.getQuestion().getId());
        dto.setQuestionTitle(s.getQuestion().getTitle());
        dto.setLanguage(s.getLanguage());
        dto.setStatus(s.getStatus());
        dto.setScore(s.getScore());
        dto.setExecutionTimeMs(s.getExecutionTimeMs());
        dto.setMemoryKb(s.getMemoryKb());
        dto.setCompileOutput(s.getCompileOutput());
        dto.setSubmissionTime(s.getSubmissionTime());

        List<SubmissionResult> results = submissionResultRepository.findBySubmissionId(s.getId());
        dto.setTotalTestCases(results.size());
        dto.setPassedTestCases((int) results.stream().filter(r -> "PASSED".equals(r.getStatus())).count());
        return dto;
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<SubmissionResponse>> submitCode(
            @Valid @RequestBody SubmitCodeRequest request,
            Authentication authentication) {
        if (authentication == null) {
            throw new AccessDeniedException("Authentication required");
        }

        Participant participant = participantRepository.findByUserEmail(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Only registered participants can submit code."));

        Submission submission = submissionEvaluationService.evaluateSubmission(participant, request);
        return ResponseEntity.ok(ApiResponse.ok(mapToDto(submission)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getMySubmissions(Authentication authentication) {
        if (authentication == null) {
            throw new AccessDeniedException("Authentication required");
        }

        Participant participant = participantRepository.findByUserEmail(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Participant record not found."));

        List<SubmissionResponse> list = submissionRepository.findByParticipantOrderBySubmissionTimeDesc(participant)
                .stream().map(this::mapToDto).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/question/{questionId}/my")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getMySubmissionsForQuestion(
            @PathVariable Long questionId,
            Authentication authentication) {
        if (authentication == null) {
            throw new AccessDeniedException("Authentication required");
        }

        Participant participant = participantRepository.findByUserEmail(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Participant record not found."));

        List<SubmissionResponse> list = submissionRepository.findByParticipantIdAndQuestionIdOrderBySubmissionTimeDesc(
                participant.getId(), questionId).stream().map(this::mapToDto).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubmissionDetailResponse>> getSubmissionDetail(
            @PathVariable Long id,
            Authentication authentication) {
        Submission s = submissionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found: " + id));

        // Ownership validation
        boolean isOwner = authentication != null && s.getParticipant().getUser().getEmail().equals(authentication.getName());
        boolean isStaff = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN") || a.getAuthority().equals("ROLE_JUDGE"));

        if (!isOwner && !isStaff) {
            throw new AccessDeniedException("Access denied to this submission.");
        }

        SubmissionDetailResponse detail = new SubmissionDetailResponse();
        detail.setId(s.getId());
        detail.setParticipantId(s.getParticipant().getId());
        detail.setParticipantName(s.getParticipant().getUser().getFullName());
        detail.setRoundId(s.getRound().getId());
        detail.setRoundNumber(s.getRound().getRoundNumber());
        detail.setQuestionId(s.getQuestion().getId());
        detail.setQuestionTitle(s.getQuestion().getTitle());
        detail.setLanguage(s.getLanguage());
        detail.setStatus(s.getStatus());
        detail.setScore(s.getScore());
        detail.setExecutionTimeMs(s.getExecutionTimeMs());
        detail.setMemoryKb(s.getMemoryKb());
        detail.setCompileOutput(s.getCompileOutput());
        detail.setSubmissionTime(s.getSubmissionTime());
        detail.setSourceCode(s.getSourceCode());

        List<SubmissionResult> results = submissionResultRepository.findBySubmissionId(s.getId());
        detail.setTotalTestCases(results.size());
        detail.setPassedTestCases((int) results.stream().filter(r -> "PASSED".equals(r.getStatus())).count());

        // For non-staff participants, sanitize hidden test case expected/actual outputs
        List<SubmissionResultDto> resultDtos = results.stream().map(r -> {
            SubmissionResultDto rd = new SubmissionResultDto();
            rd.setTestCaseId(r.getTestCaseId());
            rd.setStatus(r.getStatus());
            rd.setExecutionTimeMs(r.getExecutionTimeMs());
            rd.setIsHidden(r.getIsHidden());
            if (r.getIsHidden() && !isStaff) {
                rd.setActualOutput("[HIDDEN TEST CASE]");
                rd.setExpectedOutput("[HIDDEN TEST CASE]");
            } else {
                rd.setActualOutput(r.getActualOutput());
                rd.setExpectedOutput(r.getExpectedOutput());
            }
            rd.setError(r.getError());
            return rd;
        }).collect(Collectors.toList());

        detail.setResults(resultDtos);
        return ResponseEntity.ok(ApiResponse.ok(detail));
    }

    @PostMapping("/playground/run")
    public ResponseEntity<ApiResponse<Map<String, Object>>> runPlayground(
            @Valid @RequestBody RunPlaygroundRequest request) {
        Map<String, Object> result = submissionEvaluationService.runPlaygroundCode(
                request.getLanguage(),
                request.getSourceCode(),
                request.getCustomInput()
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
