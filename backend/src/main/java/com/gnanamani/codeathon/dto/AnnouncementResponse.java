package com.gnanamani.codeathon.dto;

import java.time.LocalDateTime;

public class AnnouncementResponse {
    private Long id;
    private String title;
    private String content;
    private String type;
    private Long targetRoundId;
    private String createdBy;
    private LocalDateTime createdAt;

    public AnnouncementResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getTargetRoundId() { return targetRoundId; }
    public void setTargetRoundId(Long targetRoundId) { this.targetRoundId = targetRoundId; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
