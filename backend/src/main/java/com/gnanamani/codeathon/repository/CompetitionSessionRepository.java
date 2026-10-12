package com.gnanamani.codeathon.repository;

import com.gnanamani.codeathon.domain.CompetitionSession;
import com.gnanamani.codeathon.domain.Participant;
import com.gnanamani.codeathon.domain.Round;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompetitionSessionRepository extends JpaRepository<CompetitionSession, Long> {
    Optional<CompetitionSession> findBySessionToken(String sessionToken);
    Optional<CompetitionSession> findFirstByParticipantAndRoundOrderByStartedAtDesc(Participant participant, Round round);
    List<CompetitionSession> findByRoundIdOrderByStartedAtDesc(Long roundId);
    List<CompetitionSession> findByParticipantIdOrderByStartedAtDesc(Long participantId);
    List<CompetitionSession> findByStatusOrderByStartedAtDesc(String status);
    List<CompetitionSession> findAllByOrderByStartedAtDesc();
}
