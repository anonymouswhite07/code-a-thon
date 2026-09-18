package com.gnanamani.codeathon.dto;

public class SubmissionResultDto {
    private String testCaseId;
    private String status;
    private Integer executionTimeMs;
    private String actualOutput;
    private String expectedOutput;
    private Boolean isHidden;
    private String error;

    public SubmissionResultDto() {}

    public String getTestCaseId() { return testCaseId; }
    public void setTestCaseId(String testCaseId) { this.testCaseId = testCaseId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Integer executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public String getActualOutput() { return actualOutput; }
    public void setActualOutput(String actualOutput) { this.actualOutput = actualOutput; }

    public String getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }

    public Boolean getIsHidden() { return isHidden; }
    public void setIsHidden(Boolean isHidden) { this.isHidden = isHidden; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}
