package com.gnanamani.codeathon.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "competition_sessions")
public class CompetitionSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String sessionToken;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_question_id")
    private Question currentQuestion;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, COMPLETED, DISQUALIFIED, ABANDONED

    @Column(nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    private LocalDateTime agreementAcceptedAt;

    private LocalDateTime completedAt;

    @Column(nullable = false)
    private Integer tabSwitchCount = 0;

    @Column(nullable = false)
    private Integer fullscreenExitCount = 0;

    @Column(nullable = false)
    private Integer clipboardAttemptCount = 0;

    private String ipAddress;

    public CompetitionSession() {}

    public CompetitionSession(String sessionToken, Participant participant, Round round, String ipAddress) {
        this.sessionToken = sessionToken;
        this.participant = participant;
        this.round = round;
        this.ipAddress = ipAddress;
        this.startedAt = LocalDateTime.now();
        this.agreementAcceptedAt = LocalDateTime.now();
        this.status = "ACTIVE";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }

    public Participant getParticipant() { return participant; }
    public void setParticipant(Participant participant) { this.participant = participant; }

    public Round getRound() { return round; }
    public void setRound(Round round) { this.round = round; }

    public Question getCurrentQuestion() { return currentQuestion; }
    public void setCurrentQuestion(Question currentQuestion) { this.currentQuestion = currentQuestion; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getAgreementAcceptedAt() { return agreementAcceptedAt; }
    public void setAgreementAcceptedAt(LocalDateTime agreementAcceptedAt) { this.agreementAcceptedAt = agreementAcceptedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public Integer getTabSwitchCount() { return tabSwitchCount; }
    public void setTabSwitchCount(Integer tabSwitchCount) { this.tabSwitchCount = tabSwitchCount; }

    public Integer getFullscreenExitCount() { return fullscreenExitCount; }
    public void setFullscreenExitCount(Integer fullscreenExitCount) { this.fullscreenExitCount = fullscreenExitCount; }

    public Integer getClipboardAttemptCount() { return clipboardAttemptCount; }
    public void setClipboardAttemptCount(Integer clipboardAttemptCount) { this.clipboardAttemptCount = clipboardAttemptCount; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}
