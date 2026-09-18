package com.gnanamani.codeathon.repository;

import com.gnanamani.codeathon.domain.Participant;
import com.gnanamani.codeathon.domain.Question;
import com.gnanamani.codeathon.domain.Round;
import com.gnanamani.codeathon.domain.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByParticipantOrderBySubmissionTimeDesc(Participant participant);
    List<Submission> findByParticipantIdOrderBySubmissionTimeDesc(Long participantId);
    List<Submission> findByParticipantIdAndQuestionIdOrderBySubmissionTimeDesc(Long participantId, Long questionId);
    List<Submission> findByRoundIdOrderBySubmissionTimeDesc(Long roundId);
    List<Submission> findAllByOrderBySubmissionTimeDesc();

    @Query("SELECT MAX(s.score) FROM Submission s WHERE s.participant.id = :participantId AND s.question.id = :questionId")
    Optional<Integer> findMaxScoreByParticipantAndQuestion(Long participantId, Long questionId);

    long countByStatus(String status);
}
