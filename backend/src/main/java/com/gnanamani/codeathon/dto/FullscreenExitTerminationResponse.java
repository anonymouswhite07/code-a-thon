package com.gnanamani.codeathon.dto;

public class FullscreenExitTerminationResponse {

    private Boolean isTerminated;
    private String status;
    private Long questionId;
    private Long submissionId;
    private Integer score;
    private String message;

    public FullscreenExitTerminationResponse() {}

    public Boolean getIsTerminated() { return isTerminated; }
    public void setIsTerminated(Boolean isTerminated) { this.isTerminated = isTerminated; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }

    public Long getSubmissionId() { return submissionId; }
    public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
