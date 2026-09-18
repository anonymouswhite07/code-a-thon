package com.gnanamani.codeathon.repository;

import com.gnanamani.codeathon.domain.Round;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoundRepository extends JpaRepository<Round, Long> {
    Optional<Round> findByRoundNumber(Integer roundNumber);
    List<Round> findAllByOrderByRoundNumberAsc();
    Optional<Round> findByStatus(String status);
}
