package com.gnanamani.codeathon.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateAnnouncementRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String content;

    private String type = "GENERAL"; // GENERAL, ROUND, EMERGENCY, SCHEDULE, RESULT
    private Long targetRoundId;

    public CreateAnnouncementRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getTargetRoundId() { return targetRoundId; }
    public void setTargetRoundId(Long targetRoundId) { this.targetRoundId = targetRoundId; }
}
