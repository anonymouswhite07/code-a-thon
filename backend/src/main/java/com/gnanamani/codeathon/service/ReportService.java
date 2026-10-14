package com.gnanamani.codeathon.service;

import com.gnanamani.codeathon.domain.*;
import com.gnanamani.codeathon.dto.*;
import com.gnanamani.codeathon.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ParticipantRepository participantRepository;
    private final SubmissionRepository submissionRepository;
    private final IntegrityEventRepository eventRepository;
    private final CompetitionSessionRepository sessionRepository;
    private final RoundRepository roundRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public ReportService(
            ParticipantRepository participantRepository,
            SubmissionRepository submissionRepository,
            IntegrityEventRepository eventRepository,
            CompetitionSessionRepository sessionRepository,
            RoundRepository roundRepository) {
        this.participantRepository = participantRepository;
        this.submissionRepository = submissionRepository;
        this.eventRepository = eventRepository;
        this.sessionRepository = sessionRepository;
        this.roundRepository = roundRepository;
    }

    @Transactional(readOnly = true)
    public List<ParticipantReportSummaryDto> generateAllParticipantsReport() {
        List<Participant> participants = participantRepository.findAll().stream()
                .sorted((a, b) -> Integer.compare(
                        b.getTotalScore() != null ? b.getTotalScore() : 0,
                        a.getTotalScore() != null ? a.getTotalScore() : 0
                ))
                .toList();

        List<ParticipantReportSummaryDto> report = new ArrayList<>();
        int rank = 1;
        for (Participant p : participants) {
            ParticipantReportSummaryDto dto = buildSummaryDto(p, rank++);
            report.add(dto);
        }

        return report;
    }

    @Transactional(readOnly = true)
    public ParticipantDetailedReportDto generateDetailedParticipantReport(Long participantId) {
        Participant p = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found with id: " + participantId));

        // Compute rank
        List<Participant> sorted = participantRepository.findAll().stream()
                .sorted((a, b) -> Integer.compare(
                        b.getTotalScore() != null ? b.getTotalScore() : 0,
                        a.getTotalScore() != null ? a.getTotalScore() : 0
                ))
                .toList();
        int rank = 1;
        for (Participant curr : sorted) {
            if (curr.getId().equals(participantId)) break;
            rank++;
        }

        ParticipantReportSummaryDto summary = buildSummaryDto(p, rank);

        // Fetch submissions
        List<Submission> submissions = submissionRepository.findByParticipantIdOrderBySubmissionTimeDesc(participantId);
        List<ParticipantDetailedReportDto.SubmissionItemDto> subDtos = submissions.stream().map(s -> {
            ParticipantDetailedReportDto.SubmissionItemDto item = new ParticipantDetailedReportDto.SubmissionItemDto();
            item.setId(s.getId());
            item.setQuestionId(s.getQuestion() != null ? s.getQuestion().getId() : null);
            item.setQuestionTitle(s.getQuestion() != null ? s.getQuestion().getTitle() : "Unknown Question");
            item.setRoundId(s.getRound() != null ? s.getRound().getId() : null);
            item.setRoundTitle(s.getRound() != null ? s.getRound().getTitle() : "Unknown Round");
            item.setLanguage(s.getLanguage());
            item.setCode(s.getSourceCode());
            item.setStatus(s.getStatus());
            item.setScore(s.getScore());
            item.setExecutionTimeMs(s.getExecutionTimeMs());
            item.setMemoryUsedKb(s.getMemoryKb());
            item.setSubmittedAt(s.getSubmissionTime());
            return item;
        }).toList();

        // Fetch integrity events
        List<IntegrityEvent> events = eventRepository.findByParticipantIdOrderByServerTimestampDesc(participantId);
        List<ParticipantDetailedReportDto.IntegrityEventItemDto> eventDtos = events.stream().map(e -> {
            ParticipantDetailedReportDto.IntegrityEventItemDto item = new ParticipantDetailedReportDto.IntegrityEventItemDto();
            item.setId(e.getId());
            item.setRoundTitle(e.getRound() != null ? e.getRound().getTitle() : "-");
            item.setQuestionTitle(e.getQuestion() != null ? e.getQuestion().getTitle() : "-");
            item.setEventType(e.getEventType());
            item.setEventContext(e.getEventContext());
            item.setTimestamp(e.getServerTimestamp());
            item.setIpAddress(e.getIpAddress());
            return item;
        }).toList();

        // Fetch sessions
        List<CompetitionSession> sessions = sessionRepository.findByParticipantIdOrderByStartedAtDesc(participantId);
        List<ParticipantDetailedReportDto.SessionItemDto> sessionDtos = sessions.stream().map(s -> {
            ParticipantDetailedReportDto.SessionItemDto item = new ParticipantDetailedReportDto.SessionItemDto();
            item.setId(s.getId());
            item.setRoundTitle(s.getRound() != null ? s.getRound().getTitle() : "-");
            item.setStatus(s.getStatus());
            item.setStartedAt(s.getStartedAt());
            item.setEndedAt(s.getCompletedAt());
            item.setTabSwitchCount(s.getTabSwitchCount());
            item.setFullscreenExitCount(s.getFullscreenExitCount());
            item.setClipboardAttemptCount(s.getClipboardAttemptCount());
            return item;
        }).toList();

        return new ParticipantDetailedReportDto(summary, subDtos, eventDtos, sessionDtos);
    }

    private ParticipantReportSummaryDto buildSummaryDto(Participant p, int rank) {
        ParticipantReportSummaryDto dto = new ParticipantReportSummaryDto();
        dto.setParticipantId(p.getId());
        dto.setUserId(p.getUser() != null ? p.getUser().getId() : null);
        dto.setFullName(p.getUser() != null ? p.getUser().getFullName() : "Unknown");
        dto.setEmail(p.getUser() != null ? p.getUser().getEmail() : "Unknown");
        dto.setPhone(p.getPhone());
        dto.setCollege(p.getCollege());
        dto.setDepartment(p.getDepartment());
        dto.setYear(p.getYear());
        dto.setProgrammingExp(p.getProgrammingExp());
        dto.setTotalScore(p.getTotalScore() != null ? p.getTotalScore() : 0);
        dto.setRank(rank);
        dto.setIsSuspended(Boolean.TRUE.equals(p.getIsSuspended()));
        dto.setRegisteredAt(p.getUser() != null ? p.getUser().getCreatedAt() : null);
        dto.setLastLoginAt(p.getUser() != null ? p.getUser().getLastLoginAt() : null);

        // Submissions breakdown
        List<Submission> userSubmissions = submissionRepository.findByParticipantIdOrderBySubmissionTimeDesc(p.getId());
        dto.setTotalSubmissions(userSubmissions.size());

        int passed = 0;
        int failed = 0;
        Map<String, Integer> roundScores = new LinkedHashMap<>();
        Map<String, Integer> roundSubmissions = new LinkedHashMap<>();

        // Group per round
        for (Submission s : userSubmissions) {
            String roundKey = (s.getRound() != null) ? "Round " + s.getRound().getRoundNumber() : "Other";
            roundSubmissions.put(roundKey, roundSubmissions.getOrDefault(roundKey, 0) + 1);

            if ("PASSED".equalsIgnoreCase(s.getStatus())) {
                passed++;
                int currentBest = roundScores.getOrDefault(roundKey, 0);
                if (s.getScore() != null && s.getScore() > currentBest) {
                    roundScores.put(roundKey, currentBest + s.getScore());
                }
            } else {
                failed++;
            }
        }

        dto.setPassedSubmissions(passed);
        dto.setFailedSubmissions(failed);
        dto.setRoundScores(roundScores);
        dto.setRoundSubmissions(roundSubmissions);

        // Integrity violations count
        List<IntegrityEvent> events = eventRepository.findByParticipantIdOrderByServerTimestampDesc(p.getId());
        dto.setTotalIntegrityViolations(events.size());

        return dto;
    }

    public byte[] generateCsvReportBytes() {
        List<ParticipantReportSummaryDto> report = generateAllParticipantsReport();
        StringBuilder sb = new StringBuilder();

        // UTF-8 BOM for Excel
        sb.append('\ufeff');

        // Meta Header
        sb.append("# GNANAMANI COLLEGE OF TECHNOLOGY - CODE-A-THON 2026\n");
        sb.append("# Organised by: Department of Information Technology in Coding Club\n");
        sb.append("# Official Post-Competition Participant Audit & Activity Report\n");
        sb.append("# Generated on: ").append(java.time.LocalDateTime.now().format(DATE_FMT)).append("\n\n");

        // Columns
        sb.append("Rank,Participant ID,Full Name,Email,College,Department,Year,Phone,Total Score,Round 1 (C) Submissions,Round 2 (Java) Submissions,Round 3 (Python) Submissions,Total Submissions,Passed Submissions,Failed Submissions,Integrity Violations,Account Status,Registered At,Last Login At\n");

        for (ParticipantReportSummaryDto r : report) {
            int r1Subs = r.getRoundSubmissions() != null ? r.getRoundSubmissions().getOrDefault("Round 1", 0) : 0;
            int r2Subs = r.getRoundSubmissions() != null ? r.getRoundSubmissions().getOrDefault("Round 2", 0) : 0;
            int r3Subs = r.getRoundSubmissions() != null ? r.getRoundSubmissions().getOrDefault("Round 3", 0) : 0;

            sb.append(r.getRank()).append(",")
              .append(r.getParticipantId()).append(",")
              .append(escapeCsv(r.getFullName())).append(",")
              .append(escapeCsv(r.getEmail())).append(",")
              .append(escapeCsv(r.getCollege())).append(",")
              .append(escapeCsv(r.getDepartment())).append(",")
              .append(escapeCsv(r.getYear())).append(",")
              .append(escapeCsv(r.getPhone())).append(",")
              .append(r.getTotalScore()).append(",")
              .append(r1Subs).append(",")
              .append(r2Subs).append(",")
              .append(r3Subs).append(",")
              .append(r.getTotalSubmissions()).append(",")
              .append(r.getPassedSubmissions()).append(",")
              .append(r.getFailedSubmissions()).append(",")
              .append(r.getTotalIntegrityViolations()).append(",")
              .append(Boolean.TRUE.equals(r.getIsSuspended()) ? "SUSPENDED" : "ACTIVE").append(",")
              .append(r.getRegisteredAt() != null ? r.getRegisteredAt().format(DATE_FMT) : "N/A").append(",")
              .append(r.getLastLoginAt() != null ? r.getLastLoginAt().format(DATE_FMT) : "N/A").append("\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String value) {
        if (value == null) return "\"\"";
        String s = value.replace("\"", "\"\"");
        return "\"" + s + "\"";
    }
}
