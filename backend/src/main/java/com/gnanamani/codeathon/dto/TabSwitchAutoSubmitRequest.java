package com.gnanamani.codeathon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class TabSwitchAutoSubmitRequest {

    @NotBlank(message = "Session token is required")
    private String sessionToken;

    @NotNull(message = "Round ID is required")
    private Long roundId;

    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotBlank(message = "Language is required")
    private String language;

    private String sourceCode;

    @NotBlank(message = "Idempotency key is required")
    @Size(max = 64, message = "Idempotency key cannot exceed 64 characters")
    private String idempotencyKey;

    public TabSwitchAutoSubmitRequest() {}

    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }

    public Long getRoundId() { return roundId; }
    public void setRoundId(Long roundId) { this.roundId = roundId; }

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
}
