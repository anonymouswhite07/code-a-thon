package com.gnanamani.codeathon.repository;

import com.gnanamani.codeathon.domain.CompetitionConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompetitionConfigRepository extends JpaRepository<CompetitionConfig, String> {
}
