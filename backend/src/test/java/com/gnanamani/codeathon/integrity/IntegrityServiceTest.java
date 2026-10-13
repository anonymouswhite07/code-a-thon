package com.gnanamani.codeathon.integrity;

import com.gnanamani.codeathon.domain.*;
import com.gnanamani.codeathon.dto.*;
import com.gnanamani.codeathon.repository.*;
import com.gnanamani.codeathon.service.CompetitionEngineService;
import com.gnanamani.codeathon.service.IntegrityService;
import com.gnanamani.codeathon.service.QuestionOrderingService;
import com.gnanamani.codeathon.service.SubmissionEvaluationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IntegrityServiceTest {

    @Mock
    private CompetitionSessionRepository sessionRepository;
    @Mock
    private ParticipantQuestionLockRepository lockRepository;
    @Mock
    private IntegrityEventRepository eventRepository;
    @Mock
    private RoundRepository roundRepository;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private SubmissionRepository submissionRepository;
    @Mock
    private SubmissionEvaluationService submissionEvaluationService;
    @Mock
    private CompetitionEngineService competitionEngineService;
    @Mock
    private ParticipantRepository participantRepository;

    private QuestionOrderingService questionOrderingService;
    private IntegrityService integrityService;

    private Participant participant;
    private Round round;
    private Question q1;
    private Question q2;

    @BeforeEach
    void setUp() {
        questionOrderingService = new QuestionOrderingService(questionRepository);
        integrityService = new IntegrityService(
                sessionRepository,
                lockRepository,
                eventRepository,
                roundRepository,
                questionRepository,
                submissionRepository,
                submissionEvaluationService,
                competitionEngineService,
                participantRepository,
                questionOrderingService
        );

        User user = new User("contestant@gct.ac.in", "pass", "Contestant", Role.ROLE_PARTICIPANT);
        user.setId(10L);

        participant = new Participant(user, "9876543210", "GCT", "CSE", "3rd Year", "2 years");
        participant.setId(1L);
        participant.setIsSuspended(false);

        round = new Round(1, "Round 1 - Technical Arena", "C", "C", "Desc", 45);
        round.setId(100L);
        round.setStatus("LIVE");

        q1 = new Question();
        q1.setId(201L);
        q1.setRound(round);
        q1.setTitle("Challenge 1");
        q1.setOrderIndex(1);
        q1.setStarterCode("// Starter 1");

        q2 = new Question();
        q2.setId(202L);
        q2.setRound(round);
        q2.setTitle("Challenge 2");
        q2.setOrderIndex(2);
        q2.setStarterCode("// Starter 2");
    }

    @Test
    @DisplayName("startSession rejects if participant is suspended")
    void testStartSessionRejectsSuspended() {
        participant.setIsSuspended(true);
        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                integrityService.startSession(participant, 100L, true, "127.0.0.1"));
        assertTrue(ex.getMessage().contains("suspended"));
    }

    @Test
    @DisplayName("startSession rejects if agreement is not accepted")
    void testStartSessionRejectsUnacceptedAgreement() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                integrityService.startSession(participant, 100L, false, "127.0.0.1"));
        assertTrue(ex.getMessage().contains("agreement must be explicitly accepted"));
    }

    @Test
    @DisplayName("startSession creates new active session and records audit events")
    void testStartSessionSuccess() {
        when(roundRepository.findById(100L)).thenReturn(Optional.of(round));
        when(competitionEngineService.isSubmissionAllowed(round)).thenReturn(true);
        when(questionRepository.findByRoundOrderByOrderIndexAsc(round)).thenReturn(List.of(q1, q2));
        when(lockRepository.findByParticipantAndRound(participant, round)).thenReturn(Collections.emptyList());
        when(sessionRepository.findFirstByParticipantAndRoundOrderByStartedAtDesc(participant, round))
                .thenReturn(Optional.empty());
        when(competitionEngineService.getAuthoritativeRemainingSeconds(round)).thenReturn(2400L);
        when(sessionRepository.save(any(CompetitionSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StartSessionResponse response = integrityService.startSession(participant, 100L, true, "192.168.1.10");

        assertNotNull(response);
        assertNotNull(response.getSessionToken());
        assertEquals(100L, response.getRoundId());
        List<Question> ordered = questionOrderingService.getOrderedQuestionsForParticipant(participant, round);
        assertEquals(ordered.get(0).getId(), response.getCurrentQuestionId());
        assertEquals(2400L, response.getRemainingSeconds());
        assertFalse(response.getIsCompleted());

        // Verify audit events recorded (agreement + round started)
        verify(eventRepository, times(2)).save(any(IntegrityEvent.class));
    }

    @Test
    @DisplayName("recordIntegrityEvent updates violation counters")
    void testRecordIntegrityEventIncrementsCounters() {
        CompetitionSession session = new CompetitionSession("token123", participant, round, "127.0.0.1");
        session.setTabSwitchCount(0);
        session.setFullscreenExitCount(0);
        session.setClipboardAttemptCount(0);

        when(sessionRepository.findBySessionToken("token123")).thenReturn(Optional.of(session));

        RecordIntegrityEventRequest req = new RecordIntegrityEventRequest();
        req.setSessionToken("token123");
        req.setEventType("TAB_HIDDEN");
        req.setEventContext("document.visibilityState === hidden");

        integrityService.recordIntegrityEvent(participant, req, "127.0.0.1");

        assertEquals(1, session.getTabSwitchCount());
        verify(sessionRepository).save(session);
        verify(eventRepository).save(any(IntegrityEvent.class));
    }

    @Test
    @DisplayName("handleTabSwitchAutoSubmit locks question, submits code, and advances to next challenge")
    void testTabSwitchAutoSubmitAndAdvance() {
        CompetitionSession session = new CompetitionSession("token123", participant, round, "127.0.0.1");
        session.setCurrentQuestion(q1);
        session.setTabSwitchCount(0);

        when(sessionRepository.findBySessionToken("token123")).thenReturn(Optional.of(session));
        when(roundRepository.findById(100L)).thenReturn(Optional.of(round));
        when(questionRepository.findById(201L)).thenReturn(Optional.of(q1));
        when(questionRepository.findById(202L)).thenReturn(Optional.of(q2));
        when(questionRepository.findByRoundOrderByOrderIndexAsc(round)).thenReturn(List.of(q1, q2));
        when(lockRepository.findByParticipantAndQuestion(participant, q1)).thenReturn(Optional.empty());

        Submission autoSub = new Submission();
        autoSub.setId(501L);
        autoSub.setStatus("EVALUATING");
        autoSub.setScore(0);
        autoSub.setIsAutoSubmission(true);
        when(submissionEvaluationService.evaluateAutoSubmission(
                eq(participant), eq(round), eq(q1), eq("c"), eq("int main() {}"), eq("idem-key-1")
        )).thenReturn(autoSub);

        when(lockRepository.findByParticipantAndRound(participant, round)).thenReturn(Collections.emptyList());

        TabSwitchAutoSubmitRequest request = new TabSwitchAutoSubmitRequest();
        request.setSessionToken("token123");
        request.setRoundId(100L);
        request.setQuestionId(201L);
        request.setLanguage("c");
        request.setSourceCode("int main() {}");
        request.setIdempotencyKey("idem-key-1");

        TabSwitchAutoSubmitResponse resp = integrityService.handleTabSwitchAutoSubmit(participant, request, "127.0.0.1");

        assertNotNull(resp);
        assertTrue(resp.getIsLocked());
        assertEquals(501L, resp.getSubmissionId());
        assertEquals(202L, resp.getNextQuestionId());
        assertFalse(resp.getIsRoundCompleted());

        // Verify lock is saved
        ArgumentCaptor<ParticipantQuestionLock> lockCaptor = ArgumentCaptor.forClass(ParticipantQuestionLock.class);
        verify(lockRepository).save(lockCaptor.capture());
        ParticipantQuestionLock savedLock = lockCaptor.getValue();
        assertEquals(q1, savedLock.getQuestion());
        assertTrue(savedLock.getIsLocked());
        assertEquals("TAB_SWITCH_AUTO_SUBMIT", savedLock.getLockReason());

        // Verify session advanced to q2
        assertEquals(q2, session.getCurrentQuestion());
    }

    @Test
    @DisplayName("handleTabSwitchAutoSubmit handles idempotency when already locked")
    void testTabSwitchAutoSubmitIdempotent() {
        CompetitionSession session = new CompetitionSession("token123", participant, round, "127.0.0.1");
        session.setCurrentQuestion(q1);

        ParticipantQuestionLock existingLock = new ParticipantQuestionLock(participant, round, q1, "TAB_SWITCH_AUTO_SUBMIT");
        existingLock.setIsLocked(true);

        when(sessionRepository.findBySessionToken("token123")).thenReturn(Optional.of(session));
        when(roundRepository.findById(100L)).thenReturn(Optional.of(round));
        when(questionRepository.findById(201L)).thenReturn(Optional.of(q1));
        when(questionRepository.findByRoundOrderByOrderIndexAsc(round)).thenReturn(List.of(q1, q2));
        when(lockRepository.findByParticipantAndQuestion(participant, q1)).thenReturn(Optional.of(existingLock));
        when(lockRepository.findByParticipantAndRound(participant, round)).thenReturn(List.of(existingLock));

        TabSwitchAutoSubmitRequest request = new TabSwitchAutoSubmitRequest();
        request.setSessionToken("token123");
        request.setRoundId(100L);
        request.setQuestionId(201L);
        request.setLanguage("c");
        request.setSourceCode("int main() {}");
        request.setIdempotencyKey("idem-repeat");

        TabSwitchAutoSubmitResponse resp = integrityService.handleTabSwitchAutoSubmit(participant, request, "127.0.0.1");

        assertNotNull(resp);
        assertTrue(resp.getIsLocked());
        // Did not evaluate submission again
        verify(submissionEvaluationService, never()).evaluateAutoSubmission(any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("handleFullscreenExitTermination auto-submits, locks question, and marks session TERMINATED_FULLSCREEN")
    void testFullscreenExitTermination() {
        CompetitionSession session = new CompetitionSession("fsToken", participant, round, "127.0.0.1");
        session.setCurrentQuestion(q1);

        when(sessionRepository.findBySessionToken("fsToken")).thenReturn(Optional.of(session));
        when(roundRepository.findById(100L)).thenReturn(Optional.of(round));
        when(questionRepository.findById(201L)).thenReturn(Optional.of(q1));
        when(lockRepository.findByParticipantAndQuestion(participant, q1)).thenReturn(Optional.empty());

        Submission sub = new Submission();
        sub.setId(555L);
        sub.setStatus("PASSED");
        sub.setScore(100);
        when(submissionEvaluationService.evaluateAutoSubmission(any(), any(), any(), any(), any(), any()))
                .thenReturn(sub);

        FullscreenExitTerminationRequest req = new FullscreenExitTerminationRequest();
        req.setSessionToken("fsToken");
        req.setRoundId(100L);
        req.setQuestionId(201L);
        req.setLanguage("c");
        req.setSourceCode("int main() { return 0; }");

        FullscreenExitTerminationResponse resp = integrityService.handleFullscreenExitTermination(participant, req, "127.0.0.1");

        assertNotNull(resp);
        assertTrue(resp.getIsTerminated());
        assertEquals("TERMINATED_FULLSCREEN", resp.getStatus());
        assertEquals(555L, resp.getSubmissionId());
        assertEquals("TERMINATED_FULLSCREEN", session.getStatus());
        assertEquals(1, session.getFullscreenExitCount());

        verify(lockRepository).save(any(ParticipantQuestionLock.class));
        verify(eventRepository).save(any(IntegrityEvent.class));
    }

    @Test
    @DisplayName("resetSessionByAdmin clears locks and reinstates session to ACTIVE")
    void testResetSessionByAdmin() {
        CompetitionSession session = new CompetitionSession("fsToken", participant, round, "127.0.0.1");
        session.setStatus("TERMINATED_FULLSCREEN");
        session.setId(777L);
        session.setFullscreenExitCount(2);

        ParticipantQuestionLock lock = new ParticipantQuestionLock(participant, round, q1, "FULLSCREEN_EXIT_TERMINATION");

        when(sessionRepository.findById(777L)).thenReturn(Optional.of(session));
        when(lockRepository.findByParticipantAndRound(participant, round)).thenReturn(List.of(lock));
        when(questionRepository.findByRoundOrderByOrderIndexAsc(round)).thenReturn(List.of(q1, q2));

        Map<String, Object> result = integrityService.resetSessionByAdmin(777L, "admin@gct.ac.in");

        assertNotNull(result);
        assertEquals(true, result.get("success"));
        assertEquals("ACTIVE", result.get("status"));
        assertEquals("ACTIVE", session.getStatus());
        assertEquals(0, session.getFullscreenExitCount());
        assertNull(session.getCompletedAt());

        verify(lockRepository).deleteAll(List.of(lock));
        verify(sessionRepository).save(session);
        verify(eventRepository).save(any(IntegrityEvent.class));
    }
}
