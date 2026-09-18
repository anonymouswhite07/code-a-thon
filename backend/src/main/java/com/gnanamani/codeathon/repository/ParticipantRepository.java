package com.gnanamani.codeathon.repository;

import com.gnanamani.codeathon.domain.Participant;
import com.gnanamani.codeathon.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Long> {
    Optional<Participant> findByUser(User user);
    Optional<Participant> findByUserEmail(String email);

    @Query("SELECT p FROM Participant p WHERE p.isSuspended = false ORDER BY p.totalScore DESC")
    List<Participant> findTopByTotalScore();

    List<Participant> findByIsSuspendedFalseOrderByTotalScoreDesc();
}
