package com.gnanamani.codeathon.controller;

import com.gnanamani.codeathon.domain.Participant;
import com.gnanamani.codeathon.domain.Submission;
import com.gnanamani.codeathon.domain.SubmissionResult;
import com.gnanamani.codeathon.dto.*;
import com.gnanamani.codeathon.repository.ParticipantRepository;
import com.gnanamani.codeathon.repository.SubmissionRepository;
import com.gnanamani.codeathon.repository.SubmissionResultRepository;
import com.gnanamani.codeathon.service.AuditService;
import com.gnanamani.codeathon.service.RealtimeEventService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/judge")
public class JudgeController {

    private final SubmissionRepository submissionRepository;
    private final SubmissionResultRepository submissionResultRepository;
    private final ParticipantRepository participantRepository;
    private final AuditService auditService;
    private final RealtimeEventService realtimeEventService;

    public JudgeController(
            SubmissionRepository submissionRepository,
            SubmissionResultRepository submissionResultRepository,
            ParticipantRepository participantRepository,
            AuditService auditService,
            RealtimeEventService realtimeEventService) {
        this.submissionRepository = submissionRepository;
        this.submissionResultRepository = submissionResultRepository;
        this.participantRepository = participantRepository;
        this.auditService = auditService;
        this.realtimeEventService = realtimeEventService;
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

    @GetMapping("/submissions")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getAllSubmissions(
            @RequestParam(required = false) Long roundId,
            @RequestParam(required = false) String status) {
        List<Submission> list = (roundId != null)
                ? submissionRepository.findByRoundIdOrderBySubmissionTimeDesc(roundId)
                : submissionRepository.findAllByOrderBySubmissionTimeDesc();

        List<SubmissionResponse> dtos = list.stream()
                .filter(s -> status == null || status.equalsIgnoreCase(s.getStatus()))
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @GetMapping("/submissions/{id}")
    public ResponseEntity<ApiResponse<SubmissionDetailResponse>> getSubmissionDetailForJudge(@PathVariable Long id) {
        Submission s = submissionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found: " + id));

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

        // Judges have full privilege to see hidden test cases and actual/expected outputs
        List<SubmissionResultDto> resultDtos = results.stream().map(r -> {
            SubmissionResultDto rd = new SubmissionResultDto();
            rd.setTestCaseId(r.getTestCaseId());
            rd.setStatus(r.getStatus());
            rd.setExecutionTimeMs(r.getExecutionTimeMs());
            rd.setIsHidden(r.getIsHidden());
            rd.setActualOutput(r.getActualOutput());
            rd.setExpectedOutput(r.getExpectedOutput());
            rd.setError(r.getError());
            return rd;
        }).collect(Collectors.toList());

        detail.setResults(resultDtos);
        return ResponseEntity.ok(ApiResponse.ok(detail));
    }

    @PutMapping("/submissions/{id}/score")
    @PreAuthorize("hasAnyRole('JUDGE', 'ADMIN', 'SUPER_ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<SubmissionDetailResponse>> updateSubmissionScore(
            @PathVariable Long id,
            @RequestBody @Valid JudgeScoreUpdateRequest request,
            Authentication authentication) {
        Submission s = submissionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found: " + id));

        int oldScore = s.getScore() != null ? s.getScore() : 0;
        String oldStatus = s.getStatus();

        s.setScore(request.getScore());
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            s.setStatus(request.getStatus().toUpperCase());
        } else if (request.getScore() > 0 && !"PASSED".equalsIgnoreCase(s.getStatus())) {
            s.setStatus("PARTIAL");
        }

        submissionRepository.save(s);

        // Recalculate participant's overall score
        Participant participant = s.getParticipant();
        recalculateParticipantScore(participant);

        String judgeEmail = authentication != null ? authentication.getName() : "judge";
        String remarks = (request.getRemarks() != null && !request.getRemarks().isBlank())
                ? request.getRemarks()
                : "Manual score override by judge";

        auditService.log(
                judgeEmail,
                "JUDGE_SCORE_OVERRIDE",
                "Submission #" + id,
                String.format("Score overridden: %d -> %d (Status: %s -> %s). Remarks: %s",
                        oldScore, request.getScore(), oldStatus, s.getStatus(), remarks),
                null
        );

        return getSubmissionDetailForJudge(id);
    }

    @PutMapping("/participants/{id}/score")
    @PreAuthorize("hasAnyRole('JUDGE', 'ADMIN', 'SUPER_ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateParticipantTotalScore(
            @PathVariable Long id,
            @RequestBody @Valid JudgeParticipantScoreRequest request,
            Authentication authentication) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + id));

        int oldScore = participant.getTotalScore() != null ? participant.getTotalScore() : 0;
        participant.setTotalScore(request.getScore());
        participantRepository.save(participant);

        String judgeEmail = authentication != null ? authentication.getName() : "judge";
        String remarks = (request.getRemarks() != null && !request.getRemarks().isBlank())
                ? request.getRemarks()
                : "Direct total score adjustment by judge";

        auditService.log(
                judgeEmail,
                "JUDGE_PARTICIPANT_SCORE_OVERRIDE",
                "Participant #" + id + " (" + participant.getUser().getFullName() + ")",
                String.format("Participant score overridden: %d -> %d. Remarks: %s",
                        oldScore, request.getScore(), remarks),
                null
        );

        realtimeEventService.broadcast("LEADERBOARD_UPDATED", Map.of(
                "participantId", participant.getId(),
                "newScore", request.getScore()
        ));

        Map<String, Object> result = new HashMap<>();
        result.put("participantId", participant.getId());
        result.put("participantName", participant.getUser().getFullName());
        result.put("oldScore", oldScore);
        result.put("newScore", request.getScore());
        result.put("remarks", remarks);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/participants")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getParticipantsForJudge() {
        List<Participant> list = participantRepository.findByIsSuspendedFalseOrderByTotalScoreDesc();
        List<Map<String, Object>> result = list.stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("participantId", p.getId());
            m.put("userId", p.getUser().getId());
            m.put("fullName", p.getUser().getFullName());
            m.put("email", p.getUser().getEmail());
            m.put("college", p.getCollege());
            m.put("department", p.getDepartment());
            m.put("year", p.getYear());
            m.put("totalScore", p.getTotalScore() != null ? p.getTotalScore() : 0);
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    private void recalculateParticipantScore(Participant participant) {
        List<Submission> allSubs = submissionRepository.findByParticipantOrderBySubmissionTimeDesc(participant);
        Map<Long, Integer> bestScorePerQuestion = new HashMap<>();

        for (Submission s : allSubs) {
            Long qId = s.getQuestion().getId();
            bestScorePerQuestion.put(qId, Math.max(bestScorePerQuestion.getOrDefault(qId, 0), s.getScore() != null ? s.getScore() : 0));
        }

        int totalScore = bestScorePerQuestion.values().stream().mapToInt(Integer::intValue).sum();
        participant.setTotalScore(totalScore);
        participantRepository.save(participant);

        realtimeEventService.broadcast("LEADERBOARD_UPDATED", Map.of(
                "participantId", participant.getId(),
                "newScore", totalScore
        ));
    }
}
