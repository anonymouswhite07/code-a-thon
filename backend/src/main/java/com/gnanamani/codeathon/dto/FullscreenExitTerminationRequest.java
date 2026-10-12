package com.gnanamani.codeathon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class FullscreenExitTerminationRequest {

    @NotBlank(message = "Session token is required")
    private String sessionToken;

    @NotNull(message = "Round ID is required")
    private Long roundId;

    @NotNull(message = "Question ID is required")
    private Long questionId;

    private String sourceCode;

    private String language;

    public FullscreenExitTerminationRequest() {}

    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }

    public Long getRoundId() { return roundId; }
    public void setRoundId(Long roundId) { this.roundId = roundId; }

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }

    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
