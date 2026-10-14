package com.gnanamani.codeathon.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class ParticipantReportSummaryDto {
    private Long participantId;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String college;
    private String department;
    private String year;
    private String programmingExp;
    private Integer totalScore;
    private Integer rank;
    private Boolean isSuspended;
    private LocalDateTime registeredAt;
    private LocalDateTime lastLoginAt;
    private int totalSubmissions;
    private int passedSubmissions;
    private int failedSubmissions;
    private int totalIntegrityViolations;
    private Map<String, Integer> roundScores;
    private Map<String, Integer> roundSubmissions;

    public ParticipantReportSummaryDto() {}

    public Long getParticipantId() { return participantId; }
    public void setParticipantId(Long participantId) { this.participantId = participantId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getProgrammingExp() { return programmingExp; }
    public void setProgrammingExp(String programmingExp) { this.programmingExp = programmingExp; }

    public Integer getTotalScore() { return totalScore; }
    public void setTotalScore(Integer totalScore) { this.totalScore = totalScore; }

    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }

    public Boolean getIsSuspended() { return isSuspended; }
    public void setIsSuspended(Boolean isSuspended) { this.isSuspended = isSuspended; }

    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public int getTotalSubmissions() { return totalSubmissions; }
    public void setTotalSubmissions(int totalSubmissions) { this.totalSubmissions = totalSubmissions; }

    public int getPassedSubmissions() { return passedSubmissions; }
    public void setPassedSubmissions(int passedSubmissions) { this.passedSubmissions = passedSubmissions; }

    public int getFailedSubmissions() { return failedSubmissions; }
    public void setFailedSubmissions(int failedSubmissions) { this.failedSubmissions = failedSubmissions; }

    public int getTotalIntegrityViolations() { return totalIntegrityViolations; }
    public void setTotalIntegrityViolations(int totalIntegrityViolations) { this.totalIntegrityViolations = totalIntegrityViolations; }

    public Map<String, Integer> getRoundScores() { return roundScores; }
    public void setRoundScores(Map<String, Integer> roundScores) { this.roundScores = roundScores; }

    public Map<String, Integer> getRoundSubmissions() { return roundSubmissions; }
    public void setRoundSubmissions(Map<String, Integer> roundSubmissions) { this.roundSubmissions = roundSubmissions; }
}
