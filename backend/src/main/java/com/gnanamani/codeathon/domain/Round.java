package com.gnanamani.codeathon.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rounds")
public class Round {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer roundNumber;

    @Column(nullable = false)
    private String title;

    private String subtitle;

    @Column(nullable = false)
    private String language; // "C", "PYTHON", "JAVA"

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String status = "SCHEDULED"; // DRAFT, SCHEDULED, LIVE, PAUSED, ENDED

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Column(nullable = false)
    private Integer durationMinutes = 45;

    @Column(nullable = false)
    private Boolean isLocked = true;

    public Round() {}

    public Round(Integer roundNumber, String title, String subtitle, String language, String description, Integer durationMinutes) {
        this.roundNumber = roundNumber;
        this.title = title;
        this.subtitle = subtitle;
        this.language = language;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.status = "SCHEDULED";
        this.isLocked = (roundNumber > 1);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getRoundNumber() { return roundNumber; }
    public void setRoundNumber(Integer roundNumber) { this.roundNumber = roundNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Boolean getIsLocked() { return isLocked; }
    public void setIsLocked(Boolean isLocked) { this.isLocked = isLocked; }
}
