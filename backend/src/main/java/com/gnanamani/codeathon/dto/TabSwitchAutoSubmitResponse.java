package com.gnanamani.codeathon.dto;

public class TabSwitchAutoSubmitResponse {

    private Long questionId;
    private Boolean isLocked;
    private Long submissionId;
    private String status;
    private Integer score;
    private Long nextQuestionId;
    private Boolean isRoundCompleted;
    private String message;

    public TabSwitchAutoSubmitResponse() {}

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }

    public Boolean getIsLocked() { return isLocked; }
    public void setIsLocked(Boolean isLocked) { this.isLocked = isLocked; }

    public Long getSubmissionId() { return submissionId; }
    public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Long getNextQuestionId() { return nextQuestionId; }
    public void setNextQuestionId(Long nextQuestionId) { this.nextQuestionId = nextQuestionId; }

    public Boolean getIsRoundCompleted() { return isRoundCompleted; }
    public void setIsRoundCompleted(Boolean isRoundCompleted) { this.isRoundCompleted = isRoundCompleted; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
