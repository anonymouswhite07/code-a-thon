package com.gnanamani.codeathon.dto;

import java.time.LocalDateTime;

public class ParticipantAdminResponse {
    private Long id;
    private Long userId;
    private String email;
    private String fullName;
    private String phone;
    private String college;
    private String department;
    private String year;
    private String programmingExp;
    private Integer totalScore;
    private Boolean isSuspended;
    private LocalDateTime registeredAt;

    public ParticipantAdminResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

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

    public Boolean getIsSuspended() { return isSuspended; }
    public void setIsSuspended(Boolean isSuspended) { this.isSuspended = isSuspended; }

    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }
}
