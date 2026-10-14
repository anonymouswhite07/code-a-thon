package com.gnanamani.codeathon.service;

import com.gnanamani.codeathon.domain.*;
import com.gnanamani.codeathon.dto.*;
import com.gnanamani.codeathon.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class IntegrityService {

    private static final Logger log = LoggerFactory.getLogger(IntegrityService.class);

    private final CompetitionSessionRepository sessionRepository;
    private final ParticipantQuestionLockRepository lockRepository;
    private final IntegrityEventRepository eventRepository;
    private final RoundRepository roundRepository;
    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;
    private final SubmissionEvaluationService submissionEvaluationService;
    private final CompetitionEngineService competitionEngineService;
    private final ParticipantRepository participantRepository;
    private final QuestionOrderingService questionOrderingService;

    public IntegrityService(
            CompetitionSessionRepository sessionRepository,
            ParticipantQuestionLockRepository lockRepository,
            IntegrityEventRepository eventRepository,
            RoundRepository roundRepository,
            QuestionRepository questionRepository,
            SubmissionRepository submissionRepository,
            SubmissionEvaluationService submissionEvaluationService,
            CompetitionEngineService competitionEngineService,
            ParticipantRepository participantRepository,
            QuestionOrderingService questionOrderingService) {
        this.sessionRepository = sessionRepository;
        this.lockRepository = lockRepository;
        this.eventRepository = eventRepository;
        this.roundRepository = roundRepository;
        this.questionRepository = questionRepository;
        this.submissionRepository = submissionRepository;
        this.submissionEvaluationService = submissionEvaluationService;
        this.competitionEngineService = competitionEngineService;
        this.participantRepository = participantRepository;
        this.questionOrderingService = questionOrderingService;
    }

    @Transactional
    public StartSessionResponse startSession(Participant participant, Long roundId, Boolean agreementAccepted, String ipAddress) {
        if (participant.getIsSuspended()) {
            throw new IllegalStateException("Participant account is suspended.");
        }
        if (agreementAccepted == null || !agreementAccepted) {
            throw new IllegalArgumentException("Mandatory integrity agreement must be explicitly accepted.");
        }

        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new IllegalArgumentException("Round not found: " + roundId));

        if (!competitionEngineService.isSubmissionAllowed(round)) {
            throw new IllegalStateException("Round " + round.getRoundNumber() + " is not currently active.");
        }

        List<Question> questions = questionOrderingService.getOrderedQuestionsForParticipant(participant, round);
        if (questions.isEmpty()) {
            throw new IllegalStateException("No questions available in Round " + round.getRoundNumber());
        }

        List<ParticipantQuestionLock> locks = lockRepository.findByParticipantAndRound(participant, round);
        Set<Long> lockedQuestionIds = locks.stream()
                .filter(ParticipantQuestionLock::getIsLocked)
                .map(l -> l.getQuestion().getId())
                .collect(Collectors.toSet());

        // Find or create session
        Optional<CompetitionSession> existingOpt = sessionRepository
                .findFirstByParticipantAndRoundOrderByStartedAtDesc(participant, round);

        CompetitionSession session;
        if (existingOpt.isPresent() && "ACTIVE".equals(existingOpt.get().getStatus())) {
            session = existingOpt.get();
        } else if (existingOpt.isPresent() && "TERMINATED_FULLSCREEN".equals(existingOpt.get().getStatus())) {
            session = existingOpt.get();
        } else {
            String token = UUID.randomUUID().toString().replace("-", "");
            session = new CompetitionSession(token, participant, round, ipAddress);

            // Determine active question
            Question firstEligible = questions.stream()
                    .filter(q -> !lockedQuestionIds.contains(q.getId()))
                    .findFirst()
                    .orElse(questions.get(0));
            session.setCurrentQuestion(firstEligible);
            session = sessionRepository.save(session);

            // Log agreement acceptance and session start
            IntegrityEvent agreementEvent = new IntegrityEvent(
                    participant, session.getSessionToken(), round, session.getCurrentQuestion(),
                    "INTEGRITY_AGREEMENT_ACCEPTED", "Participant acknowledged zero-tolerance integrity policy.",
                    null, ipAddress
            );
            eventRepository.save(agreementEvent);

            IntegrityEvent startEvent = new IntegrityEvent(
                    participant, session.getSessionToken(), round, session.getCurrentQuestion(),
                    "ROUND_STARTED", "Session created and official timer synchronized.",
                    null, ipAddress
            );
            eventRepository.save(startEvent);
        }

        StartSessionResponse response = new StartSessionResponse();
        response.setSessionToken(session.getSessionToken());
        response.setRoundId(round.getId());
        response.setRoundNumber(round.getRoundNumber());
        response.setRoundTitle(round.getTitle());
        response.setCurrentQuestionId(session.getCurrentQuestion() != null ? session.getCurrentQuestion().getId() : questions.get(0).getId());
        response.setStartedAt(session.getStartedAt());
        response.setRemainingSeconds(competitionEngineService.getAuthoritativeRemainingSeconds(round));
        response.setLockedQuestionIds(new ArrayList<>(lockedQuestionIds));
        response.setIsCompleted("COMPLETED".equals(session.getStatus()) || "TERMINATED_FULLSCREEN".equals(session.getStatus()));
        response.setStatus(session.getStatus());
        return response;
    }

    @Transactional
    public void recordIntegrityEvent(Participant participant, RecordIntegrityEventRequest request, String ipAddress) {
        CompetitionSession session = sessionRepository.findBySessionToken(request.getSessionToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid competition session."));

        if (!session.getParticipant().getId().equals(participant.getId())) {
            throw new IllegalStateException("Session does not belong to authenticated participant.");
        }

        Round round = session.getRound();
        Question question = null;
        if (request.getQuestionId() != null) {
            question = questionRepository.findById(request.getQuestionId()).orElse(null);
        }

        String eventType = request.getEventType().trim().toUpperCase();

        // Update session counters
        if ("TAB_HIDDEN".equals(eventType)) {
            session.setTabSwitchCount(session.getTabSwitchCount() + 1);
        } else if ("FULLSCREEN_EXITED".equals(eventType)) {
            session.setFullscreenExitCount(session.getFullscreenExitCount() + 1);
        } else if ("COPY_ATTEMPT".equals(eventType) || "PASTE_ATTEMPT".equals(eventType) || "CUT_ATTEMPT".equals(eventType)) {
            session.setClipboardAttemptCount(session.getClipboardAttemptCount() + 1);
        }
        sessionRepository.save(session);

        IntegrityEvent event = new IntegrityEvent(
                participant, session.getSessionToken(), round, question,
                eventType, request.getEventContext(), null, ipAddress
        );
        eventRepository.save(event);
    }

    @Transactional
    public TabSwitchAutoSubmitResponse handleTabSwitchAutoSubmit(Participant participant, TabSwitchAutoSubmitRequest request, String ipAddress) {
        CompetitionSession session = sessionRepository.findBySessionToken(request.getSessionToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid competition session."));

        if (!session.getParticipant().getId().equals(participant.getId())) {
            throw new IllegalStateException("Session does not belong to authenticated participant.");
        }

        Round round = roundRepository.findById(request.getRoundId())
                .orElseThrow(() -> new IllegalArgumentException("Round not found: " + request.getRoundId()));

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + request.getQuestionId()));

        List<Question> allQuestions = questionOrderingService.getOrderedQuestionsForParticipant(participant, round);

        // Check if question is already locked for this participant (Idempotency safeguard)
        Optional<ParticipantQuestionLock> existingLock = lockRepository.findByParticipantAndQuestion(participant, question);
        if (existingLock.isPresent() && existingLock.get().getIsLocked()) {
            log.warn("Question {} already locked for participant {}. Returning idempotent response.", question.getId(), participant.getId());

            Optional<Submission> existingSub = submissionRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existingSub.isEmpty()) {
                List<Submission> prior = submissionRepository.findByParticipantIdAndQuestionIdOrderBySubmissionTimeDesc(participant.getId(), question.getId());
                if (!prior.isEmpty()) {
                    existingSub = Optional.of(prior.get(0));
                }
            }
            Long subId = existingSub.map(Submission::getId).orElse(null);
            String status = existingSub.map(Submission::getStatus).orElse("LOCKED");
            int score = existingSub.map(Submission::getScore).orElse(0);

            Long nextQId = findNextUnlockedQuestionId(participant, round, allQuestions, question.getId());
            boolean isCompleted = (nextQId == null);

            TabSwitchAutoSubmitResponse resp = new TabSwitchAutoSubmitResponse();
            resp.setQuestionId(question.getId());
            resp.setIsLocked(true);
            resp.setSubmissionId(subId);
            resp.setStatus(status);
            resp.setScore(score);
            resp.setNextQuestionId(nextQId);
            resp.setIsRoundCompleted(isCompleted);
            resp.setMessage("Question is already locked. Transferred to next question.");
            return resp;
        }

        // 1. Log TAB_HIDDEN
        session.setTabSwitchCount(session.getTabSwitchCount() + 1);
        sessionRepository.save(session);

        IntegrityEvent tabHiddenEvent = new IntegrityEvent(
                participant, session.getSessionToken(), round, question,
                "TAB_HIDDEN", "Participant switched away from competition tab.", null, ipAddress
        );
        eventRepository.save(tabHiddenEvent);

        // 2. Execute automatic submission of latest saved code (or starter code fallback)
        String codeToSubmit = request.getSourceCode();
        if (codeToSubmit == null || codeToSubmit.trim().isEmpty()) {
            codeToSubmit = question.getStarterCode() != null ? question.getStarterCode() : "// Automatic submission on tab switch (No draft saved)";
        }

        Submission submission = submissionEvaluationService.evaluateAutoSubmission(
                participant, round, question, request.getLanguage(), codeToSubmit, request.getIdempotencyKey()
        );

        // 3. Permanently lock question for participant
        ParticipantQuestionLock lock = new ParticipantQuestionLock(participant, round, question, "TAB_SWITCH_AUTO_SUBMIT");
        lockRepository.save(lock);

        // 4. Log AUTO_SUBMISSION_CONFIRMED and QUESTION_LOCKED
        IntegrityEvent autoSubEvent = new IntegrityEvent(
                participant, session.getSessionToken(), round, question,
                "AUTO_SUBMISSION_CONFIRMED", "Automatic submission processed with status " + submission.getStatus(),
                submission.getId(), ipAddress
        );
        eventRepository.save(autoSubEvent);

        IntegrityEvent lockEvent = new IntegrityEvent(
                participant, session.getSessionToken(), round, question,
                "QUESTION_LOCKED", "Question permanently locked due to tab-switching violation.",
                submission.getId(), ipAddress
        );
        eventRepository.save(lockEvent);

        // 5. Determine next eligible question in round
        Long nextQId = findNextUnlockedQuestionId(participant, round, allQuestions, question.getId());
        boolean isRoundCompleted = false;

        if (nextQId != null) {
            Question nextQ = questionRepository.findById(nextQId).orElse(null);
            session.setCurrentQuestion(nextQ);
            sessionRepository.save(session);

            IntegrityEvent advanceEvent = new IntegrityEvent(
                    participant, session.getSessionToken(), round, nextQ,
                    "QUESTION_ADVANCED", "Advanced to Question " + nextQId + " following tab switch lockout.",
                    null, ipAddress
            );
            eventRepository.save(advanceEvent);
        } else {
            // All questions locked / completed
            session.setStatus("COMPLETED");
            session.setCompletedAt(LocalDateTime.now());
            sessionRepository.save(session);
            isRoundCompleted = true;

            IntegrityEvent roundCompletedEvent = new IntegrityEvent(
                    participant, session.getSessionToken(), round, question,
                    "ROUND_COMPLETED", "All questions in round completed/locked.",
                    null, ipAddress
            );
            eventRepository.save(roundCompletedEvent);
        }

        TabSwitchAutoSubmitResponse response = new TabSwitchAutoSubmitResponse();
        response.setQuestionId(question.getId());
        response.setIsLocked(true);
        response.setSubmissionId(submission.getId());
        response.setStatus(submission.getStatus());
        response.setScore(submission.getScore());
        response.setNextQuestionId(nextQId);
        response.setIsRoundCompleted(isRoundCompleted);
        response.setMessage("Tab switch detected. Latest code automatically submitted, question permanently locked, and advanced to next challenge.");
        return response;
    }

    private Long findNextUnlockedQuestionId(Participant participant, Round round, List<Question> allQuestions, Long currentQuestionId) {
        List<ParticipantQuestionLock> locks = lockRepository.findByParticipantAndRound(participant, round);
        Set<Long> lockedIds = locks.stream()
                .filter(ParticipantQuestionLock::getIsLocked)
                .map(l -> l.getQuestion().getId())
                .collect(Collectors.toSet());
        lockedIds.add(currentQuestionId);

        // Find question with higher orderIndex or next in list
        int currentIndex = -1;
        for (int i = 0; i < allQuestions.size(); i++) {
            if (allQuestions.get(i).getId().equals(currentQuestionId)) {
                currentIndex = i;
                break;
            }
        }

        // Check remaining questions after current
        if (currentIndex >= 0) {
            for (int i = currentIndex + 1; i < allQuestions.size(); i++) {
                Long qId = allQuestions.get(i).getId();
                if (!lockedIds.contains(qId)) {
                    return qId;
                }
            }
        }

        // Check any question in round not locked
        for (Question q : allQuestions) {
            if (!lockedIds.contains(q.getId())) {
                return q.getId();
            }
        }

        return null;
    }

    @Transactional
    public FullscreenExitTerminationResponse handleFullscreenExitTermination(
            Participant participant, FullscreenExitTerminationRequest request, String ipAddress) {
        CompetitionSession session = sessionRepository.findBySessionToken(request.getSessionToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid competition session."));

        if (!session.getParticipant().getId().equals(participant.getId())) {
            throw new IllegalStateException("Session does not belong to authenticated participant.");
        }

        Round round = roundRepository.findById(request.getRoundId())
                .orElseThrow(() -> new IllegalArgumentException("Round not found: " + request.getRoundId()));

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + request.getQuestionId()));

        // Increment violation counter and update status to TERMINATED_FULLSCREEN
        session.setFullscreenExitCount(session.getFullscreenExitCount() + 1);
        session.setStatus("TERMINATED_FULLSCREEN");
        session.setCompletedAt(LocalDateTime.now());
        sessionRepository.save(session);

        // 1. Evaluate auto-submission of latest code
        String codeToSubmit = request.getSourceCode();
        if (codeToSubmit == null || codeToSubmit.trim().isEmpty()) {
            codeToSubmit = question.getStarterCode() != null ? question.getStarterCode() : "// Automatic submission on fullscreen exit";
        }

        String idemKey = "FS-EXIT-" + session.getSessionToken() + "-" + question.getId() + "-" + System.currentTimeMillis();
        Submission submission = submissionEvaluationService.evaluateAutoSubmission(
                participant, round, question, request.getLanguage(), codeToSubmit, idemKey
        );

        // 2. Lock current question for participant
        Optional<ParticipantQuestionLock> existingLock = lockRepository.findByParticipantAndQuestion(participant, question);
        if (existingLock.isEmpty()) {
            ParticipantQuestionLock lock = new ParticipantQuestionLock(participant, round, question, "FULLSCREEN_EXIT_TERMINATION");
            lockRepository.save(lock);
        }

        // 3. Log high-severity audit event
        IntegrityEvent termEvent = new IntegrityEvent(
                participant, session.getSessionToken(), round, question,
                "FULLSCREEN_EXIT_TERMINATION",
                "Participant exited fullscreen mode. Latest code automatically submitted, question locked, and round terminated. Flagged for Admin review and restart.",
                submission.getId(), ipAddress
        );
        eventRepository.save(termEvent);

        FullscreenExitTerminationResponse resp = new FullscreenExitTerminationResponse();
        resp.setIsTerminated(true);
        resp.setStatus("TERMINATED_FULLSCREEN");
        resp.setQuestionId(question.getId());
        resp.setSubmissionId(submission.getId());
        resp.setScore(submission.getScore());
        resp.setMessage("Fullscreen mode was exited. Your code was automatically submitted and your round has been terminated. The administrator has been notified and can restart your round.");
        return resp;
    }

    @Transactional
    public Map<String, Object> resetSessionByAdmin(Long sessionId, String adminEmail) {
        CompetitionSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        Participant participant = session.getParticipant();
        Round round = session.getRound();

        // 1. Unlock all questions for this participant in this round
        List<ParticipantQuestionLock> locks = lockRepository.findByParticipantAndRound(participant, round);
        if (!locks.isEmpty()) {
            lockRepository.deleteAll(locks);
        }

        // 2. Reset session status, counters, timestamps
        session.setStatus("ACTIVE");
        session.setCompletedAt(null);
        session.setFullscreenExitCount(0);
        session.setTabSwitchCount(0);
        session.setClipboardAttemptCount(0);
        session.setStartedAt(LocalDateTime.now());

        // Restore first question as active
        List<Question> questions = questionRepository.findByRoundOrderByOrderIndexAsc(round);
        if (!questions.isEmpty()) {
            session.setCurrentQuestion(questions.get(0));
        }
        sessionRepository.save(session);

        // 3. Log administrative audit trail
        IntegrityEvent resetEvent = new IntegrityEvent(
                participant, session.getSessionToken(), round, session.getCurrentQuestion(),
                "ADMIN_ROUND_RESET",
                "Administrator (" + adminEmail + ") restarted the round for this participant. All question locks cleared and session reinstated to ACTIVE.",
                null, "127.0.0.1"
        );
        eventRepository.save(resetEvent);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("sessionId", session.getId());
        result.put("participantId", participant.getId());
        result.put("participantName", participant.getUser().getFullName());
        result.put("roundId", round.getId());
        result.put("status", "ACTIVE");
        result.put("message", "Round successfully restarted for " + participant.getUser().getFullName() + ". Questions unlocked.");
        return result;
    }

    @Transactional
    public Map<String, Object> resetParticipantRoundByAdmin(Long participantId, Long roundId, String adminEmail) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new IllegalArgumentException("Round not found: " + roundId));

        List<CompetitionSession> sessions = sessionRepository.findByRoundIdOrderByStartedAtDesc(roundId)
                .stream()
                .filter(s -> s.getParticipant().getId().equals(participantId))
                .toList();

        if (!sessions.isEmpty()) {
            return resetSessionByAdmin(sessions.get(0).getId(), adminEmail);
        }

        // If no prior session, clear any orphan locks
        List<ParticipantQuestionLock> locks = lockRepository.findByParticipantAndRound(participant, round);
        if (!locks.isEmpty()) {
            lockRepository.deleteAll(locks);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("participantId", participant.getId());
        result.put("roundId", round.getId());
        result.put("message", "Locks cleared. Participant can now start a fresh session.");
        return result;
    }

    @Transactional
    public Map<String, Object> advanceQuestion(Participant participant, AdvanceQuestionRequest request, String ipAddress) {
        Round round = roundRepository.findById(request.getRoundId())
                .orElseThrow(() -> new IllegalArgumentException("Round not found: " + request.getRoundId()));
        Question currentQ = questionRepository.findById(request.getCurrentQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Current question not found: " + request.getCurrentQuestionId()));
        Question nextQ = questionRepository.findById(request.getNextQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Next question not found: " + request.getNextQuestionId()));

        // Update session current question
        List<CompetitionSession> sessions = sessionRepository.findByRoundIdOrderByStartedAtDesc(round.getId())
                .stream()
                .filter(s -> s.getParticipant().getId().equals(participant.getId()))
                .toList();

        CompetitionSession session = sessions.isEmpty() ? null : sessions.get(0);
        if (session != null) {
            session.setCurrentQuestion(nextQ);
            sessionRepository.save(session);

            IntegrityEvent advEvent = new IntegrityEvent(
                    participant, session.getSessionToken(), round, currentQ,
                    "QUESTION_SWITCHED",
                    "Participant navigated from Question #" + currentQ.getId() + " to Question #" + nextQ.getId(),
                    null, ipAddress
            );
            eventRepository.save(advEvent);
        }

        List<ParticipantQuestionLock> locks = lockRepository.findByParticipantAndRound(participant, round);
        List<Long> lockedQuestionIds = locks.stream()
                .filter(ParticipantQuestionLock::getIsLocked)
                .map(l -> l.getQuestion().getId())
                .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("activeQuestionId", nextQ.getId());
        result.put("lockedQuestionIds", lockedQuestionIds);
        result.put("message", "Navigated to Question #" + nextQ.getId());
        return result;
    }
}
