package com.gnanamani.codeathon.repository;

import com.gnanamani.codeathon.domain.IntegrityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IntegrityEventRepository extends JpaRepository<IntegrityEvent, Long> {
    List<IntegrityEvent> findBySessionTokenOrderByServerTimestampDesc(String sessionToken);
    List<IntegrityEvent> findByParticipantIdOrderByServerTimestampDesc(Long participantId);
    List<IntegrityEvent> findByRoundIdOrderByServerTimestampDesc(Long roundId);
    List<IntegrityEvent> findByParticipantIdAndRoundIdOrderByServerTimestampAsc(Long participantId, Long roundId);
    List<IntegrityEvent> findAllByOrderByServerTimestampDesc();
    long countByEventType(String eventType);
}
