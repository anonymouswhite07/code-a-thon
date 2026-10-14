package com.gnanamani.codeathon.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class JudgeParticipantScoreRequest {

    @NotNull(message = "Score is required")
    @Min(value = 0, message = "Score cannot be negative")
    @Max(value = 10000, message = "Score cannot exceed max limit")
    private Integer score;

    private String remarks;

    public JudgeParticipantScoreRequest() {}

    public JudgeParticipantScoreRequest(Integer score, String remarks) {
        this.score = score;
        this.remarks = remarks;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
