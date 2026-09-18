package com.gnanamani.codeathon.service;

import com.gnanamani.codeathon.domain.Round;
import com.gnanamani.codeathon.repository.RoundRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class CompetitionEngineService {

    private final RoundRepository roundRepository;
    private final RealtimeEventService realtimeEventService;
    private final AuditService auditService;

    public CompetitionEngineService(
            RoundRepository roundRepository,
            RealtimeEventService realtimeEventService,
            AuditService auditService) {
        this.roundRepository = roundRepository;
        this.realtimeEventService = realtimeEventService;
        this.auditService = auditService;
    }

    public long getAuthoritativeRemainingSeconds(Round round) {
        if (!"LIVE".equals(round.getStatus())) {
            return 0L;
        }
        if (round.getEndTime() == null) {
            return (long) round.getDurationMinutes() * 60;
        }
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(round.getEndTime())) {
            return 0L;
        }
        return Duration.between(now, round.getEndTime()).getSeconds();
    }

    public boolean isSubmissionAllowed(Round round) {
        if (round == null || !"LIVE".equals(round.getStatus())) {
            return false;
        }
        return getAuthoritativeRemainingSeconds(round) > 0;
    }

    @Transactional
    public Round startRound(Long roundId, Integer durationMinutes, String adminEmail) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new IllegalArgumentException("Round not found: " + roundId));

        int duration = (durationMinutes != null && durationMinutes > 0) ? durationMinutes : round.getDurationMinutes();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime end = now.plusMinutes(duration);

        round.setStatus("LIVE");
        round.setStartTime(now);
        round.setEndTime(end);
        round.setDurationMinutes(duration);
        round.setIsLocked(false);
        Round saved = roundRepository.save(round);

        auditService.log(adminEmail, "ROUND_STARTED", "Round " + round.getRoundNumber(),
                "Started " + round.getTitle() + " with duration " + duration + " mins", "127.0.0.1");

        realtimeEventService.broadcast("ROUND_STARTED", Map.of(
                "roundId", saved.getId(),
                "roundNumber", saved.getRoundNumber(),
                "title", saved.getTitle(),
                "durationMinutes", duration,
                "remainingSeconds", duration * 60L
        ));

        return saved;
    }

    @Transactional
    public Round pauseRound(Long roundId, String adminEmail) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new IllegalArgumentException("Round not found: " + roundId));

        round.setStatus("PAUSED");
        Round saved = roundRepository.save(round);

        auditService.log(adminEmail, "ROUND_PAUSED", "Round " + round.getRoundNumber(),
                "Paused " + round.getTitle(), "127.0.0.1");

        realtimeEventService.broadcast("ROUND_PAUSED", Map.of(
                "roundId", saved.getId(),
                "roundNumber", saved.getRoundNumber(),
                "title", saved.getTitle()
        ));

        return saved;
    }

    @Transactional
    public Round resumeRound(Long roundId, String adminEmail) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new IllegalArgumentException("Round not found: " + roundId));

        LocalDateTime now = LocalDateTime.now();
        round.setStatus("LIVE");
        if (round.getEndTime() == null || now.isAfter(round.getEndTime())) {
            round.setEndTime(now.plusMinutes(round.getDurationMinutes()));
        }
        Round saved = roundRepository.save(round);

        auditService.log(adminEmail, "ROUND_RESUMED", "Round " + round.getRoundNumber(),
                "Resumed " + round.getTitle(), "127.0.0.1");

        realtimeEventService.broadcast("ROUND_RESUMED", Map.of(
                "roundId", saved.getId(),
                "roundNumber", saved.getRoundNumber(),
                "title", saved.getTitle(),
                "remainingSeconds", getAuthoritativeRemainingSeconds(saved)
        ));

        return saved;
    }

    @Transactional
    public Round endRound(Long roundId, String adminEmail) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new IllegalArgumentException("Round not found: " + roundId));

        round.setStatus("ENDED");
        round.setEndTime(LocalDateTime.now());
        Round saved = roundRepository.save(round);

        auditService.log(adminEmail, "ROUND_ENDED", "Round " + round.getRoundNumber(),
                "Ended " + round.getTitle(), "127.0.0.1");

        realtimeEventService.broadcast("ROUND_ENDED", Map.of(
                "roundId", saved.getId(),
                "roundNumber", saved.getRoundNumber(),
                "title", saved.getTitle()
        ));

        return saved;
    }

    @Transactional
    public Round setRoundLock(Long roundId, boolean locked, String adminEmail) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new IllegalArgumentException("Round not found: " + roundId));

        round.setIsLocked(locked);
        Round saved = roundRepository.save(round);

        auditService.log(adminEmail, locked ? "ROUND_LOCKED" : "ROUND_UNLOCKED",
                "Round " + round.getRoundNumber(), (locked ? "Locked " : "Unlocked ") + round.getTitle(), "127.0.0.1");

        return saved;
    }

    @Scheduled(fixedRate = 5000)
    @Transactional
    public void autoCheckRoundExpirations() {
        List<Round> liveRounds = roundRepository.findAllByOrderByRoundNumberAsc();
        LocalDateTime now = LocalDateTime.now();

        for (Round r : liveRounds) {
            if ("LIVE".equals(r.getStatus()) && r.getEndTime() != null && now.isAfter(r.getEndTime())) {
                r.setStatus("ENDED");
                roundRepository.save(r);
                auditService.log("SYSTEM", "ROUND_ENDED_AUTO", "Round " + r.getRoundNumber(),
                        "Time expired for " + r.getTitle(), "127.0.0.1");
                realtimeEventService.broadcast("ROUND_ENDED", Map.of(
                        "roundId", r.getId(),
                        "roundNumber", r.getRoundNumber(),
                        "title", r.getTitle(),
                        "reason", "TIME_EXPIRED"
                ));
            }
        }
    }
}
