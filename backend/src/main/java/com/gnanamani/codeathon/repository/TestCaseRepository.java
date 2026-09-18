package com.gnanamani.codeathon.repository;

import com.gnanamani.codeathon.domain.Question;
import com.gnanamani.codeathon.domain.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByQuestionOrderByOrderIndexAsc(Question question);
    List<TestCase> findByQuestionIdOrderByOrderIndexAsc(Long questionId);
    List<TestCase> findByQuestionIdAndIsHiddenFalseOrderByOrderIndexAsc(Long questionId);
}
