package com.gnanamani.codeathon.service;

import com.gnanamani.codeathon.domain.*;
import com.gnanamani.codeathon.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ParticipantRepository participantRepository;
    private final RoundRepository roundRepository;
    private final QuestionRepository questionRepository;
    private final TestCaseRepository testCaseRepository;
    private final AnnouncementRepository announcementRepository;
    private final CompetitionConfigRepository configRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            UserRepository userRepository,
            ParticipantRepository participantRepository,
            RoundRepository roundRepository,
            QuestionRepository questionRepository,
            TestCaseRepository testCaseRepository,
            AnnouncementRepository announcementRepository,
            CompetitionConfigRepository configRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.participantRepository = participantRepository;
        this.roundRepository = roundRepository;
        this.questionRepository = questionRepository;
        this.testCaseRepository = testCaseRepository;
        this.announcementRepository = announcementRepository;
        this.configRepository = configRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // already seeded
        }

        // 1. Seed Configs
        configRepository.save(new CompetitionConfig("leaderboard.frozen", "false"));
        configRepository.save(new CompetitionConfig("results.published", "false"));
        configRepository.save(new CompetitionConfig("event.date", "2026-03-28T09:00:00"));

        // 2. Seed Admin & Judges
        User superAdmin = new User("superadmin@gct.ac.in", passwordEncoder.encode("Super@2026"), "Dr. K. Arulmurugan (Principal)", Role.ROLE_SUPER_ADMIN);
        User admin = new User("admin@gct.ac.in", passwordEncoder.encode("Admin@2026"), "Prof. S. Gnanasambandan (HOD CSE)", Role.ROLE_ADMIN);
        User judge = new User("judge@gct.ac.in", passwordEncoder.encode("Judge@2026"), "Dr. R. Priyadharshini (Lead Judge)", Role.ROLE_JUDGE);
        userRepository.saveAll(List.of(superAdmin, admin, judge));

        // 3. Seed Rounds
        Round r1 = new Round(1, "Round 01 — C", "The Foundation", "C",
                "Master the basics. Build your logic. Solve memory and pointer puzzles with precision.", 45);
        r1.setStatus("LIVE");
        r1.setIsLocked(false);
        r1.setStartTime(LocalDateTime.now().minusMinutes(10));
        r1.setEndTime(LocalDateTime.now().plusMinutes(35));

        Round r2 = new Round(2, "Round 02 — Python", "The Logic", "PYTHON",
                "Think smarter, solve faster. Tackle algorithmic puzzles, string parsing, and graph search.", 45);
        r2.setStatus("SCHEDULED");
        r2.setIsLocked(true);

        Round r3 = new Round(3, "Round 03 — Java", "The Master", "JAVA",
                "Apply enterprise structures, OOP architecture, and dynamic programming to conquer the podium.", 60);
        r3.setStatus("SCHEDULED");
        r3.setIsLocked(true);

        roundRepository.saveAll(List.of(r1, r2, r3));

        // 4. Seed Questions for Round 1 (C)
        Question q1_1 = new Question();
        q1_1.setRound(r1);
        q1_1.setTitle("Bitwise Palindrome Checker");
        q1_1.setSlug("bitwise-palindrome-checker");
        q1_1.setDescription("Given a 32-bit unsigned integer $N$, determine if its binary representation (ignoring leading zeros) reads the same forwards and backwards.\n\nPrint `YES` if the binary representation is a palindrome, otherwise print `NO`.");
        q1_1.setInputFormat("A single integer N on the standard input.");
        q1_1.setOutputFormat("Print `YES` or `NO` on a single line.");
        q1_1.setConstraints("1 <= N <= 2^31 - 1");
        q1_1.setExamples("Input: 9\nOutput: YES\nExplanation: 9 in binary is 1001, which is a palindrome.\n\nInput: 10\nOutput: NO\nExplanation: 10 in binary is 1010, which is not a palindrome.");
        q1_1.setStarterCode("#include <stdio.h>\n\nint main() {\n    unsigned int n;\n    if (scanf(\"%u\", &n) != 1) return 0;\n    // TODO: Determine if binary representation of n is palindrome\n    return 0;\n}\n");
        q1_1.setDifficulty("EASY");
        q1_1.setPoints(100);
        q1_1.setOrderIndex(1);

        Question q1_2 = new Question();
        q1_2.setRound(r1);
        q1_2.setTitle("Matrix Spiral Traversal");
        q1_2.setSlug("matrix-spiral-traversal");
        q1_2.setDescription("Given an $R \\times C$ 2D integer matrix, traverse and print all elements in clockwise spiral order starting from top-left $(0,0)$.");
        q1_2.setInputFormat("First line contains two integers R and C. The next R lines each contain C space-separated integers.");
        q1_2.setOutputFormat("Print all elements in spiral order separated by spaces on a single line.");
        q1_2.setConstraints("1 <= R, C <= 100\n-1000 <= Matrix[i][j] <= 1000");
        q1_2.setExamples("Input:\n3 3\n1 2 3\n4 5 6\n7 8 9\nOutput:\n1 2 3 6 9 8 7 4 5");
        q1_2.setStarterCode("#include <stdio.h>\n\nint main() {\n    int r, c;\n    if (scanf(\"%d %d\", &r, &c) != 2) return 0;\n    // Your code here\n    return 0;\n}\n");
        q1_2.setDifficulty("MEDIUM");
        q1_2.setPoints(150);
        q1_2.setOrderIndex(2);

        questionRepository.saveAll(List.of(q1_1, q1_2));

        // Test cases for Q1_1
        testCaseRepository.save(new TestCase(q1_1, "9\n", "YES", false, 1));
        testCaseRepository.save(new TestCase(q1_1, "10\n", "NO", false, 2));
        testCaseRepository.save(new TestCase(q1_1, "5\n", "YES", true, 3)); // 101
        testCaseRepository.save(new TestCase(q1_1, "7\n", "YES", true, 4)); // 111
        testCaseRepository.save(new TestCase(q1_1, "21\n", "YES", true, 5)); // 10101

        // Test cases for Q1_2
        testCaseRepository.save(new TestCase(q1_2, "3 3\n1 2 3\n4 5 6\n7 8 9\n", "1 2 3 6 9 8 7 4 5", false, 1));
        testCaseRepository.save(new TestCase(q1_2, "2 3\n1 2 3\n4 5 6\n", "1 2 3 6 5 4", false, 2));
        testCaseRepository.save(new TestCase(q1_2, "1 4\n5 10 15 20\n", "5 10 15 20", true, 3));

        // 5. Seed Questions for Round 2 (Python)
        Question q2_1 = new Question();
        q2_1.setRound(r2);
        q2_1.setTitle("Balanced Bracket Symphony");
        q2_1.setSlug("balanced-bracket-symphony");
        q2_1.setDescription("Given a string containing brackets `()[]{}` and alphanumeric text, verify if all brackets are properly matched and closed in correct order.\n\nPrint `VALID` or `INVALID`.");
        q2_1.setInputFormat("A single line string S.");
        q2_1.setOutputFormat("Print VALID or INVALID.");
        q2_1.setConstraints("1 <= len(S) <= 10^5");
        q2_1.setExamples("Input: {a+[b*(c+d)]}\nOutput: VALID\n\nInput: ([)]\nOutput: INVALID");
        q2_1.setStarterCode("import sys\n\ndef solve():\n    s = sys.stdin.read().strip()\n    # TODO: Validate brackets\n    print(\"VALID\")\n\nif __name__ == '__main__':\n    solve()\n");
        q2_1.setDifficulty("EASY");
        q2_1.setPoints(100);
        q2_1.setOrderIndex(1);

        Question q2_2 = new Question();
        q2_2.setRound(r2);
        q2_2.setTitle("Optimal Network Hub Placement");
        q2_2.setSlug("optimal-network-hub-placement");
        q2_2.setDescription("Gnanamani College campus has N departments located along a 1D grid. You need to choose a central server hub position that minimizes the sum of Manhattan distances to all departments.\n\nOutput the minimum total distance.");
        q2_2.setInputFormat("First line contains integer N.\nSecond line contains N space-separated integers representing coordinates.");
        q2_2.setOutputFormat("Print single integer representing minimum total distance.");
        q2_2.setConstraints("1 <= N <= 10^5\n-10^9 <= coordinate <= 10^9");
        q2_2.setExamples("Input:\n5\n1 2 3 4 5\nOutput:\n6\nExplanation: Placing hub at position 3 gives |1-3| + |2-3| + |3-3| + |4-3| + |5-3| = 2 + 1 + 0 + 1 + 2 = 6.");
        q2_2.setStarterCode("import sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    coords = list(map(int, lines[1:n+1]))\n    coords.sort()\n    median = coords[n // 2]\n    ans = sum(abs(x - median) for x in coords)\n    print(ans)\n\nif __name__ == '__main__':\n    solve()\n");
        q2_2.setDifficulty("MEDIUM");
        q2_2.setPoints(150);
        q2_2.setOrderIndex(2);

        questionRepository.saveAll(List.of(q2_1, q2_2));
        testCaseRepository.save(new TestCase(q2_1, "{a+[b*(c+d)]}\n", "VALID", false, 1));
        testCaseRepository.save(new TestCase(q2_1, "([)]\n", "INVALID", false, 2));
        testCaseRepository.save(new TestCase(q2_1, "(((())))\n", "VALID", true, 3));
        testCaseRepository.save(new TestCase(q2_1, "][\n", "INVALID", true, 4));

        testCaseRepository.save(new TestCase(q2_2, "5\n1 2 3 4 5\n", "6", false, 1));
        testCaseRepository.save(new TestCase(q2_2, "4\n1 10 2 9\n", "16", false, 2));
        testCaseRepository.save(new TestCase(q2_2, "1\n42\n", "0", true, 3));

        // 6. Seed Questions for Round 3 (Java)
        Question q3_1 = new Question();
        q3_1.setRound(r3);
        q3_1.setTitle("Enterprise Stream Deduplicator");
        q3_1.setSlug("enterprise-stream-deduplicator");
        q3_1.setDescription("Build a stream processor that reads a list of transaction IDs and prints only the unique elements in decreasing order of their occurrence frequency. In case of frequency ties, smaller ID appears first.");
        q3_1.setInputFormat("First line contains integer N.\nSecond line contains N space-separated integers.");
        q3_1.setOutputFormat("Print space-separated distinct integers ordered by frequency desc, then value asc.");
        q3_1.setConstraints("1 <= N <= 10^5\n1 <= ID <= 10^9");
        q3_1.setExamples("Input:\n6\n4 5 6 5 4 3\nOutput:\n4 5 3 6\nExplanation: 4 and 5 both appear 2 times (tie-breaker: 4 < 5). 3 and 6 appear 1 time (tie-breaker: 3 < 6).");
        q3_1.setStarterCode("import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        // TODO: Frequency sort with tie-breaker\n    }\n}\n");
        q3_1.setDifficulty("MEDIUM");
        q3_1.setPoints(150);
        q3_1.setOrderIndex(1);
        questionRepository.save(q3_1);

        testCaseRepository.save(new TestCase(q3_1, "6\n4 5 6 5 4 3\n", "4 5 3 6", false, 1));
        testCaseRepository.save(new TestCase(q3_1, "5\n1 2 3 4 5\n", "1 2 3 4 5", false, 2));
        testCaseRepository.save(new TestCase(q3_1, "4\n9 9 9 9\n", "9", true, 3));

        // 7. Seed Participants
        User u1 = new User("karthik@gct.ac.in", passwordEncoder.encode("Karthik@2026"), "Karthikeyan S", Role.ROLE_PARTICIPANT);
        User u2 = new User("sneha@gct.ac.in", passwordEncoder.encode("Sneha@2026"), "Sneha Ramachandran", Role.ROLE_PARTICIPANT);
        User u3 = new User("rahul@gct.ac.in", passwordEncoder.encode("Rahul@2026"), "Rahul Vignesh M", Role.ROLE_PARTICIPANT);
        User u4 = new User("ananya@gct.ac.in", passwordEncoder.encode("Ananya@2026"), "Ananya Venkataraman", Role.ROLE_PARTICIPANT);
        User u5 = new User("dinesh@gct.ac.in", passwordEncoder.encode("Dinesh@2026"), "Dinesh Kumar P", Role.ROLE_PARTICIPANT);
        userRepository.saveAll(List.of(u1, u2, u3, u4, u5));

        Participant p1 = new Participant(u1, "9876543210", "Gnanamani College of Technology", "Computer Science & Engineering", "3rd Year", "Advanced");
        p1.setTotalScore(250);

        Participant p2 = new Participant(u2, "9876543211", "Gnanamani College of Technology", "Information Technology", "2nd Year", "Intermediate");
        p2.setTotalScore(200);

        Participant p3 = new Participant(u3, "9876543212", "Gnanamani College of Technology", "Artificial Intelligence & Data Science", "Final Year", "Advanced");
        p3.setTotalScore(180);

        Participant p4 = new Participant(u4, "9876543213", "Gnanamani College of Technology", "Computer Science & Engineering", "1st Year", "Intermediate");
        p4.setTotalScore(100);

        Participant p5 = new Participant(u5, "9876543214", "Gnanamani College of Technology", "ECE", "2nd Year", "Beginner");
        p5.setTotalScore(50);

        participantRepository.saveAll(List.of(p1, p2, p3, p4, p5));

        // 8. Seed Announcements
        announcementRepository.save(new Announcement(
                "Welcome to Code-a-thon 2026!",
                "Greetings from Gnanamani College of Technology! Round 01 (C Programming - The Foundation) is now LIVE! Verify your connections and review the problem statements.",
                "ROUND",
                r1.getId(),
                "admin@gct.ac.in"
        ));

        announcementRepository.save(new Announcement(
                "Competition Guidelines & Code Integrity Policy",
                "Ensure that all solutions are written independently. Automated code execution evaluates submissions against hidden test cases. Tab switching and copy-paste are monitored.",
                "GENERAL",
                null,
                "superadmin@gct.ac.in"
        ));

        announcementRepository.save(new Announcement(
                "Round 02 Python Schedule Update",
                "Round 02 (The Logic) is scheduled to unlock immediately following the evaluation window of Round 01. Keep your terminal ready!",
                "SCHEDULE",
                r2.getId(),
                "admin@gct.ac.in"
        ));

        System.out.println("[DataSeeder] Complete database successfully seeded with GCT competition data.");
    }
}
