package com.gnanamani.codeathon.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "integrity_events")
public class IntegrityEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @Column(length = 64)
    private String sessionToken;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id")
    private Question question;

    @Column(nullable = false, length = 64)
    private String eventType;
    // e.g., ROUND_STARTED, INTEGRITY_AGREEMENT_ACCEPTED, TAB_HIDDEN, TAB_VISIBLE,
    // WINDOW_BLUR, WINDOW_FOCUS, FULLSCREEN_ENTERED, FULLSCREEN_EXITED,
    // COPY_ATTEMPT, CUT_ATTEMPT, PASTE_ATTEMPT, CONTEXT_MENU_ATTEMPT,
    // SUSPICIOUS_SHORTCUT, AUTO_SUBMISSION_REQUESTED, AUTO_SUBMISSION_CONFIRMED,
    // QUESTION_LOCKED, QUESTION_ADVANCED, ROUND_COMPLETED

    @Column(columnDefinition = "TEXT")
    private String eventContext;

    private Long submissionId;

    @Column(nullable = false)
    private LocalDateTime serverTimestamp = LocalDateTime.now();

    private String ipAddress;

    public IntegrityEvent() {}

    public IntegrityEvent(Participant participant, String sessionToken, Round round, Question question,
                          String eventType, String eventContext, Long submissionId, String ipAddress) {
        this.participant = participant;
        this.sessionToken = sessionToken;
        this.round = round;
        this.question = question;
        this.eventType = eventType;
        this.eventContext = eventContext;
        this.submissionId = submissionId;
        this.ipAddress = ipAddress;
        this.serverTimestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Participant getParticipant() { return participant; }
    public void setParticipant(Participant participant) { this.participant = participant; }

    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }

    public Round getRound() { return round; }
    public void setRound(Round round) { this.round = round; }

    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getEventContext() { return eventContext; }
    public void setEventContext(String eventContext) { this.eventContext = eventContext; }

    public Long getSubmissionId() { return submissionId; }
    public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }

    public LocalDateTime getServerTimestamp() { return serverTimestamp; }
    public void setServerTimestamp(LocalDateTime serverTimestamp) { this.serverTimestamp = serverTimestamp; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}
