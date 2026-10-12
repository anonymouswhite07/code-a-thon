package com.gnanamani.codeathon.dto;

import jakarta.validation.constraints.NotNull;

public class AdvanceQuestionRequest {

    @NotNull(message = "roundId is required")
    private Long roundId;

    @NotNull(message = "currentQuestionId is required")
    private Long currentQuestionId;

    @NotNull(message = "nextQuestionId is required")
    private Long nextQuestionId;

    public AdvanceQuestionRequest() {}

    public AdvanceQuestionRequest(Long roundId, Long currentQuestionId, Long nextQuestionId) {
        this.roundId = roundId;
        this.currentQuestionId = currentQuestionId;
        this.nextQuestionId = nextQuestionId;
    }

    public Long getRoundId() { return roundId; }
    public void setRoundId(Long roundId) { this.roundId = roundId; }

    public Long getCurrentQuestionId() { return currentQuestionId; }
    public void setCurrentQuestionId(Long currentQuestionId) { this.currentQuestionId = currentQuestionId; }

    public Long getNextQuestionId() { return nextQuestionId; }
    public void setNextQuestionId(Long nextQuestionId) { this.nextQuestionId = nextQuestionId; }
}
