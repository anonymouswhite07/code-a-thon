package com.gnanamani.codeathon.controller;

import com.gnanamani.codeathon.domain.CompetitionSession;
import com.gnanamani.codeathon.domain.IntegrityEvent;
import com.gnanamani.codeathon.domain.Participant;
import com.gnanamani.codeathon.domain.Round;
import com.gnanamani.codeathon.dto.*;
import com.gnanamani.codeathon.repository.CompetitionSessionRepository;
import com.gnanamani.codeathon.repository.IntegrityEventRepository;
import com.gnanamani.codeathon.repository.ParticipantQuestionLockRepository;
import com.gnanamani.codeathon.repository.ParticipantRepository;
import com.gnanamani.codeathon.repository.UserRepository;
import com.gnanamani.codeathon.repository.RoundRepository;
import com.gnanamani.codeathon.service.CompetitionEngineService;
import com.gnanamani.codeathon.service.IntegrityService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1")
public class IntegrityController {

    private final IntegrityService integrityService;
    private final ParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final CompetitionSessionRepository sessionRepository;
    private final IntegrityEventRepository eventRepository;
    private final ParticipantQuestionLockRepository lockRepository;
    private final RoundRepository roundRepository;
    private final CompetitionEngineService competitionEngineService;

    public IntegrityController(
            IntegrityService integrityService,
            ParticipantRepository participantRepository,
            UserRepository userRepository,
            CompetitionSessionRepository sessionRepository,
            IntegrityEventRepository eventRepository,
            ParticipantQuestionLockRepository lockRepository,
            RoundRepository roundRepository,
            CompetitionEngineService competitionEngineService) {
        this.integrityService = integrityService;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.eventRepository = eventRepository;
        this.lockRepository = lockRepository;
        this.roundRepository = roundRepository;
        this.competitionEngineService = competitionEngineService;
    }

    private Participant getAuthenticatedParticipant(Authentication authentication) {
        if (authentication == null) {
            throw new AccessDeniedException("Authentication required. Please log in.");
        }
        String email = authentication.getName();
        return participantRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    com.gnanamani.codeathon.domain.User user = userRepository.findByEmail(email).orElse(null);
                    if (user != null) {
                        String roleLabel = user.getRole() == com.gnanamani.codeathon.domain.Role.ROLE_PARTICIPANT ? "Participant" : "Staff / Faculty";
                        Participant p = new Participant(user, "0000000000", "Gnanamani College of Technology", "Computer Science", roleLabel, "Advanced");
                        return participantRepository.save(p);
                    }
                    throw new AccessDeniedException("Authenticated user account not found: " + email);
                });
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }

    @PostMapping("/integrity/session/start")
    public ResponseEntity<ApiResponse<StartSessionResponse>> startSession(
            @Valid @RequestBody StartSessionRequest request,
            Authentication authentication,
            HttpServletRequest httpServletRequest) {
        Participant participant = getAuthenticatedParticipant(authentication);
        StartSessionResponse response = integrityService.startSession(
                participant, request.getRoundId(), request.getAgreementAccepted(), getClientIp(httpServletRequest)
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/integrity/session/status")
    public ResponseEntity<ApiResponse<StartSessionResponse>> getSessionStatus(
            @RequestParam Long roundId,
            Authentication authentication) {
        Participant participant = getAuthenticatedParticipant(authentication);
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new IllegalArgumentException("Round not found: " + roundId));

        Optional<CompetitionSession> sessionOpt = sessionRepository
                .findFirstByParticipantAndRoundOrderByStartedAtDesc(participant, round);

        if (sessionOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.ok(null));
        }

        CompetitionSession session = sessionOpt.get();
        List<Long> lockedIds = lockRepository.findByParticipantAndRound(participant, round).stream()
                .filter(l -> Boolean.TRUE.equals(l.getIsLocked()))
                .map(l -> l.getQuestion().getId())
                .toList();

        StartSessionResponse resp = new StartSessionResponse();
        resp.setSessionToken(session.getSessionToken());
        resp.setRoundId(round.getId());
        resp.setRoundNumber(round.getRoundNumber());
        resp.setRoundTitle(round.getTitle());
        resp.setCurrentQuestionId(session.getCurrentQuestion() != null ? session.getCurrentQuestion().getId() : null);
        resp.setStartedAt(session.getStartedAt());
        resp.setRemainingSeconds(competitionEngineService.getAuthoritativeRemainingSeconds(round));
        resp.setLockedQuestionIds(lockedIds);
        resp.setIsCompleted("COMPLETED".equals(session.getStatus()) || "TERMINATED_FULLSCREEN".equals(session.getStatus()));
        resp.setStatus(session.getStatus());

        return ResponseEntity.ok(ApiResponse.ok(resp));
    }

    @PostMapping("/integrity/session/fullscreen-exit-terminate")
    public ResponseEntity<ApiResponse<FullscreenExitTerminationResponse>> fullscreenExitTerminate(
            @Valid @RequestBody FullscreenExitTerminationRequest request,
            Authentication authentication,
            HttpServletRequest httpServletRequest) {
        Participant participant = getAuthenticatedParticipant(authentication);
        FullscreenExitTerminationResponse response = integrityService.handleFullscreenExitTermination(
                participant, request, getClientIp(httpServletRequest)
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/integrity/event")
    public ResponseEntity<ApiResponse<Map<String, String>>> recordEvent(
            @Valid @RequestBody RecordIntegrityEventRequest request,
            Authentication authentication,
            HttpServletRequest httpServletRequest) {
        Participant participant = getAuthenticatedParticipant(authentication);
        integrityService.recordIntegrityEvent(participant, request, getClientIp(httpServletRequest));
        return ResponseEntity.ok(ApiResponse.ok(Map.of("status", "RECORDED")));
    }

    @PostMapping("/integrity/tab-switch-submit")
    public ResponseEntity<ApiResponse<TabSwitchAutoSubmitResponse>> tabSwitchAutoSubmit(
            @Valid @RequestBody TabSwitchAutoSubmitRequest request,
            Authentication authentication,
            HttpServletRequest httpServletRequest) {
        Participant participant = getAuthenticatedParticipant(authentication);
        TabSwitchAutoSubmitResponse response = integrityService.handleTabSwitchAutoSubmit(
                participant, request, getClientIp(httpServletRequest)
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/integrity/question/advance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> advanceQuestion(
            @Valid @RequestBody AdvanceQuestionRequest request,
            Authentication authentication,
            HttpServletRequest httpServletRequest) {
        Participant participant = getAuthenticatedParticipant(authentication);
        Map<String, Object> response = integrityService.advanceQuestion(
                participant, request, getClientIp(httpServletRequest)
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // Admin endpoint: List sessions with integrity stats
    @GetMapping("/admin/integrity/sessions")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAdminSessions(
            @RequestParam(required = false) Long roundId) {
        List<CompetitionSession> sessions = (roundId != null)
                ? sessionRepository.findByRoundIdOrderByStartedAtDesc(roundId)
                : sessionRepository.findAllByOrderByStartedAtDesc();

        List<Map<String, Object>> result = sessions.stream().map(s -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("sessionId", s.getId());
            map.put("sessionToken", s.getSessionToken());
            map.put("participantId", s.getParticipant().getId());
            map.put("participantName", s.getParticipant().getUser().getFullName());
            map.put("participantEmail", s.getParticipant().getUser().getEmail());
            map.put("college", s.getParticipant().getCollege());
            map.put("roundId", s.getRound().getId());
            map.put("roundTitle", s.getRound().getTitle());
            map.put("currentQuestionId", s.getCurrentQuestion() != null ? s.getCurrentQuestion().getId() : null);
            map.put("status", s.getStatus());
            map.put("startedAt", s.getStartedAt());
            map.put("tabSwitchCount", s.getTabSwitchCount());
            map.put("fullscreenExitCount", s.getFullscreenExitCount());
            map.put("clipboardAttemptCount", s.getClipboardAttemptCount());
            return map;
        }).toList();

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    // Admin & Judge endpoint: View integrity event audit trail
    @GetMapping({"/admin/integrity/events", "/judge/integrity/events"})
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'JUDGE')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getIntegrityEvents(
            @RequestParam(required = false) Long roundId,
            @RequestParam(required = false) Long participantId) {
        List<IntegrityEvent> events;
        if (participantId != null && roundId != null) {
            events = eventRepository.findByParticipantIdAndRoundIdOrderByServerTimestampAsc(participantId, roundId);
        } else if (participantId != null) {
            events = eventRepository.findByParticipantIdOrderByServerTimestampDesc(participantId);
        } else if (roundId != null) {
            events = eventRepository.findByRoundIdOrderByServerTimestampDesc(roundId);
        } else {
            events = eventRepository.findAllByOrderByServerTimestampDesc();
        }

        List<Map<String, Object>> result = events.stream().map(e -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", e.getId());
            map.put("participantId", e.getParticipant().getId());
            map.put("participantName", e.getParticipant().getUser().getFullName());
            map.put("participantEmail", e.getParticipant().getUser().getEmail());
            map.put("roundId", e.getRound().getId());
            map.put("roundTitle", e.getRound().getTitle());
            map.put("questionId", e.getQuestion() != null ? e.getQuestion().getId() : null);
            map.put("questionTitle", e.getQuestion() != null ? e.getQuestion().getTitle() : null);
            map.put("eventType", e.getEventType());
            map.put("eventContext", e.getEventContext());
            map.put("submissionId", e.getSubmissionId());
            map.put("serverTimestamp", e.getServerTimestamp());
            map.put("ipAddress", e.getIpAddress());
            return map;
        }).toList();

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    // Admin endpoint: Restart/Reset participant session after fullscreen termination
    @PostMapping("/admin/integrity/sessions/{sessionId}/reset")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resetSession(
            @PathVariable Long sessionId,
            Authentication authentication) {
        String adminEmail = authentication != null ? authentication.getName() : "admin@gct.ac.in";
        Map<String, Object> result = integrityService.resetSessionByAdmin(sessionId, adminEmail);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    // Admin endpoint: Reset participant for specific round
    @PostMapping("/admin/integrity/participants/{participantId}/rounds/{roundId}/reset")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resetParticipantRound(
            @PathVariable Long participantId,
            @PathVariable Long roundId,
            Authentication authentication) {
        String adminEmail = authentication != null ? authentication.getName() : "admin@gct.ac.in";
        Map<String, Object> result = integrityService.resetParticipantRoundByAdmin(participantId, roundId, adminEmail);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
