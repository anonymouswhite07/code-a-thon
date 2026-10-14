package com.gnanamani.codeathon.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ParticipantDetailedReportDto {
    private ParticipantReportSummaryDto summary;
    private List<SubmissionItemDto> submissions;
    private List<IntegrityEventItemDto> integrityEvents;
    private List<SessionItemDto> sessions;

    public ParticipantDetailedReportDto() {}

    public ParticipantDetailedReportDto(
            ParticipantReportSummaryDto summary,
            List<SubmissionItemDto> submissions,
            List<IntegrityEventItemDto> integrityEvents,
            List<SessionItemDto> sessions) {
        this.summary = summary;
        this.submissions = submissions;
        this.integrityEvents = integrityEvents;
        this.sessions = sessions;
    }

    public ParticipantReportSummaryDto getSummary() { return summary; }
    public void setSummary(ParticipantReportSummaryDto summary) { this.summary = summary; }

    public List<SubmissionItemDto> getSubmissions() { return submissions; }
    public void setSubmissions(List<SubmissionItemDto> submissions) { this.submissions = submissions; }

    public List<IntegrityEventItemDto> getIntegrityEvents() { return integrityEvents; }
    public void setIntegrityEvents(List<IntegrityEventItemDto> integrityEvents) { this.integrityEvents = integrityEvents; }

    public List<SessionItemDto> getSessions() { return sessions; }
    public void setSessions(List<SessionItemDto> sessions) { this.sessions = sessions; }

    public static class SubmissionItemDto {
        private Long id;
        private Long questionId;
        private String questionTitle;
        private Long roundId;
        private String roundTitle;
        private String language;
        private String code;
        private String status;
        private Integer score;
        private Integer executionTimeMs;
        private Integer memoryUsedKb;
        private LocalDateTime submittedAt;

        public SubmissionItemDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }

        public String getQuestionTitle() { return questionTitle; }
        public void setQuestionTitle(String questionTitle) { this.questionTitle = questionTitle; }

        public Long getRoundId() { return roundId; }
        public void setRoundId(Long roundId) { this.roundId = roundId; }

        public String getRoundTitle() { return roundTitle; }
        public void setRoundTitle(String roundTitle) { this.roundTitle = roundTitle; }

        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Integer getScore() { return score; }
        public void setScore(Integer score) { this.score = score; }

        public Integer getExecutionTimeMs() { return executionTimeMs; }
        public void setExecutionTimeMs(Integer executionTimeMs) { this.executionTimeMs = executionTimeMs; }

        public Integer getMemoryUsedKb() { return memoryUsedKb; }
        public void setMemoryUsedKb(Integer memoryUsedKb) { this.memoryUsedKb = memoryUsedKb; }

        public LocalDateTime getSubmittedAt() { return submittedAt; }
        public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    }

    public static class IntegrityEventItemDto {
        private Long id;
        private String roundTitle;
        private String questionTitle;
        private String eventType;
        private String eventContext;
        private LocalDateTime timestamp;
        private String ipAddress;

        public IntegrityEventItemDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getRoundTitle() { return roundTitle; }
        public void setRoundTitle(String roundTitle) { this.roundTitle = roundTitle; }

        public String getQuestionTitle() { return questionTitle; }
        public void setQuestionTitle(String questionTitle) { this.questionTitle = questionTitle; }

        public String getEventType() { return eventType; }
        public void setEventType(String eventType) { this.eventType = eventType; }

        public String getEventContext() { return eventContext; }
        public void setEventContext(String eventContext) { this.eventContext = eventContext; }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    }

    public static class SessionItemDto {
        private Long id;
        private String roundTitle;
        private String status;
        private LocalDateTime startedAt;
        private LocalDateTime endedAt;
        private Integer tabSwitchCount;
        private Integer fullscreenExitCount;
        private Integer clipboardAttemptCount;

        public SessionItemDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getRoundTitle() { return roundTitle; }
        public void setRoundTitle(String roundTitle) { this.roundTitle = roundTitle; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public LocalDateTime getStartedAt() { return startedAt; }
        public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

        public LocalDateTime getEndedAt() { return endedAt; }
        public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }

        public Integer getTabSwitchCount() { return tabSwitchCount; }
        public void setTabSwitchCount(Integer tabSwitchCount) { this.tabSwitchCount = tabSwitchCount; }

        public Integer getFullscreenExitCount() { return fullscreenExitCount; }
        public void setFullscreenExitCount(Integer fullscreenExitCount) { this.fullscreenExitCount = fullscreenExitCount; }

        public Integer getClipboardAttemptCount() { return clipboardAttemptCount; }
        public void setClipboardAttemptCount(Integer clipboardAttemptCount) { this.clipboardAttemptCount = clipboardAttemptCount; }
    }
}
