package com.gnanamani.codeathon.submission;

import com.gnanamani.codeathon.domain.*;
import com.gnanamani.codeathon.dto.SubmitCodeRequest;
import com.gnanamani.codeathon.repository.*;
import com.gnanamani.codeathon.service.CompetitionEngineService;
import com.gnanamani.codeathon.service.QuestionOrderingService;
import com.gnanamani.codeathon.service.RealtimeEventService;
import com.gnanamani.codeathon.service.SubmissionEvaluationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubmissionThrottleTest {

    @Mock
    private SubmissionRepository submissionRepository;
    @Mock
    private SubmissionResultRepository submissionResultRepository;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private TestCaseRepository testCaseRepository;
    @Mock
    private ParticipantRepository participantRepository;
    @Mock
    private CompetitionEngineService competitionEngineService;
    @Mock
    private RealtimeEventService realtimeEventService;
    @Mock
    private ParticipantQuestionLockRepository lockRepository;

    private QuestionOrderingService questionOrderingService;
    private SubmissionEvaluationService evaluationService;

    private Participant participant;
    private Question question;
    private Round round;

    @BeforeEach
    void setUp() {
        questionOrderingService = new QuestionOrderingService(questionRepository);
        evaluationService = new SubmissionEvaluationService(
                submissionRepository,
                submissionResultRepository,
                questionRepository,
                testCaseRepository,
                participantRepository,
                competitionEngineService,
                realtimeEventService,
                lockRepository,
                questionOrderingService
        );

        User user = new User("student@gct.ac.in", "pass", "Student", Role.ROLE_PARTICIPANT);
        user.setId(10L);

        participant = new Participant(user, "9876543210", "GCT", "CSE", "3rd Year", "2 years");
        participant.setId(1L);
        participant.setIsSuspended(false);

        round = new Round(1, "Round 1", "C", "C", "Desc", 45);
        round.setId(100L);
        round.setStatus("LIVE");

        question = new Question();
        question.setId(200L);
        question.setRound(round);
        question.setTitle("Palindrome");
        question.setPoints(100);
        question.setTimeLimitMs(2000);
        question.setMemoryLimitMb(128);
    }

    @Test
    @DisplayName("Suspended participant is immediately rejected")
    void testSuspendedParticipantRejected() {
        participant.setIsSuspended(true);
        SubmitCodeRequest request = new SubmitCodeRequest();
        request.setQuestionId(200L);
        request.setLanguage("c");
        request.setSourceCode("int main() { return 0; }");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                evaluationService.evaluateSubmission(participant, request));
        assertTrue(ex.getMessage().contains("suspended"));
    }

    @Test
    @DisplayName("Submission cooldown rejects submissions made within 5 seconds")
    void testCooldownRejection() {
        when(questionRepository.findById(200L)).thenReturn(Optional.of(question));
        when(competitionEngineService.isSubmissionAllowed(round)).thenReturn(true);

        Submission recentSub = new Submission();
        recentSub.setQuestion(question);
        recentSub.setParticipant(participant);
        recentSub.setSubmissionTime(LocalDateTime.now().minusSeconds(2)); // 2 seconds ago
        recentSub.setSourceCode("int main() { printf(\"hello\"); }");
        when(submissionRepository.findFirstByParticipantOrderBySubmissionTimeDesc(participant))
                .thenReturn(Optional.of(recentSub));

        SubmitCodeRequest request = new SubmitCodeRequest();
        request.setQuestionId(200L);
        request.setLanguage("c");
        request.setSourceCode("int main() { printf(\"world\"); }");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                evaluationService.evaluateSubmission(participant, request));
        assertTrue(ex.getMessage().contains("cooldown"), "Expected cooldown exception message, got: " + ex.getMessage());
    }

    @Test
    @DisplayName("Duplicate submission check rejects identical code within 30 seconds")
    void testDuplicateCodeRejection() {
        when(questionRepository.findById(200L)).thenReturn(Optional.of(question));
        when(competitionEngineService.isSubmissionAllowed(round)).thenReturn(true);

        String code = "int main() { return 0; }";
        Submission recentSub = new Submission();
        recentSub.setQuestion(question);
        recentSub.setParticipant(participant);
        recentSub.setSubmissionTime(LocalDateTime.now().minusSeconds(15)); // 15s ago (> 5s, < 30s)
        recentSub.setSourceCode(code);
        when(submissionRepository.findFirstByParticipantOrderBySubmissionTimeDesc(participant))
                .thenReturn(Optional.of(recentSub));

        SubmitCodeRequest request = new SubmitCodeRequest();
        request.setQuestionId(200L);
        request.setLanguage("c");
        request.setSourceCode(code);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                evaluationService.evaluateSubmission(participant, request));
        assertTrue(ex.getMessage().contains("Duplicate submission"), "Expected duplicate code exception, got: " + ex.getMessage());
    }

    @Test
    @DisplayName("Submission rejected if round does not allow submissions")
    void testRoundNotAllowingSubmissions() {
        when(questionRepository.findById(200L)).thenReturn(Optional.of(question));
        when(competitionEngineService.isSubmissionAllowed(round)).thenReturn(false);

        SubmitCodeRequest request = new SubmitCodeRequest();
        request.setQuestionId(200L);
        request.setLanguage("c");
        request.setSourceCode("int main() { return 0; }");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                evaluationService.evaluateSubmission(participant, request));
        assertTrue(ex.getMessage().contains("not currently allowed"));
    }

    @Test
    @DisplayName("Question locked check rejects submission")
    void testLockedQuestionRejection() {
        when(questionRepository.findById(200L)).thenReturn(Optional.of(question));
        when(competitionEngineService.isSubmissionAllowed(round)).thenReturn(true);
        when(lockRepository.existsByParticipantIdAndQuestionIdAndIsLockedTrue(participant.getId(), question.getId()))
                .thenReturn(true);

        SubmitCodeRequest request = new SubmitCodeRequest();
        request.setQuestionId(200L);
        request.setLanguage("c");
        request.setSourceCode("int main() { return 0; }");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                evaluationService.evaluateSubmission(participant, request));
        assertTrue(ex.getMessage().contains("permanently locked"), "Expected locked error, got: " + ex.getMessage());
    }

    @Test
    @DisplayName("Maximum 4 submissions limit: Fifth submission on same challenge is rejected")
    void testFourSubmissionsLimitPerQuestion() {
        when(questionRepository.findById(200L)).thenReturn(Optional.of(question));
        when(competitionEngineService.isSubmissionAllowed(round)).thenReturn(true);
        when(lockRepository.existsByParticipantIdAndQuestionIdAndIsLockedTrue(participant.getId(), question.getId()))
                .thenReturn(false);

        Submission sub1 = new Submission(); sub1.setId(1L);
        Submission sub2 = new Submission(); sub2.setId(2L);
        Submission sub3 = new Submission(); sub3.setId(3L);
        Submission sub4 = new Submission(); sub4.setId(4L);
        when(submissionRepository.findByParticipantIdAndQuestionIdOrderBySubmissionTimeDesc(participant.getId(), 200L))
                .thenReturn(List.of(sub4, sub3, sub2, sub1));

        SubmitCodeRequest request = new SubmitCodeRequest();
        request.setQuestionId(200L);
        request.setLanguage("c");
        request.setSourceCode("int main() { return 0; }");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                evaluationService.evaluateSubmission(participant, request));
        assertTrue(ex.getMessage().contains("Submission limit reached"), "Expected submission limit error, got: " + ex.getMessage());
    }
}
