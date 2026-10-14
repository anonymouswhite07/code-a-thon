package com.gnanamani.codeathon.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class JudgeScoreUpdateRequest {

    @NotNull(message = "Score is required")
    @Min(value = 0, message = "Score cannot be negative")
    @Max(value = 1000, message = "Score cannot exceed max limit")
    private Integer score;

    private String status;
    private String remarks;

    public JudgeScoreUpdateRequest() {}

    public JudgeScoreUpdateRequest(Integer score, String status, String remarks) {
        this.score = score;
        this.status = status;
        this.remarks = remarks;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
