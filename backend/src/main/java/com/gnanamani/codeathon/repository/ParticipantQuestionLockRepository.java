package com.gnanamani.codeathon.repository;

import com.gnanamani.codeathon.domain.Participant;
import com.gnanamani.codeathon.domain.ParticipantQuestionLock;
import com.gnanamani.codeathon.domain.Question;
import com.gnanamani.codeathon.domain.Round;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantQuestionLockRepository extends JpaRepository<ParticipantQuestionLock, Long> {
    Optional<ParticipantQuestionLock> findByParticipantAndQuestion(Participant participant, Question question);
    Optional<ParticipantQuestionLock> findByParticipantIdAndQuestionId(Long participantId, Long questionId);
    List<ParticipantQuestionLock> findByParticipantAndRound(Participant participant, Round round);
    List<ParticipantQuestionLock> findByParticipantIdAndRoundId(Long participantId, Long roundId);
    boolean existsByParticipantIdAndQuestionIdAndIsLockedTrue(Long participantId, Long questionId);
}
