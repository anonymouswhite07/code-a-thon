package com.gnanamani.codeathon.repository;

import com.gnanamani.codeathon.domain.SubmissionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubmissionResultRepository extends JpaRepository<SubmissionResult, Long> {
    List<SubmissionResult> findBySubmissionId(Long submissionId);
}
