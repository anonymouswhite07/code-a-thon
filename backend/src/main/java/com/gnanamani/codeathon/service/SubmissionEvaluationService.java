package com.gnanamani.codeathon.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnanamani.codeathon.domain.*;
import com.gnanamani.codeathon.dto.SubmitCodeRequest;
import com.gnanamani.codeathon.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SubmissionEvaluationService {

    private static final Logger log = LoggerFactory.getLogger(SubmissionEvaluationService.class);

    private final SubmissionRepository submissionRepository;
    private final SubmissionResultRepository submissionResultRepository;
    private final QuestionRepository questionRepository;
    private final TestCaseRepository testCaseRepository;
    private final ParticipantRepository participantRepository;
    private final CompetitionEngineService competitionEngineService;
    private final RealtimeEventService realtimeEventService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.code-runner.url:http://localhost:5050}")
    private String codeRunnerUrl;

    public SubmissionEvaluationService(
            SubmissionRepository submissionRepository,
            SubmissionResultRepository submissionResultRepository,
            QuestionRepository questionRepository,
            TestCaseRepository testCaseRepository,
            ParticipantRepository participantRepository,
            CompetitionEngineService competitionEngineService,
            RealtimeEventService realtimeEventService) {
        this.submissionRepository = submissionRepository;
        this.submissionResultRepository = submissionResultRepository;
        this.questionRepository = questionRepository;
        this.testCaseRepository = testCaseRepository;
        this.participantRepository = participantRepository;
        this.competitionEngineService = competitionEngineService;
        this.realtimeEventService = realtimeEventService;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Transactional
    public Submission evaluateSubmission(Participant participant, SubmitCodeRequest request) {
        if (participant.getIsSuspended()) {
            throw new IllegalStateException("Participant account is suspended.");
        }

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + request.getQuestionId()));

        Round round = question.getRound();
        if (!competitionEngineService.isSubmissionAllowed(round)) {
            throw new IllegalStateException("Submissions are not currently allowed for Round " + round.getRoundNumber() + " (Status: " + round.getStatus() + ")");
        }

        List<TestCase> testCases = testCaseRepository.findByQuestionOrderByOrderIndexAsc(question);
        if (testCases.isEmpty()) {
            throw new IllegalStateException("No test cases configured for this question.");
        }

        // Prepare initial submission record
        Submission submission = new Submission();
        submission.setParticipant(participant);
        submission.setRound(round);
        submission.setQuestion(question);
        submission.setLanguage(request.getLanguage().toUpperCase());
        submission.setSourceCode(request.getSourceCode());
        submission.setStatus("RUNNING");
        submission.setSubmissionTime(LocalDateTime.now());
        submission = submissionRepository.save(submission);

        // Build payload for code-runner
        List<Map<String, Object>> tcPayload = new ArrayList<>();
        for (TestCase tc : testCases) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", String.valueOf(tc.getId()));
            map.put("input", tc.getInputData() != null ? tc.getInputData() : "");
            map.put("expectedOutput", tc.getExpectedOutput());
            map.put("isHidden", tc.getIsHidden());
            tcPayload.add(map);
        }

        Map<String, Object> runnerRequest = new HashMap<>();
        runnerRequest.put("language", request.getLanguage().toLowerCase());
        runnerRequest.put("sourceCode", request.getSourceCode());
        runnerRequest.put("testCases", tcPayload);
        runnerRequest.put("timeLimitMs", question.getTimeLimitMs());
        runnerRequest.put("memoryLimitMb", question.getMemoryLimitMb());

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(runnerRequest, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(codeRunnerUrl + "/execute", entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            String overallStatus = root.path("overallStatus").asText("FAILED");
            double scorePercent = root.path("scorePercent").asDouble(0.0);
            int executionTimeMs = root.path("executionTimeMs").asInt(0);
            int memoryKb = root.path("memoryKb").asInt(0);
            String compileOutput = root.path("compileOutput").asText("");

            int awardedScore = (int) Math.round((scorePercent / 100.0) * question.getPoints());

            submission.setStatus(overallStatus);
            submission.setScore(awardedScore);
            submission.setExecutionTimeMs(executionTimeMs);
            submission.setMemoryKb(memoryKb);
            submission.setCompileOutput(compileOutput);

            // Save individual results
            JsonNode resultsNode = root.path("results");
            List<SubmissionResult> resultList = new ArrayList<>();
            if (resultsNode.isArray()) {
                for (JsonNode r : resultsNode) {
                    SubmissionResult sr = new SubmissionResult();
                    sr.setSubmission(submission);
                    sr.setTestCaseId(r.path("testCaseId").asText());
                    sr.setStatus(r.path("status").asText("FAILED"));
                    sr.setExecutionTimeMs(r.path("executionTimeMs").asInt(0));
                    sr.setActualOutput(r.path("actualOutput").asText(""));
                    sr.setExpectedOutput(r.path("expectedOutput").asText(""));
                    sr.setIsHidden(r.path("isHidden").asBoolean(false));
                    sr.setError(r.has("error") && !r.get("error").isNull() ? r.get("error").asText() : null);
                    resultList.add(sr);
                }
            }
            submission.setResults(resultList);
            submissionResultRepository.saveAll(resultList);
            submission = submissionRepository.save(submission);

            // Recompute participant total score: sum of max score achieved on each question
            updateParticipantScore(participant);

            // Realtime event broadcast
            realtimeEventService.broadcast("SUBMISSION_COMPLETED", Map.of(
                    "submissionId", submission.getId(),
                    "participantId", participant.getId(),
                    "participantName", participant.getUser().getFullName(),
                    "questionTitle", question.getTitle(),
                    "status", submission.getStatus(),
                    "score", submission.getScore()
            ));

            return submission;

        } catch (Exception e) {
            log.error("Execution failed through runner", e);
            submission.setStatus("FAILED");
            submission.setCompileOutput("Execution Service Error: " + e.getMessage());
            return submissionRepository.save(submission);
        }
    }

    private void updateParticipantScore(Participant participant) {
        List<Submission> allSubs = submissionRepository.findByParticipantOrderBySubmissionTimeDesc(participant);
        Map<Long, Integer> bestScorePerQuestion = new HashMap<>();

        for (Submission s : allSubs) {
            Long qId = s.getQuestion().getId();
            bestScorePerQuestion.put(qId, Math.max(bestScorePerQuestion.getOrDefault(qId, 0), s.getScore()));
        }

        int totalScore = bestScorePerQuestion.values().stream().mapToInt(Integer::intValue).sum();
        participant.setTotalScore(totalScore);
        participantRepository.save(participant);

        realtimeEventService.broadcast("LEADERBOARD_UPDATED", Map.of(
                "participantId", participant.getId(),
                "newScore", totalScore
        ));
    }

    public Map<String, Object> runPlaygroundCode(String language, String sourceCode, String customInput) {
        Map<String, Object> tc = new HashMap<>();
        tc.put("id", "playground-1");
        tc.put("input", customInput != null ? customInput : "");
        tc.put("expectedOutput", "");
        tc.put("isHidden", false);

        Map<String, Object> runnerRequest = new HashMap<>();
        runnerRequest.put("language", language.toLowerCase());
        runnerRequest.put("sourceCode", sourceCode);
        runnerRequest.put("testCases", List.of(tc));
        runnerRequest.put("timeLimitMs", 3000);
        runnerRequest.put("memoryLimitMb", 128);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(runnerRequest, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(codeRunnerUrl + "/execute", entity, Map.class);
        return response.getBody();
    }
}
