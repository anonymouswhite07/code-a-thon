package com.gnanamani.codeathon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RecordIntegrityEventRequest {

    @NotBlank(message = "Session token is required")
    private String sessionToken;

    @NotNull(message = "Round ID is required")
    private Long roundId;

    private Long questionId;

    @NotBlank(message = "Event type is required")
    @Size(max = 64, message = "Event type cannot exceed 64 characters")
    private String eventType;

    @Size(max = 2000, message = "Event context cannot exceed 2000 characters")
    private String eventContext;

    public RecordIntegrityEventRequest() {}

    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }

    public Long getRoundId() { return roundId; }
    public void setRoundId(Long roundId) { this.roundId = roundId; }

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getEventContext() { return eventContext; }
    public void setEventContext(String eventContext) { this.eventContext = eventContext; }
}
