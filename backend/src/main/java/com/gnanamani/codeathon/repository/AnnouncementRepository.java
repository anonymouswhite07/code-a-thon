package com.gnanamani.codeathon.repository;

import com.gnanamani.codeathon.domain.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findAllByOrderByCreatedAtDesc();
    List<Announcement> findByTargetRoundIdIsNullOrderByCreatedAtDesc();
    List<Announcement> findByTargetRoundIdOrTargetRoundIdIsNullOrderByCreatedAtDesc(Long targetRoundId);
}
