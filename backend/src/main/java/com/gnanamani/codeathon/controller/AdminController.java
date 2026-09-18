package com.gnanamani.codeathon.controller;

import com.gnanamani.codeathon.domain.*;
import com.gnanamani.codeathon.dto.*;
import com.gnanamani.codeathon.repository.*;
import com.gnanamani.codeathon.service.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final ParticipantRepository participantRepository;
    private final SubmissionRepository submissionRepository;
    private final RoundRepository roundRepository;
    private final QuestionRepository questionRepository;
    private final TestCaseRepository testCaseRepository;
    private final AnnouncementRepository announcementRepository;
    private final AuditLogRepository auditLogRepository;
    private final CompetitionEngineService competitionEngineService;
    private final LeaderboardService leaderboardService;
    private final RealtimeEventService realtimeEventService;
    private final AuditService auditService;

    public AdminController(
            ParticipantRepository participantRepository,
            SubmissionRepository submissionRepository,
            RoundRepository roundRepository,
            QuestionRepository questionRepository,
            TestCaseRepository testCaseRepository,
            AnnouncementRepository announcementRepository,
            AuditLogRepository auditLogRepository,
            CompetitionEngineService competitionEngineService,
            LeaderboardService leaderboardService,
            RealtimeEventService realtimeEventService,
            AuditService auditService) {
        this.participantRepository = participantRepository;
        this.submissionRepository = submissionRepository;
        this.roundRepository = roundRepository;
        this.questionRepository = questionRepository;
        this.testCaseRepository = testCaseRepository;
        this.announcementRepository = announcementRepository;
        this.auditLogRepository = auditLogRepository;
        this.competitionEngineService = competitionEngineService;
        this.leaderboardService = leaderboardService;
        this.realtimeEventService = realtimeEventService;
        this.auditService = auditService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> getDashboardStats() {
        AdminDashboardStatsResponse stats = new AdminDashboardStatsResponse();
        stats.setTotalParticipants(participantRepository.count());
        stats.setActiveParticipants(participantRepository.findByIsSuspendedFalseOrderByTotalScoreDesc().size());
        stats.setTotalSubmissions(submissionRepository.count());
        stats.setPassedSubmissions(submissionRepository.countByStatus("PASSED"));
        stats.setFailedSubmissions(submissionRepository.countByStatus("FAILED") + submissionRepository.countByStatus("COMPILE_ERROR") + submissionRepository.countByStatus("TIME_LIMIT"));

        Optional<Round> liveRound = roundRepository.findByStatus("LIVE");
        if (liveRound.isPresent()) {
            stats.setCurrentRoundTitle(liveRound.get().getTitle());
            stats.setCurrentRoundStatus("LIVE");
            stats.setCurrentRoundRemainingSeconds(competitionEngineService.getAuthoritativeRemainingSeconds(liveRound.get()));
        } else {
            stats.setCurrentRoundTitle("No round currently live");
            stats.setCurrentRoundStatus("IDLE");
            stats.setCurrentRoundRemainingSeconds(0L);
        }

        stats.setLeaderboardFrozen(leaderboardService.isLeaderboardFrozen());
        stats.setFinalResultsPublished(leaderboardService.isFinalResultsPublished());

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @PostMapping("/rounds/{id}/control")
    public ResponseEntity<ApiResponse<RoundResponse>> controlRound(
            @PathVariable Long id,
            @RequestBody RoundControlRequest request,
            Authentication authentication) {
        String adminEmail = authentication != null ? authentication.getName() : "admin@gct.ac.in";
        String action = request.getAction() != null ? request.getAction().toUpperCase() : "START";

        Round round;
        switch (action) {
            case "START":
                round = competitionEngineService.startRound(id, request.getDurationMinutes(), adminEmail);
                break;
            case "PAUSE":
                round = competitionEngineService.pauseRound(id, adminEmail);
                break;
            case "RESUME":
                round = competitionEngineService.resumeRound(id, adminEmail);
                break;
            case "END":
                round = competitionEngineService.endRound(id, adminEmail);
                break;
            default:
                throw new IllegalArgumentException("Unknown round action: " + action);
        }

        RoundResponse resp = new RoundResponse();
        resp.setId(round.getId());
        resp.setRoundNumber(round.getRoundNumber());
        resp.setTitle(round.getTitle());
        resp.setStatus(round.getStatus());
        resp.setDurationMinutes(round.getDurationMinutes());
        resp.setRemainingSeconds(competitionEngineService.getAuthoritativeRemainingSeconds(round));
        return ResponseEntity.ok(ApiResponse.ok(resp));
    }

    @PostMapping("/rounds/{id}/lock")
    public ResponseEntity<ApiResponse<Void>> toggleRoundLock(
            @PathVariable Long id,
            @RequestParam boolean locked,
            Authentication authentication) {
        String adminEmail = authentication != null ? authentication.getName() : "admin@gct.ac.in";
        competitionEngineService.setRoundLock(id, locked, adminEmail);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/participants")
    public ResponseEntity<ApiResponse<List<ParticipantAdminResponse>>> getAllParticipants(
            @RequestParam(required = false) String search) {
        List<Participant> list = participantRepository.findAll();
        List<ParticipantAdminResponse> dtos = list.stream()
                .filter(p -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String s = search.toLowerCase();
                    return p.getUser().getFullName().toLowerCase().contains(s) ||
                            p.getUser().getEmail().toLowerCase().contains(s) ||
                            p.getCollege().toLowerCase().contains(s);
                })
                .map(p -> {
                    ParticipantAdminResponse dto = new ParticipantAdminResponse();
                    dto.setId(p.getId());
                    dto.setUserId(p.getUser().getId());
                    dto.setEmail(p.getUser().getEmail());
                    dto.setFullName(p.getUser().getFullName());
                    dto.setPhone(p.getPhone());
                    dto.setCollege(p.getCollege());
                    dto.setDepartment(p.getDepartment());
                    dto.setYear(p.getYear());
                    dto.setProgrammingExp(p.getProgrammingExp());
                    dto.setTotalScore(p.getTotalScore());
                    dto.setIsSuspended(p.getIsSuspended());
                    dto.setRegisteredAt(p.getUser().getCreatedAt());
                    return dto;
                }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @PostMapping("/participants/{id}/suspend")
    @Transactional
    public ResponseEntity<ApiResponse<Boolean>> toggleSuspend(
            @PathVariable Long id,
            Authentication authentication) {
        Participant p = participantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + id));

        boolean newStatus = !p.getIsSuspended();
        p.setIsSuspended(newStatus);
        participantRepository.save(p);

        String adminEmail = authentication != null ? authentication.getName() : "admin@gct.ac.in";
        auditService.log(adminEmail, newStatus ? "PARTICIPANT_SUSPENDED" : "PARTICIPANT_RESTORED",
                "Participant " + p.getId(), p.getUser().getEmail(), "127.0.0.1");

        return ResponseEntity.ok(ApiResponse.ok(newStatus));
    }

    @GetMapping("/questions")
    public ResponseEntity<ApiResponse<List<QuestionDetailResponse>>> getAllQuestionsAdmin() {
        List<Question> questions = questionRepository.findAll();
        List<QuestionDetailResponse> list = questions.stream().map(q -> {
            QuestionDetailResponse dto = new QuestionDetailResponse();
            dto.setId(q.getId());
            dto.setRoundId(q.getRound().getId());
            dto.setRoundNumber(q.getRound().getRoundNumber());
            dto.setLanguage(q.getRound().getLanguage());
            dto.setTitle(q.getTitle());
            dto.setSlug(q.getSlug());
            dto.setDescription(q.getDescription());
            dto.setDifficulty(q.getDifficulty());
            dto.setPoints(q.getPoints());
            dto.setTimeLimitMs(q.getTimeLimitMs());
            dto.setMemoryLimitMb(q.getMemoryLimitMb());

            List<TestCaseDto> tcDtos = testCaseRepository.findByQuestionOrderByOrderIndexAsc(q).stream()
                    .map(tc -> new TestCaseDto(tc.getId(), tc.getInputData(), tc.getExpectedOutput(), tc.getIsHidden(), tc.getOrderIndex()))
                    .collect(Collectors.toList());
            dto.setSampleTestCases(tcDtos);
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/questions")
    @Transactional
    public ResponseEntity<ApiResponse<Long>> createQuestion(
            @Valid @RequestBody CreateQuestionRequest request,
            Authentication authentication) {
        Round round = roundRepository.findById(request.getRoundId())
                .orElseThrow(() -> new IllegalArgumentException("Round not found: " + request.getRoundId()));

        Question q = new Question();
        q.setRound(round);
        q.setTitle(request.getTitle());
        q.setSlug(request.getSlug());
        q.setDescription(request.getDescription());
        q.setInputFormat(request.getInputFormat());
        q.setOutputFormat(request.getOutputFormat());
        q.setConstraints(request.getConstraints());
        q.setExamples(request.getExamples());
        q.setStarterCode(request.getStarterCode());
        q.setDifficulty(request.getDifficulty());
        q.setPoints(request.getPoints());
        q.setTimeLimitMs(request.getTimeLimitMs());
        q.setMemoryLimitMb(request.getMemoryLimitMb());
        q.setIsEnabled(request.getIsEnabled());
        q.setOrderIndex(request.getOrderIndex());

        Question saved = questionRepository.save(q);

        if (request.getTestCases() != null) {
            for (TestCaseDto tc : request.getTestCases()) {
                testCaseRepository.save(new TestCase(
                        saved,
                        tc.getInputData(),
                        tc.getExpectedOutput(),
                        tc.getIsHidden() != null && tc.getIsHidden(),
                        tc.getOrderIndex() != null ? tc.getOrderIndex() : 0
                ));
            }
        }

        String adminEmail = authentication != null ? authentication.getName() : "admin@gct.ac.in";
        auditService.log(adminEmail, "QUESTION_CREATED", "Question " + saved.getId(), saved.getTitle(), "127.0.0.1");

        return ResponseEntity.ok(ApiResponse.ok(saved.getId()));
    }

    @DeleteMapping("/questions/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(
            @PathVariable Long id,
            Authentication authentication) {
        Question q = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + id));

        testCaseRepository.deleteAll(testCaseRepository.findByQuestionOrderByOrderIndexAsc(q));
        questionRepository.delete(q);

        String adminEmail = authentication != null ? authentication.getName() : "admin@gct.ac.in";
        auditService.log(adminEmail, "QUESTION_DELETED", "Question " + id, q.getTitle(), "127.0.0.1");

        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/announcements")
    @Transactional
    public ResponseEntity<ApiResponse<AnnouncementResponse>> createAnnouncement(
            @Valid @RequestBody CreateAnnouncementRequest request,
            Authentication authentication) {
        String adminEmail = authentication != null ? authentication.getName() : "admin@gct.ac.in";

        Announcement a = new Announcement(
                request.getTitle(),
                request.getContent(),
                request.getType(),
                request.getTargetRoundId(),
                adminEmail
        );
        Announcement saved = announcementRepository.save(a);

        auditService.log(adminEmail, "ANNOUNCEMENT_CREATED", "Announcement " + saved.getId(), saved.getTitle(), "127.0.0.1");

        realtimeEventService.broadcast("ANNOUNCEMENT_CREATED", Map.of(
                "id", saved.getId(),
                "title", saved.getTitle(),
                "content", saved.getContent(),
                "type", saved.getType(),
                "targetRoundId", saved.getTargetRoundId() != null ? saved.getTargetRoundId() : 0
        ));

        AnnouncementResponse dto = new AnnouncementResponse();
        dto.setId(saved.getId());
        dto.setTitle(saved.getTitle());
        dto.setContent(saved.getContent());
        dto.setType(saved.getType());
        dto.setTargetRoundId(saved.getTargetRoundId());
        dto.setCreatedBy(saved.getCreatedBy());
        dto.setCreatedAt(saved.getCreatedAt());

        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PostMapping("/leaderboard/freeze")
    public ResponseEntity<ApiResponse<Void>> toggleLeaderboardFreeze(
            @RequestParam boolean freeze,
            Authentication authentication) {
        String adminEmail = authentication != null ? authentication.getName() : "admin@gct.ac.in";
        leaderboardService.setFreezeStatus(freeze, adminEmail);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/leaderboard/publish-final")
    public ResponseEntity<ApiResponse<Void>> publishFinalResults(
            @RequestParam boolean publish,
            Authentication authentication) {
        String adminEmail = authentication != null ? authentication.getName() : "admin@gct.ac.in";
        leaderboardService.setFinalResultsPublished(publish, adminEmail);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogs() {
        List<AuditLogResponse> list = auditLogRepository.findAllByOrderByTimestampDesc().stream().map(a -> {
            AuditLogResponse dto = new AuditLogResponse();
            dto.setId(a.getId());
            dto.setUserEmail(a.getUserEmail());
            dto.setAction(a.getAction());
            dto.setTargetEntity(a.getTargetEntity());
            dto.setDetails(a.getDetails());
            dto.setIpAddress(a.getIpAddress());
            dto.setTimestamp(a.getTimestamp());
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
