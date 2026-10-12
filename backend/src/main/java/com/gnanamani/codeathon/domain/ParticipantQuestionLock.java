package com.gnanamani.codeathon.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "participant_question_locks",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"participant_id", "question_id"})
    }
)
public class ParticipantQuestionLock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false)
    private Boolean isLocked = true;

    @Column(nullable = false)
    private String lockReason = "TAB_SWITCH_AUTO_SUBMIT"; // TAB_SWITCH_AUTO_SUBMIT, MANUAL_SUBMISSION_LIMIT, ROUND_COMPLETED, ADMIN_LOCKED

    @Column(nullable = false)
    private LocalDateTime lockedAt = LocalDateTime.now();

    public ParticipantQuestionLock() {}

    public ParticipantQuestionLock(Participant participant, Round round, Question question, String lockReason) {
        this.participant = participant;
        this.round = round;
        this.question = question;
        this.lockReason = lockReason;
        this.isLocked = true;
        this.lockedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Participant getParticipant() { return participant; }
    public void setParticipant(Participant participant) { this.participant = participant; }

    public Round getRound() { return round; }
    public void setRound(Round round) { this.round = round; }

    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }

    public Boolean getIsLocked() { return isLocked; }
    public void setIsLocked(Boolean isLocked) { this.isLocked = isLocked; }

    public String getLockReason() { return lockReason; }
    public void setLockReason(String lockReason) { this.lockReason = lockReason; }

    public LocalDateTime getLockedAt() { return lockedAt; }
    public void setLockedAt(LocalDateTime lockedAt) { this.lockedAt = lockedAt; }
}
