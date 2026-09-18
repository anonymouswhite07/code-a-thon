package com.gnanamani.codeathon.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "participants")
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String college;

    @Column(nullable = false)
    private String department;

    @Column(name = "study_year", nullable = false)
    private String year; // e.g. "1st Year", "2nd Year", "3rd Year", "Final Year"

    private String programmingExp; // "Beginner", "Intermediate", "Advanced"

    @Column(nullable = false)
    private Integer totalScore = 0;

    @Column(nullable = false)
    private Boolean isSuspended = false;

    public Participant() {}

    public Participant(User user, String phone, String college, String department, String year, String programmingExp) {
        this.user = user;
        this.phone = phone;
        this.college = college;
        this.department = department;
        this.year = year;
        this.programmingExp = programmingExp;
        this.totalScore = 0;
        this.isSuspended = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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
}
