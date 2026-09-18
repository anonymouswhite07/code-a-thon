package com.gnanamani.codeathon.repository;

import com.gnanamani.codeathon.domain.Question;
import com.gnanamani.codeathon.domain.Round;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByRoundOrderByOrderIndexAsc(Round round);
    List<Question> findByRoundIdAndIsEnabledTrueOrderByOrderIndexAsc(Long roundId);
    Optional<Question> findBySlug(String slug);
}
