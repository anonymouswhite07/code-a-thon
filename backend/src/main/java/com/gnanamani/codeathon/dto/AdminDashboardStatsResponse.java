package com.gnanamani.codeathon.dto;

public class AdminDashboardStatsResponse {
    private long totalParticipants;
    private long activeParticipants;
    private long totalSubmissions;
    private long passedSubmissions;
    private long failedSubmissions;
    private String currentRoundTitle;
    private String currentRoundStatus;
    private Long currentRoundRemainingSeconds;
    private boolean leaderboardFrozen;
    private boolean finalResultsPublished;

    public AdminDashboardStatsResponse() {}

    public long getTotalParticipants() { return totalParticipants; }
    public void setTotalParticipants(long totalParticipants) { this.totalParticipants = totalParticipants; }

    public long getActiveParticipants() { return activeParticipants; }
    public void setActiveParticipants(long activeParticipants) { this.activeParticipants = activeParticipants; }

    public long getTotalSubmissions() { return totalSubmissions; }
    public void setTotalSubmissions(long totalSubmissions) { this.totalSubmissions = totalSubmissions; }

    public long getPassedSubmissions() { return passedSubmissions; }
    public void setPassedSubmissions(long passedSubmissions) { this.passedSubmissions = passedSubmissions; }

    public long getFailedSubmissions() { return failedSubmissions; }
    public void setFailedSubmissions(long failedSubmissions) { this.failedSubmissions = failedSubmissions; }

    public String getCurrentRoundTitle() { return currentRoundTitle; }
    public void setCurrentRoundTitle(String currentRoundTitle) { this.currentRoundTitle = currentRoundTitle; }

    public String getCurrentRoundStatus() { return currentRoundStatus; }
    public void setCurrentRoundStatus(String currentRoundStatus) { this.currentRoundStatus = currentRoundStatus; }

    public Long getCurrentRoundRemainingSeconds() { return currentRoundRemainingSeconds; }
    public void setCurrentRoundRemainingSeconds(Long currentRoundRemainingSeconds) { this.currentRoundRemainingSeconds = currentRoundRemainingSeconds; }

    public boolean isLeaderboardFrozen() { return leaderboardFrozen; }
    public void setLeaderboardFrozen(boolean leaderboardFrozen) { this.leaderboardFrozen = leaderboardFrozen; }

    public boolean isFinalResultsPublished() { return finalResultsPublished; }
    public void setFinalResultsPublished(boolean finalResultsPublished) { this.finalResultsPublished = finalResultsPublished; }
}
