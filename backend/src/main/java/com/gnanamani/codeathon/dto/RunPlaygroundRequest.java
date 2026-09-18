package com.gnanamani.codeathon.dto;

import jakarta.validation.constraints.NotBlank;

public class RunPlaygroundRequest {
    @NotBlank(message = "Language is required")
    private String language;

    @NotBlank(message = "Source code cannot be empty")
    private String sourceCode;

    private String customInput;

    public RunPlaygroundRequest() {}

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }

    public String getCustomInput() { return customInput; }
    public void setCustomInput(String customInput) { this.customInput = customInput; }
}
