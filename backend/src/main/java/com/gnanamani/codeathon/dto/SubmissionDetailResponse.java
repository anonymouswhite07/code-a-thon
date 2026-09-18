package com.gnanamani.codeathon.dto;

import java.util.List;

public class SubmissionDetailResponse extends SubmissionResponse {
    private String sourceCode;
    private List<SubmissionResultDto> results;

    public SubmissionDetailResponse() {}

    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }

    public List<SubmissionResultDto> getResults() { return results; }
    public void setResults(List<SubmissionResultDto> results) { this.results = results; }
}
