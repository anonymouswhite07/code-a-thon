package com.gnanamani.codeathon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SubmitCodeRequest {
    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotBlank(message = "Language is required")
    private String language;

    @NotBlank(message = "Source code cannot be empty")
    private String sourceCode;

    public SubmitCodeRequest() {}

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }
}
