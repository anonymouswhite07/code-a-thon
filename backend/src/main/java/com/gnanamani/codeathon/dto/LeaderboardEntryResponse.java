package com.gnanamani.codeathon.dto;

public class LeaderboardEntryResponse {
    private Integer rank;
    private Long participantId;
    private String fullName;
    private String college;
    private String department;
    private Integer totalScore;
    private Integer round1Score;
    private Integer round2Score;
    private Integer round3Score;
    private Integer solvedCount;
    private Long totalExecutionTimeMs;

    public LeaderboardEntryResponse() {}

    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }

    public Long getParticipantId() { return participantId; }
    public void setParticipantId(Long participantId) { this.participantId = participantId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getTotalScore() { return totalScore; }
    public void setTotalScore(Integer totalScore) { this.totalScore = totalScore; }

    public Integer getRound1Score() { return round1Score; }
    public void setRound1Score(Integer round1Score) { this.round1Score = round1Score; }

    public Integer getRound2Score() { return round2Score; }
    public void setRound2Score(Integer round2Score) { this.round2Score = round2Score; }

    public Integer getRound3Score() { return round3Score; }
    public void setRound3Score(Integer round3Score) { this.round3Score = round3Score; }

    public Integer getSolvedCount() { return solvedCount; }
    public void setSolvedCount(Integer solvedCount) { this.solvedCount = solvedCount; }

    public Long getTotalExecutionTimeMs() { return totalExecutionTimeMs; }
    public void setTotalExecutionTimeMs(Long totalExecutionTimeMs) { this.totalExecutionTimeMs = totalExecutionTimeMs; }
}
