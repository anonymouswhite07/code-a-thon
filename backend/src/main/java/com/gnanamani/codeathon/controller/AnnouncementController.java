package com.gnanamani.codeathon.controller;

import com.gnanamani.codeathon.domain.Announcement;
import com.gnanamani.codeathon.dto.AnnouncementResponse;
import com.gnanamani.codeathon.dto.ApiResponse;
import com.gnanamani.codeathon.repository.AnnouncementRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/announcements")
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementController(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    private AnnouncementResponse mapToDto(Announcement a) {
        AnnouncementResponse dto = new AnnouncementResponse();
        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setContent(a.getContent());
        dto.setType(a.getType());
        dto.setTargetRoundId(a.getTargetRoundId());
        dto.setCreatedBy(a.getCreatedBy());
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAllAnnouncements() {
        List<AnnouncementResponse> list = announcementRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToDto).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/round/{roundId}")
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAnnouncementsForRound(@PathVariable Long roundId) {
        List<AnnouncementResponse> list = announcementRepository.findByTargetRoundIdOrTargetRoundIdIsNullOrderByCreatedAtDesc(roundId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
