package com.gnanamani.codeathon.controller;

import com.gnanamani.codeathon.domain.Submission;
import com.gnanamani.codeathon.domain.SubmissionResult;
import com.gnanamani.codeathon.dto.ApiResponse;
import com.gnanamani.codeathon.dto.SubmissionDetailResponse;
import com.gnanamani.codeathon.dto.SubmissionResponse;
import com.gnanamani.codeathon.dto.SubmissionResultDto;
import com.gnanamani.codeathon.repository.SubmissionRepository;
import com.gnanamani.codeathon.repository.SubmissionResultRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/judge")
public class JudgeController {

    private final SubmissionRepository submissionRepository;
    private final SubmissionResultRepository submissionResultRepository;

    public JudgeController(
            SubmissionRepository submissionRepository,
            SubmissionResultRepository submissionResultRepository) {
        this.submissionRepository = submissionRepository;
        this.submissionResultRepository = submissionResultRepository;
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
}
