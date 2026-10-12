package com.gnanamani.codeathon.dto;

import java.time.LocalDateTime;
import java.util.List;

public class StartSessionResponse {

    private String sessionToken;
    private Long roundId;
    private Integer roundNumber;
    private String roundTitle;
    private Long currentQuestionId;
    private LocalDateTime startedAt;
    private Long remainingSeconds;
    private List<Long> lockedQuestionIds;
    private Boolean isCompleted;
    private String status;

    public StartSessionResponse() {}

    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }

    public Long getRoundId() { return roundId; }
    public void setRoundId(Long roundId) { this.roundId = roundId; }

    public Integer getRoundNumber() { return roundNumber; }
    public void setRoundNumber(Integer roundNumber) { this.roundNumber = roundNumber; }

    public String getRoundTitle() { return roundTitle; }
    public void setRoundTitle(String roundTitle) { this.roundTitle = roundTitle; }

    public Long getCurrentQuestionId() { return currentQuestionId; }
    public void setCurrentQuestionId(Long currentQuestionId) { this.currentQuestionId = currentQuestionId; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public Long getRemainingSeconds() { return remainingSeconds; }
    public void setRemainingSeconds(Long remainingSeconds) { this.remainingSeconds = remainingSeconds; }

    public List<Long> getLockedQuestionIds() { return lockedQuestionIds; }
    public void setLockedQuestionIds(List<Long> lockedQuestionIds) { this.lockedQuestionIds = lockedQuestionIds; }

    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
