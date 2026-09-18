package com.gnanamani.codeathon.service;

import com.gnanamani.codeathon.domain.*;
import com.gnanamani.codeathon.dto.LeaderboardEntryResponse;
import com.gnanamani.codeathon.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class LeaderboardService {

    private final ParticipantRepository participantRepository;
    private final SubmissionRepository submissionRepository;
    private final CompetitionConfigRepository configRepository;
    private final RealtimeEventService realtimeEventService;
    private final AuditService auditService;

    public LeaderboardService(
            ParticipantRepository participantRepository,
            SubmissionRepository submissionRepository,
            CompetitionConfigRepository configRepository,
            RealtimeEventService realtimeEventService,
            AuditService auditService) {
        this.participantRepository = participantRepository;
        this.submissionRepository = submissionRepository;
        this.configRepository = configRepository;
        this.realtimeEventService = realtimeEventService;
        this.auditService = auditService;
    }

    public boolean isLeaderboardFrozen() {
        return configRepository.findById("leaderboard.frozen")
                .map(c -> Boolean.parseBoolean(c.getConfigValue()))
                .orElse(false);
    }

    public boolean isFinalResultsPublished() {
        return configRepository.findById("results.published")
                .map(c -> Boolean.parseBoolean(c.getConfigValue()))
                .orElse(false);
    }

    public List<LeaderboardEntryResponse> getLeaderboard() {
        List<Participant> participants = participantRepository.findByIsSuspendedFalseOrderByTotalScoreDesc();
        List<LeaderboardEntryResponse> entries = new ArrayList<>();

        int rank = 1;
        for (Participant p : participants) {
            LeaderboardEntryResponse entry = new LeaderboardEntryResponse();
            entry.setRank(rank++);
            entry.setParticipantId(p.getId());
            entry.setFullName(p.getUser().getFullName());
            entry.setCollege(p.getCollege());
            entry.setDepartment(p.getDepartment());
            entry.setTotalScore(p.getTotalScore());

            // Compute per-round breakdown and total execution time
            List<Submission> subs = submissionRepository.findByParticipantOrderBySubmissionTimeDesc(p);
            int r1 = 0, r2 = 0, r3 = 0, solved = 0;
            long totalTime = 0;
            Set<Long> solvedQuestions = new HashSet<>();

            for (Submission s : subs) {
                totalTime += s.getExecutionTimeMs();
                if ("PASSED".equals(s.getStatus()) && !solvedQuestions.contains(s.getQuestion().getId())) {
                    solved++;
                    solvedQuestions.add(s.getQuestion().getId());
                }

                int roundNum = s.getRound().getRoundNumber();
                if (roundNum == 1) r1 = Math.max(r1, s.getScore());
                else if (roundNum == 2) r2 = Math.max(r2, s.getScore());
                else if (roundNum == 3) r3 = Math.max(r3, s.getScore());
            }

            entry.setRound1Score(r1);
            entry.setRound2Score(r2);
            entry.setRound3Score(r3);
            entry.setSolvedCount(solved);
            entry.setTotalExecutionTimeMs(totalTime);

            entries.add(entry);
        }

        return entries;
    }

    @Transactional
    public void setFreezeStatus(boolean freeze, String adminEmail) {
        CompetitionConfig config = configRepository.findById("leaderboard.frozen")
                .orElse(new CompetitionConfig("leaderboard.frozen", "false"));
        config.setConfigValue(String.valueOf(freeze));
        configRepository.save(config);

        auditService.log(adminEmail, freeze ? "LEADERBOARD_FROZEN" : "LEADERBOARD_UNFROZEN",
                "Leaderboard", freeze ? "Leaderboard frozen by admin" : "Leaderboard unfrozen by admin", "127.0.0.1");

        realtimeEventService.broadcast("LEADERBOARD_STATUS_CHANGED", Map.of("frozen", freeze));
    }

    @Transactional
    public void setFinalResultsPublished(boolean published, String adminEmail) {
        CompetitionConfig config = configRepository.findById("results.published")
                .orElse(new CompetitionConfig("results.published", "false"));
        config.setConfigValue(String.valueOf(published));
        configRepository.save(config);

        auditService.log(adminEmail, published ? "FINAL_RESULTS_PUBLISHED" : "FINAL_RESULTS_UNPUBLISHED",
                "Competition", published ? "Final winners announced" : "Final results hidden", "127.0.0.1");

        realtimeEventService.broadcast("COMPETITION_STATUS_CHANGED", Map.of("resultsPublished", published));
    }
}
