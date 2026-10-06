package com.gnanamani.codeathon.leaderboard;

import com.gnanamani.codeathon.domain.CompetitionConfig;
import com.gnanamani.codeathon.domain.Participant;
import com.gnanamani.codeathon.domain.Role;
import com.gnanamani.codeathon.domain.User;
import com.gnanamani.codeathon.dto.LeaderboardEntryResponse;
import com.gnanamani.codeathon.repository.CompetitionConfigRepository;
import com.gnanamani.codeathon.repository.ParticipantRepository;
import com.gnanamani.codeathon.repository.SubmissionRepository;
import com.gnanamani.codeathon.service.AuditService;
import com.gnanamani.codeathon.service.LeaderboardService;
import com.gnanamani.codeathon.service.RealtimeEventService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaderboardFreezeSnapshotTest {

    @Mock
    private ParticipantRepository participantRepository;
    @Mock
    private SubmissionRepository submissionRepository;
    @Mock
    private CompetitionConfigRepository configRepository;
    @Mock
    private RealtimeEventService realtimeEventService;
    @Mock
    private AuditService auditService;

    private LeaderboardService leaderboardService;

    private Participant p1;
    private Participant p2;

    @BeforeEach
    void setUp() {
        leaderboardService = new LeaderboardService(
                participantRepository,
                submissionRepository,
                configRepository,
                realtimeEventService,
                auditService
        );

        User u1 = new User("alice@gct.ac.in", "pass", "Alice", Role.ROLE_PARTICIPANT);
        u1.setId(1L);
        p1 = new Participant(u1, "1234567890", "GCT", "CSE", "3rd Year", "2y");
        p1.setId(101L);
        p1.setTotalScore(100);

        User u2 = new User("bob@gct.ac.in", "pass", "Bob", Role.ROLE_PARTICIPANT);
        u2.setId(2L);
        p2 = new Participant(u2, "9876543210", "GCT", "ECE", "3rd Year", "1y");
        p2.setId(102L);
        p2.setTotalScore(80);

        when(configRepository.findById("results.published")).thenReturn(Optional.of(new CompetitionConfig("results.published", "false")));
        when(submissionRepository.findByParticipantOrderBySubmissionTimeDesc(any(Participant.class)))
                .thenReturn(Collections.emptyList());
    }

    @Test
    @DisplayName("Leaderboard freeze preserves snapshot even after new scores occur")
    void testLeaderboardFreezePreservesSnapshot() {
        // Step 1: Unfrozen state
        when(configRepository.findById("leaderboard.frozen")).thenReturn(Optional.of(new CompetitionConfig("leaderboard.frozen", "false")));
        when(participantRepository.findByIsSuspendedFalseOrderByTotalScoreDesc()).thenReturn(List.of(p1, p2));

        List<LeaderboardEntryResponse> initialBoard = leaderboardService.getLeaderboard();
        assertEquals(2, initialBoard.size());
        assertEquals("Alice", initialBoard.get(0).getFullName());
        assertEquals(100, initialBoard.get(0).getTotalScore());
        assertEquals("Bob", initialBoard.get(1).getFullName());
        assertEquals(80, initialBoard.get(1).getTotalScore());

        // Step 2: Admin freezes leaderboard
        when(configRepository.findById("leaderboard.frozen")).thenReturn(Optional.of(new CompetitionConfig("leaderboard.frozen", "true")));
        leaderboardService.setFreezeStatus(true, "admin@gct.ac.in");

        // Step 3: Bob submits and overtakes Alice (Score: 150 vs 100)
        p2.setTotalScore(150);
        when(participantRepository.findByIsSuspendedFalseOrderByTotalScoreDesc()).thenReturn(List.of(p2, p1));

        // Step 4: Participant requests leaderboard while frozen
        List<LeaderboardEntryResponse> frozenBoard = leaderboardService.getLeaderboard();

        // Must still show Alice #1 (100) and Bob #2 (80) from snapshot!
        assertEquals("Alice", frozenBoard.get(0).getFullName(), "Frozen leaderboard must show Alice in 1st place!");
        assertEquals(100, frozenBoard.get(0).getTotalScore());
        assertEquals("Bob", frozenBoard.get(1).getFullName());
        assertEquals(80, frozenBoard.get(1).getTotalScore(), "Frozen leaderboard must show old score!");

        // Step 5: Admin unfreezes leaderboard
        when(configRepository.findById("leaderboard.frozen")).thenReturn(Optional.of(new CompetitionConfig("leaderboard.frozen", "false")));
        leaderboardService.setFreezeStatus(false, "admin@gct.ac.in");

        List<LeaderboardEntryResponse> unfrozenBoard = leaderboardService.getLeaderboard();
        assertEquals("Bob", unfrozenBoard.get(0).getFullName(), "Unfrozen leaderboard must now show Bob in 1st place!");
        assertEquals(150, unfrozenBoard.get(0).getTotalScore());
    }
}
