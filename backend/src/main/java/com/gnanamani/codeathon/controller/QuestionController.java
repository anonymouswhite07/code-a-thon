package com.gnanamani.codeathon.controller;

import com.gnanamani.codeathon.domain.*;
import com.gnanamani.codeathon.dto.*;
import com.gnanamani.codeathon.repository.*;
import com.gnanamani.codeathon.service.QuestionOrderingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/questions")
public class QuestionController {

    private final QuestionRepository questionRepository;
    private final TestCaseRepository testCaseRepository;
    private final SubmissionRepository submissionRepository;
    private final ParticipantRepository participantRepository;
    private final QuestionOrderingService questionOrderingService;
    private final ParticipantQuestionLockRepository lockRepository;

    public QuestionController(
            QuestionRepository questionRepository,
            TestCaseRepository testCaseRepository,
            SubmissionRepository submissionRepository,
            ParticipantRepository participantRepository,
            QuestionOrderingService questionOrderingService,
            ParticipantQuestionLockRepository lockRepository) {
        this.questionRepository = questionRepository;
        this.testCaseRepository = testCaseRepository;
        this.submissionRepository = submissionRepository;
        this.participantRepository = participantRepository;
        this.questionOrderingService = questionOrderingService;
        this.lockRepository = lockRepository;
    }

    @GetMapping("/round/{roundId}")
    public ResponseEntity<ApiResponse<List<QuestionSummaryResponse>>> getQuestionsForRound(
            @PathVariable Long roundId,
            Authentication authentication) {

        Optional<Participant> participantOpt = Optional.empty();
        if (authentication != null) {
            participantOpt = participantRepository.findByUserEmail(authentication.getName());
        }

        final Optional<Participant> currentParticipant = participantOpt;
        List<Question> questions = currentParticipant.isPresent()
                ? questionOrderingService.getOrderedQuestionsForParticipant(currentParticipant.get(), roundId)
                : questionRepository.findByRoundIdAndIsEnabledTrueOrderByOrderIndexAsc(roundId);

        List<QuestionSummaryResponse> responses = new ArrayList<>();
        for (int i = 0; i < questions.size(); i++) {
            Question q = questions.get(i);
            QuestionSummaryResponse dto = new QuestionSummaryResponse();
            dto.setId(q.getId());
            dto.setRoundId(q.getRound().getId());
            dto.setTitle(q.getTitle());
            dto.setSlug(q.getSlug());
            dto.setDifficulty(q.getDifficulty());
            dto.setPoints(q.getPoints());
            dto.setOrderIndex(i + 1); // Randomized sequential index for this participant
            dto.setStatus("UNSOLVED");
            dto.setBestScore(0);
            dto.setIsLocked(false);

            if (currentParticipant.isPresent()) {
                Participant p = currentParticipant.get();
                boolean locked = lockRepository.existsByParticipantIdAndQuestionIdAndIsLockedTrue(p.getId(), q.getId());
                dto.setIsLocked(locked);

                List<Submission> subs = submissionRepository.findByParticipantIdAndQuestionIdOrderBySubmissionTimeDesc(
                        p.getId(), q.getId());
                if (!subs.isEmpty()) {
                    int maxScore = subs.stream().mapToInt(Submission::getScore).max().orElse(0);
                    dto.setBestScore(maxScore);
                    boolean passed = subs.stream().anyMatch(s -> "PASSED".equals(s.getStatus()));
                    dto.setStatus(passed ? "SOLVED" : "ATTEMPTED");
                }
            }

            responses.add(dto);
        }

        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionDetailResponse>> getQuestionDetail(
            @PathVariable Long id,
            Authentication authentication) {
        Question q = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + id));

        // Security Restriction: If this question is locked for the requesting participant, deny viewing!
        if (authentication != null) {
            Optional<Participant> pOpt = participantRepository.findByUserEmail(authentication.getName());
            if (pOpt.isPresent()) {
                Participant p = pOpt.get();
                if (lockRepository.existsByParticipantIdAndQuestionIdAndIsLockedTrue(p.getId(), id)) {
                    throw new IllegalStateException("Access restricted: Question #" + id + " has already been locked and completed. Viewing past questions is restricted during the competition arena.");
                }
            }
        }

        QuestionDetailResponse dto = new QuestionDetailResponse();
        dto.setId(q.getId());
        dto.setRoundId(q.getRound().getId());
        dto.setRoundNumber(q.getRound().getRoundNumber());
        dto.setLanguage(q.getRound().getLanguage());
        dto.setTitle(q.getTitle());
        dto.setSlug(q.getSlug());
        dto.setDescription(q.getDescription());
        dto.setInputFormat(q.getInputFormat());
        dto.setOutputFormat(q.getOutputFormat());
        dto.setConstraints(q.getConstraints());
        dto.setExamples(q.getExamples());
        dto.setStarterCode(q.getStarterCode());
        dto.setDifficulty(q.getDifficulty());
        dto.setPoints(q.getPoints());
        dto.setTimeLimitMs(q.getTimeLimitMs());
        dto.setMemoryLimitMb(q.getMemoryLimitMb());

        // ONLY expose non-hidden test cases to participants!
        List<TestCaseDto> sampleCases = testCaseRepository.findByQuestionIdAndIsHiddenFalseOrderByOrderIndexAsc(q.getId())
                .stream()
                .map(tc -> new TestCaseDto(tc.getId(), tc.getInputData(), tc.getExpectedOutput(), false, tc.getOrderIndex()))
                .collect(Collectors.toList());

        dto.setSampleTestCases(sampleCases);

        return ResponseEntity.ok(ApiResponse.ok(dto));
    }
}
