package com.gnanamani.codeathon.competition;

import com.gnanamani.codeathon.domain.Round;
import com.gnanamani.codeathon.repository.RoundRepository;
import com.gnanamani.codeathon.service.AuditService;
import com.gnanamani.codeathon.service.CompetitionEngineService;
import com.gnanamani.codeathon.service.RealtimeEventService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompetitionEngineServiceTest {

    @Mock
    private RoundRepository roundRepository;

    @Mock
    private RealtimeEventService realtimeEventService;

    @Mock
    private AuditService auditService;

    private CompetitionEngineService competitionEngineService;

    @BeforeEach
    void setUp() {
        competitionEngineService = new CompetitionEngineService(roundRepository, realtimeEventService, auditService);
        lenient().when(roundRepository.save(any(Round.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    @DisplayName("Start round properly initializes LIVE status and end time")
    void testStartRound() {
        Round round = new Round(1, "Round 1", "Basics", "C", "Desc", 45);
        round.setId(1L);
        when(roundRepository.findById(1L)).thenReturn(Optional.of(round));

        Round started = competitionEngineService.startRound(1L, 45, "admin@gct.ac.in");

        assertEquals("LIVE", started.getStatus());
        assertFalse(started.getIsLocked());
        assertNotNull(started.getStartTime());
        assertNotNull(started.getEndTime());
        assertTrue(competitionEngineService.isSubmissionAllowed(started));
        assertTrue(competitionEngineService.getAuthoritativeRemainingSeconds(started) > 2600);
    }

    @Test
    @DisplayName("Critical Timer Test: Pausing preserves remaining time and resuming restores exact remaining duration")
    void testPauseAndResumeTimerPreservation() {
        Round round = new Round(1, "Round 1", "Basics", "C", "Desc", 45);
        round.setId(1L);
        round.setStatus("LIVE");
        round.setIsLocked(false);
        // Started 30 minutes ago, 15 minutes remaining
        LocalDateTime now = LocalDateTime.now();
        round.setStartTime(now.minusMinutes(30));
        round.setEndTime(now.plusMinutes(15));
        when(roundRepository.findById(1L)).thenReturn(Optional.of(round));

        // 1. Pause round
        Round paused = competitionEngineService.pauseRound(1L, "admin@gct.ac.in");
        assertEquals("PAUSED", paused.getStatus());
        assertNotNull(paused.getRemainingSecondsWhenPaused());
        long remainingWhenPaused = paused.getRemainingSecondsWhenPaused();

        // Must be approximately 15 minutes (between 890 and 910 seconds)
        assertTrue(remainingWhenPaused >= 890 && remainingWhenPaused <= 910,
                "Expected ~900s remaining, but got " + remainingWhenPaused);

        // While paused, submissions MUST NOT be allowed
        assertFalse(competitionEngineService.isSubmissionAllowed(paused));

        // Authoritative timer while paused must return remaining seconds at pause
        assertEquals(remainingWhenPaused, competitionEngineService.getAuthoritativeRemainingSeconds(paused));

        // 2. Resume round
        Round resumed = competitionEngineService.resumeRound(1L, "admin@gct.ac.in");
        assertEquals("LIVE", resumed.getStatus());
        assertNull(resumed.getRemainingSecondsWhenPaused());
        assertTrue(competitionEngineService.isSubmissionAllowed(resumed));

        long remainingAfterResume = competitionEngineService.getAuthoritativeRemainingSeconds(resumed);
        // It must NOT reset to 45 minutes (2700s)
        assertTrue(remainingAfterResume < 1000, "Timer should not reset to 45 mins! Got: " + remainingAfterResume);
        assertTrue(remainingAfterResume >= 890, "Timer should preserve ~15 mins remaining. Got: " + remainingAfterResume);
    }

    @Test
    @DisplayName("Submissions rejected when round is not LIVE or time expired")
    void testSubmissionAllowedRejection() {
        Round scheduled = new Round(2, "Round 2", "Logic", "JAVA", "Desc", 45);
        scheduled.setStatus("SCHEDULED");
        assertFalse(competitionEngineService.isSubmissionAllowed(scheduled));

        Round ended = new Round(3, "Round 3", "Master", "PYTHON", "Desc", 60);
        ended.setStatus("ENDED");
        ended.setEndTime(LocalDateTime.now().minusMinutes(5));
        assertFalse(competitionEngineService.isSubmissionAllowed(ended));

        assertFalse(competitionEngineService.isSubmissionAllowed(null));
    }
}
