package com.gnanamani.codeathon.service;

import com.gnanamani.codeathon.domain.*;
import com.gnanamani.codeathon.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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
    private final SubmissionResultRepository submissionResultRepository;
    private final SubmissionRepository submissionRepository;
    private final ParticipantQuestionLockRepository lockRepository;
    private final CompetitionSessionRepository sessionRepository;
    private final IntegrityEventRepository eventRepository;

    public DataSeeder(
            UserRepository userRepository,
            ParticipantRepository participantRepository,
            RoundRepository roundRepository,
            QuestionRepository questionRepository,
            TestCaseRepository testCaseRepository,
            AnnouncementRepository announcementRepository,
            CompetitionConfigRepository configRepository,
            PasswordEncoder passwordEncoder,
            SubmissionResultRepository submissionResultRepository,
            SubmissionRepository submissionRepository,
            ParticipantQuestionLockRepository lockRepository,
            CompetitionSessionRepository sessionRepository,
            IntegrityEventRepository eventRepository) {
        this.userRepository = userRepository;
        this.participantRepository = participantRepository;
        this.roundRepository = roundRepository;
        this.questionRepository = questionRepository;
        this.testCaseRepository = testCaseRepository;
        this.announcementRepository = announcementRepository;
        this.configRepository = configRepository;
        this.passwordEncoder = passwordEncoder;
        this.submissionResultRepository = submissionResultRepository;
        this.submissionRepository = submissionRepository;
        this.lockRepository = lockRepository;
        this.sessionRepository = sessionRepository;
        this.eventRepository = eventRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Seed Configs if not present
        if (configRepository.count() == 0) {
            configRepository.save(new CompetitionConfig("leaderboard.frozen", "false"));
            configRepository.save(new CompetitionConfig("results.published", "false"));
            configRepository.save(new CompetitionConfig("event.date", "2026-03-28T09:00:00"));
        }

        // 2. Upsert Admin: admin@gct.org.in / Gnyan@codingclub.com
        String adminEmail = "admin@gct.org.in";
        String adminPass = System.getenv().getOrDefault("ADMIN_PASSWORD", "Gnyan@codingclub.com");
        User admin = userRepository.findByEmail(adminEmail)
                .orElseGet(() -> new User(adminEmail, "", "GCT Admin", Role.ROLE_ADMIN));
        admin.setPasswordHash(passwordEncoder.encode(adminPass));
        admin.setFullName("GCT Admin");
        admin.setRole(Role.ROLE_ADMIN);
        userRepository.save(admin);

        // 3. Upsert Judges: judge1@gct.org.in, judge2@gct.org.in, judge3@gct.org.in / Judge@codingclub.com
        String judgePass = System.getenv().getOrDefault("JUDGE_PASSWORD", "Judge@codingclub.com");
        String[] judgeEmails = {"judge1@gct.org.in", "judge2@gct.org.in", "judge3@gct.org.in"};
        for (int i = 0; i < judgeEmails.length; i++) {
            String email = judgeEmails[i];
            int judgeIndex = i + 1;
            User judge = userRepository.findByEmail(email)
                    .orElseGet(() -> new User(email, "", "GCT Judge " + judgeIndex, Role.ROLE_JUDGE));
            judge.setPasswordHash(passwordEncoder.encode(judgePass));
            judge.setFullName("GCT Judge " + judgeIndex);
            judge.setRole(Role.ROLE_JUDGE);
            userRepository.save(judge);
        }

        // 4. Ensure Rounds exist
        Round r1 = roundRepository.findByRoundNumber(1).orElseGet(() -> {
            Round r = new Round(1, "Round 01 — C", "The Foundation", "C",
                    "Master the basics. Build your logic. Solve memory, arithmetic, and loop puzzles with precision.", 45);
            r.setStatus("LIVE");
            r.setIsLocked(false);
            r.setStartTime(LocalDateTime.now().minusMinutes(10));
            r.setEndTime(LocalDateTime.now().plusMinutes(50));
            return roundRepository.save(r);
        });

        Round r2 = roundRepository.findByRoundNumber(2).orElseGet(() -> {
            Round r = new Round(2, "Round 02 — Java", "The Logic", "JAVA",
                    "Master basic Java syntax, conditions, loops, and arithmetic logic.", 45);
            r.setStatus("SCHEDULED");
            r.setIsLocked(true);
            return roundRepository.save(r);
        });
        r2.setTitle("Round 02 — Java");
        r2.setSubtitle("The Logic");
        r2.setLanguage("JAVA");
        r2.setDescription("Master basic Java syntax, conditions, loops, and arithmetic logic.");
        r2 = roundRepository.save(r2);

        Round r3 = roundRepository.findByRoundNumber(3).orElseGet(() -> {
            Round r = new Round(3, "Round 03 — Python", "The Master", "PYTHON",
                    "Master Python conditionals, while loops, mathematical algorithms, and reversal.", 60);
            r.setStatus("SCHEDULED");
            r.setIsLocked(true);
            return roundRepository.save(r);
        });
        r3.setTitle("Round 03 — Python");
        r3.setSubtitle("The Master");
        r3.setLanguage("PYTHON");
        r3.setDescription("Master Python conditionals, while loops, mathematical algorithms, and reversal.");
        r3 = roundRepository.save(r3);

        // 5. Seed Questions if empty
        if (questionRepository.count() == 0) {
            seedRound1CQuestions(r1);
            seedRound2JavaQuestions(r2);
            seedRound3PythonQuestions(r3);
            System.out.println("[DataSeeder] Initial 5 questions per round seeded.");
        }

        // 6. Synchronize Round 2 (Java) & Round 3 (Python) with docx questions
        syncRound2AndRound3Questions(r2, r3);

        // 7. Seed Announcements if not present
        if (announcementRepository.count() == 0) {
            announcementRepository.save(new Announcement(
                    "Welcome to Code-a-thon 2026!",
                    "Greetings from Gnanamani College of Technology! Round 01 (C Programming - The Foundation) is now LIVE! Verify your connections and review the problem statements.",
                    "ROUND",
                    r1.getId(),
                    "admin@gct.org.in"
            ));

            announcementRepository.save(new Announcement(
                    "Competition Guidelines & Code Integrity Policy",
                    "Ensure that all solutions are written independently. Automated code execution evaluates submissions against hidden test cases. Tab switching and exiting fullscreen are strictly monitored.",
                    "GENERAL",
                    null,
                    "admin@gct.org.in"
            ));

            announcementRepository.save(new Announcement(
                    "Round 02 Java Schedule Update",
                    "Round 02 (The Logic) is scheduled to unlock immediately following the evaluation window of Round 01. Keep your terminal ready!",
                    "SCHEDULE",
                    r2.getId(),
                    "admin@gct.org.in"
            ));
        }

        // 8. Clean any formatted string artifacts
        cleanSeededQuestionData();
    }

    private void syncRound2AndRound3Questions(Round r2, Round r3) {
        List<Question> r2Questions = questionRepository.findByRoundOrderByOrderIndexAsc(r2);
        boolean r2NeedsSync = r2Questions.isEmpty() || !r2Questions.get(0).getSlug().equals("even-or-odd");

        List<Question> r3Questions = questionRepository.findByRoundOrderByOrderIndexAsc(r3);
        boolean r3NeedsSync = r3Questions.isEmpty() || !r3Questions.get(0).getSlug().equals("positive-negative-or-zero");

        if (r2NeedsSync) {
            for (Question q : r2Questions) {
                List<TestCase> tcs = testCaseRepository.findByQuestionOrderByOrderIndexAsc(q);
                testCaseRepository.deleteAll(tcs);
            }
            questionRepository.deleteAll(r2Questions);
            seedRound2JavaQuestions(r2);
            System.out.println("[DataSeeder] Synchronized Round 2 Java questions from latest document.");
        }

        if (r3NeedsSync) {
            for (Question q : r3Questions) {
                List<TestCase> tcs = testCaseRepository.findByQuestionOrderByOrderIndexAsc(q);
                testCaseRepository.deleteAll(tcs);
            }
            questionRepository.deleteAll(r3Questions);
            seedRound3PythonQuestions(r3);
            System.out.println("[DataSeeder] Synchronized Round 3 Python questions from latest document.");
        }
    }

    private void seedRound1CQuestions(Round r1) {
        Question q1_1 = new Question();
        q1_1.setRound(r1);
        q1_1.setTitle("Even or Odd Number");
        q1_1.setSlug("even-or-odd-number");
        q1_1.setDescription("Given an integer n, determine whether it is even or odd.\n\nPrint `1` if the number is even and `0` if the number is odd.");
        q1_1.setInputFormat("A single integer n on standard input.");
        q1_1.setOutputFormat("Print 1 if n is even, or 0 if n is odd.");
        q1_1.setConstraints("-10^6 <= n <= 10^6");
        q1_1.setExamples("Input: 8\nOutput: 1\n\nInput: 7\nOutput: 0");
        q1_1.setStarterCode("#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    // Write your code here\n    return 0;\n}\n");
        q1_1.setDifficulty("EASY");
        q1_1.setPoints(100);
        q1_1.setTimeLimitMs(2000);
        q1_1.setMemoryLimitMb(128);
        q1_1.setIsEnabled(true);
        q1_1.setOrderIndex(1);
        q1_1 = questionRepository.save(q1_1);

        testCaseRepository.save(new TestCase(q1_1, "8\n", "1", false, 1));
        testCaseRepository.save(new TestCase(q1_1, "7\n", "0", false, 2));
        testCaseRepository.save(new TestCase(q1_1, "0\n", "1", true, 3));
        testCaseRepository.save(new TestCase(q1_1, "-4\n", "1", true, 4));
        testCaseRepository.save(new TestCase(q1_1, "-9\n", "0", true, 5));
        testCaseRepository.save(new TestCase(q1_1, "1000000\n", "1", true, 6));

        Question q1_2 = new Question();
        q1_2.setRound(r1);
        q1_2.setTitle("Find the Largest of Three Numbers");
        q1_2.setSlug("largest-of-three-numbers");
        q1_2.setDescription("Given three integers a, b, and c, determine and print the largest number.");
        q1_2.setInputFormat("Three space-separated integers a, b, and c on standard input.");
        q1_2.setOutputFormat("Print the largest integer on a single line.");
        q1_2.setConstraints("-10^4 <= a, b, c <= 10^4");
        q1_2.setExamples("Input: 10 25 15\nOutput: 25\n\nInput: 8 8 3\nOutput: 8");
        q1_2.setStarterCode("#include <stdio.h>\n\nint main() {\n    int a, b, c;\n    if (scanf(\"%d %d %d\", &a, &b, &c) != 3) return 0;\n    // Write your code here\n    return 0;\n}\n");
        q1_2.setDifficulty("EASY");
        q1_2.setPoints(100);
        q1_2.setTimeLimitMs(2000);
        q1_2.setMemoryLimitMb(128);
        q1_2.setIsEnabled(true);
        q1_2.setOrderIndex(2);
        q1_2 = questionRepository.save(q1_2);

        testCaseRepository.save(new TestCase(q1_2, "10 25 15\n", "25", false, 1));
        testCaseRepository.save(new TestCase(q1_2, "8 8 3\n", "8", false, 2));
        testCaseRepository.save(new TestCase(q1_2, "-10 -5 -20\n", "-5", true, 3));
        testCaseRepository.save(new TestCase(q1_2, "42 42 42\n", "42", true, 4));
        testCaseRepository.save(new TestCase(q1_2, "100 200 500\n", "500", true, 5));
        testCaseRepository.save(new TestCase(q1_2, "999 50 10\n", "999", true, 6));

        Question q1_3 = new Question();
        q1_3.setRound(r1);
        q1_3.setTitle("Sum of Digits");
        q1_3.setSlug("sum-of-digits");
        q1_3.setDescription("Given an integer n, calculate and print the sum of its digits. If n is negative, calculate the sum using its absolute value.");
        q1_3.setInputFormat("A single integer n on standard input.");
        q1_3.setOutputFormat("Print the sum of the digits.");
        q1_3.setConstraints("-10^9 <= n <= 10^9");
        q1_3.setExamples("Input: 1234\nOutput: 10\nExplanation: 1 + 2 + 3 + 4 = 10\n\nInput: -567\nOutput: 18\nExplanation: 5 + 6 + 7 = 18");
        q1_3.setStarterCode("#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    // Write your code here\n    return 0;\n}\n");
        q1_3.setDifficulty("EASY");
        q1_3.setPoints(100);
        q1_3.setTimeLimitMs(2000);
        q1_3.setMemoryLimitMb(128);
        q1_3.setIsEnabled(true);
        q1_3.setOrderIndex(3);
        q1_3 = questionRepository.save(q1_3);

        testCaseRepository.save(new TestCase(q1_3, "1234\n", "10", false, 1));
        testCaseRepository.save(new TestCase(q1_3, "-567\n", "18", false, 2));
        testCaseRepository.save(new TestCase(q1_3, "0\n", "0", true, 3));
        testCaseRepository.save(new TestCase(q1_3, "9\n", "9", true, 4));
        testCaseRepository.save(new TestCase(q1_3, "1000000\n", "1", true, 5));
        testCaseRepository.save(new TestCase(q1_3, "-9999\n", "36", true, 6));

        Question q1_4 = new Question();
        q1_4.setRound(r1);
        q1_4.setTitle("Count Vowels in a String");
        q1_4.setSlug("count-vowels-in-a-string");
        q1_4.setDescription("Given a string s, count the number of vowels (a, e, i, o, u) present in the string. Both uppercase and lowercase vowels must be counted. Non-vowel characters and spaces should be ignored.");
        q1_4.setInputFormat("A single line containing string s on standard input.");
        q1_4.setOutputFormat("Print the total count of vowels.");
        q1_4.setConstraints("1 <= length of s <= 1000\nThe string contains English letters and spaces.");
        q1_4.setExamples("Input: Hello World\nOutput: 3\nExplanation: The vowels are e, o, and o.\n\nInput: EDUCATION\nOutput: 5");
        q1_4.setStarterCode("#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    char s[1005];\n    if (!fgets(s, sizeof(s), stdin)) return 0;\n    // Write your code here\n    return 0;\n}\n");
        q1_4.setDifficulty("EASY");
        q1_4.setPoints(100);
        q1_4.setTimeLimitMs(2000);
        q1_4.setMemoryLimitMb(128);
        q1_4.setIsEnabled(true);
        q1_4.setOrderIndex(4);
        q1_4 = questionRepository.save(q1_4);

        testCaseRepository.save(new TestCase(q1_4, "Hello World\n", "3", false, 1));
        testCaseRepository.save(new TestCase(q1_4, "EDUCATION\n", "5", false, 2));
        testCaseRepository.save(new TestCase(q1_4, "rhythm\n", "0", true, 3));
        testCaseRepository.save(new TestCase(q1_4, "AeIou\n", "5", true, 4));
        testCaseRepository.save(new TestCase(q1_4, "Gnanamani College of Technology\n", "9", true, 5));

        Question q1_5 = new Question();
        q1_5.setRound(r1);
        q1_5.setTitle("Find the Maximum Element Using a Function");
        q1_5.setSlug("find-maximum-element-function");
        q1_5.setDescription("Given an integer array nums containing n elements, find and print the largest element using a user-defined function named `findMax`.\n\nYour solution must define and call `int findMax(int nums[], int n)` to return the maximum value.");
        q1_5.setInputFormat("First line contains integer n.\nSecond line contains n space-separated integers.");
        q1_5.setOutputFormat("Print the maximum element.");
        q1_5.setConstraints("1 <= n <= 1000\n-10^4 <= nums[i] <= 10^4");
        q1_5.setExamples("Input:\n5\n3 7 2 9 4\nOutput: 9\n\nInput:\n4\n-5 -2 -10 -1\nOutput: -1");
        q1_5.setStarterCode("#include <stdio.h>\n\nint findMax(int nums[], int n) {\n    // Write your function here\n    return nums[0];\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int nums[1000];\n    for (int i = 0; i < n; i++) {\n        scanf(\"%d\", &nums[i]);\n    }\n    printf(\"%d\\n\", findMax(nums, n));\n    return 0;\n}\n");
        q1_5.setDifficulty("EASY");
        q1_5.setPoints(100);
        q1_5.setTimeLimitMs(2000);
        q1_5.setMemoryLimitMb(128);
        q1_5.setIsEnabled(true);
        q1_5.setOrderIndex(5);
        q1_5 = questionRepository.save(q1_5);

        testCaseRepository.save(new TestCase(q1_5, "5\n3 7 2 9 4\n", "9", false, 1));
        testCaseRepository.save(new TestCase(q1_5, "4\n-5 -2 -10 -1\n", "-1", false, 2));
        testCaseRepository.save(new TestCase(q1_5, "1\n42\n", "42", true, 3));
        testCaseRepository.save(new TestCase(q1_5, "6\n10 20 30 50 40 50\n", "50", true, 4));
        testCaseRepository.save(new TestCase(q1_5, "5\n-100 -200 -300 -400 -50\n", "-50", true, 5));

    }

    private void seedRound2JavaQuestions(Round r2) {
        Question q2_1 = new Question();
        q2_1.setRound(r2);
        q2_1.setTitle("Even or Odd");
        q2_1.setSlug("even-or-odd");
        q2_1.setDescription("Write a Java program to check whether a given integer is even or odd.\n\nPrint `Even` if the number is even and `Odd` if the number is odd.");
        q2_1.setInputFormat("A single integer n on standard input.");
        q2_1.setOutputFormat("Print `Even` or `Odd` on a single line.");
        q2_1.setConstraints("-10^6 <= n <= 10^6");
        q2_1.setExamples("Input: 7\nOutput: Odd\n\nInput: 4\nOutput: Even");
        q2_1.setStarterCode("import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        // Write your code here\n    }\n}\n");
        q2_1.setDifficulty("EASY");
        q2_1.setPoints(100);
        q2_1.setTimeLimitMs(2000);
        q2_1.setMemoryLimitMb(128);
        q2_1.setIsEnabled(true);
        q2_1.setOrderIndex(1);
        q2_1 = questionRepository.save(q2_1);

        testCaseRepository.save(new TestCase(q2_1, "7\n", "Odd", false, 1));
        testCaseRepository.save(new TestCase(q2_1, "4\n", "Even", false, 2));
        testCaseRepository.save(new TestCase(q2_1, "0\n", "Even", true, 3));
        testCaseRepository.save(new TestCase(q2_1, "-5\n", "Odd", true, 4));
        testCaseRepository.save(new TestCase(q2_1, "-8\n", "Even", true, 5));

        Question q2_2 = new Question();
        q2_2.setRound(r2);
        q2_2.setTitle("Find the Largest of Two Numbers");
        q2_2.setSlug("largest-of-two-numbers");
        q2_2.setDescription("Write a Java program to find the largest of two numbers using if-else.\n\nPrint the output in the format `Largest: <number>`.");
        q2_2.setInputFormat("Two space-separated integers a and b on standard input.");
        q2_2.setOutputFormat("Print `Largest: <number>`.");
        q2_2.setConstraints("-10^6 <= a, b <= 10^6");
        q2_2.setExamples("Input: 15 25\nOutput: Largest: 25\n\nInput: 50 10\nOutput: Largest: 50");
        q2_2.setStarterCode("import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        // Write your code here\n    }\n}\n");
        q2_2.setDifficulty("EASY");
        q2_2.setPoints(100);
        q2_2.setTimeLimitMs(2000);
        q2_2.setMemoryLimitMb(128);
        q2_2.setIsEnabled(true);
        q2_2.setOrderIndex(2);
        q2_2 = questionRepository.save(q2_2);

        testCaseRepository.save(new TestCase(q2_2, "15 25\n", "Largest: 25", false, 1));
        testCaseRepository.save(new TestCase(q2_2, "50 10\n", "Largest: 50", false, 2));
        testCaseRepository.save(new TestCase(q2_2, "42 42\n", "Largest: 42", true, 3));
        testCaseRepository.save(new TestCase(q2_2, "-10 -5\n", "Largest: -5", true, 4));
        testCaseRepository.save(new TestCase(q2_2, "0 100\n", "Largest: 100", true, 5));

        Question q2_3 = new Question();
        q2_3.setRound(r2);
        q2_3.setTitle("Sum of Numbers from 1 to N");
        q2_3.setSlug("sum-of-numbers-1-to-n");
        q2_3.setDescription("Write a Java program to calculate the sum of all numbers from 1 to N using a loop.\n\nPrint the output in the format `Sum: <result>`.");
        q2_3.setInputFormat("A single positive integer N on standard input.");
        q2_3.setOutputFormat("Print `Sum: <result>`.");
        q2_3.setConstraints("1 <= N <= 10000");
        q2_3.setExamples("Input: 5\nOutput: Sum: 15\nExplanation: 1 + 2 + 3 + 4 + 5 = 15");
        q2_3.setStarterCode("import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        // Write your code here\n    }\n}\n");
        q2_3.setDifficulty("EASY");
        q2_3.setPoints(100);
        q2_3.setTimeLimitMs(2000);
        q2_3.setMemoryLimitMb(128);
        q2_3.setIsEnabled(true);
        q2_3.setOrderIndex(3);
        q2_3 = questionRepository.save(q2_3);

        testCaseRepository.save(new TestCase(q2_3, "5\n", "Sum: 15", false, 1));
        testCaseRepository.save(new TestCase(q2_3, "1\n", "Sum: 1", false, 2));
        testCaseRepository.save(new TestCase(q2_3, "10\n", "Sum: 55", true, 3));
        testCaseRepository.save(new TestCase(q2_3, "100\n", "Sum: 5050", true, 4));
        testCaseRepository.save(new TestCase(q2_3, "4\n", "Sum: 10", true, 5));

        Question q2_4 = new Question();
        q2_4.setRound(r2);
        q2_4.setTitle("Multiplication Table");
        q2_4.setSlug("multiplication-table");
        q2_4.setDescription("Write a Java program to print the multiplication table of a given number from 1 to 10.\n\nEach line must follow the exact format: `n x i = <result>` where i ranges from 1 to 10.");
        q2_4.setInputFormat("A single integer n on standard input.");
        q2_4.setOutputFormat("Print 10 lines of the multiplication table.");
        q2_4.setConstraints("1 <= n <= 1000");
        q2_4.setExamples("Input: 3\nOutput:\n3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30");
        q2_4.setStarterCode("import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        // Write your code here\n    }\n}\n");
        q2_4.setDifficulty("EASY");
        q2_4.setPoints(100);
        q2_4.setTimeLimitMs(2000);
        q2_4.setMemoryLimitMb(128);
        q2_4.setIsEnabled(true);
        q2_4.setOrderIndex(4);
        q2_4 = questionRepository.save(q2_4);

        testCaseRepository.save(new TestCase(q2_4, "3\n", "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30", false, 1));
        testCaseRepository.save(new TestCase(q2_4, "5\n", "5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50", false, 2));
        testCaseRepository.save(new TestCase(q2_4, "1\n", "1 x 1 = 1\n1 x 2 = 2\n1 x 3 = 3\n1 x 4 = 4\n1 x 5 = 5\n1 x 6 = 6\n1 x 7 = 7\n1 x 8 = 8\n1 x 9 = 9\n1 x 10 = 10", true, 3));

        Question q2_5 = new Question();
        q2_5.setRound(r2);
        q2_5.setTitle("Count Digits");
        q2_5.setSlug("count-digits");
        q2_5.setDescription("Write a Java program to count the number of digits in a positive integer using a while loop.\n\nPrint the output in the format `Digits: <count>`.");
        q2_5.setInputFormat("A single positive integer n on standard input.");
        q2_5.setOutputFormat("Print `Digits: <count>`.");
        q2_5.setConstraints("1 <= n <= 2 * 10^9");
        q2_5.setExamples("Input: 12345\nOutput: Digits: 5\n\nInput: 7\nOutput: Digits: 1");
        q2_5.setStarterCode("import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextLong()) return;\n        long n = sc.nextLong();\n        // Write your code here\n    }\n}\n");
        q2_5.setDifficulty("EASY");
        q2_5.setPoints(100);
        q2_5.setTimeLimitMs(2000);
        q2_5.setMemoryLimitMb(128);
        q2_5.setIsEnabled(true);
        q2_5.setOrderIndex(5);
        q2_5 = questionRepository.save(q2_5);

        testCaseRepository.save(new TestCase(q2_5, "12345\n", "Digits: 5", false, 1));
        testCaseRepository.save(new TestCase(q2_5, "7\n", "Digits: 1", false, 2));
        testCaseRepository.save(new TestCase(q2_5, "1000\n", "Digits: 4", true, 3));
        testCaseRepository.save(new TestCase(q2_5, "987654321\n", "Digits: 9", true, 4));
        testCaseRepository.save(new TestCase(q2_5, "42\n", "Digits: 2", true, 5));

    }

    private void seedRound3PythonQuestions(Round r3) {
        Question q3_1 = new Question();
        q3_1.setRound(r3);
        q3_1.setTitle("Positive, Negative, or Zero");
        q3_1.setSlug("positive-negative-or-zero");
        q3_1.setDescription("Write a Python program to check whether a number is positive, negative, or zero.\n\nPrint `Positive`, `Negative`, or `Zero` on a single line.");
        q3_1.setInputFormat("A single integer n on standard input.");
        q3_1.setOutputFormat("Print `Positive`, `Negative`, or `Zero`.");
        q3_1.setConstraints("-10^9 <= n <= 10^9");
        q3_1.setExamples("Input: -5\nOutput: Negative\n\nInput: 10\nOutput: Positive\n\nInput: 0\nOutput: Zero");
        q3_1.setStarterCode("import sys\n\nif __name__ == '__main__':\n    raw = sys.stdin.read().strip()\n    if raw:\n        n = int(raw)\n        # Write your code here\n");
        q3_1.setDifficulty("EASY");
        q3_1.setPoints(100);
        q3_1.setTimeLimitMs(2000);
        q3_1.setMemoryLimitMb(128);
        q3_1.setIsEnabled(true);
        q3_1.setOrderIndex(1);
        q3_1 = questionRepository.save(q3_1);

        testCaseRepository.save(new TestCase(q3_1, "-5\n", "Negative", false, 1));
        testCaseRepository.save(new TestCase(q3_1, "10\n", "Positive", false, 2));
        testCaseRepository.save(new TestCase(q3_1, "0\n", "Zero", true, 3));
        testCaseRepository.save(new TestCase(q3_1, "-1000\n", "Negative", true, 4));
        testCaseRepository.save(new TestCase(q3_1, "42\n", "Positive", true, 5));

        Question q3_2 = new Question();
        q3_2.setRound(r3);
        q3_2.setTitle("Largest of Three Numbers");
        q3_2.setSlug("largest-of-three-numbers-py");
        q3_2.setDescription("Write a Python program to find the largest of three numbers using if-elif-else.\n\nPrint the output in the format `Largest: <number>`.");
        q3_2.setInputFormat("Three numbers on standard input (comma or space separated).");
        q3_2.setOutputFormat("Print `Largest: <number>`.");
        q3_2.setConstraints("-10^6 <= a, b, c <= 10^6");
        q3_2.setExamples("Input: 10, 25, 18\nOutput: Largest: 25\n\nInput: 50 10 30\nOutput: Largest: 50");
        q3_2.setStarterCode("import sys\n\nif __name__ == '__main__':\n    raw = sys.stdin.read().strip()\n    if raw:\n        parts = raw.replace(',', ' ').split()\n        a, b, c = int(parts[0]), int(parts[1]), int(parts[2])\n        # Write your code here\n");
        q3_2.setDifficulty("EASY");
        q3_2.setPoints(100);
        q3_2.setTimeLimitMs(2000);
        q3_2.setMemoryLimitMb(128);
        q3_2.setIsEnabled(true);
        q3_2.setOrderIndex(2);
        q3_2 = questionRepository.save(q3_2);

        testCaseRepository.save(new TestCase(q3_2, "10, 25, 18\n", "Largest: 25", false, 1));
        testCaseRepository.save(new TestCase(q3_2, "50 10 30\n", "Largest: 50", false, 2));
        testCaseRepository.save(new TestCase(q3_2, "7 9 20\n", "Largest: 20", true, 3));
        testCaseRepository.save(new TestCase(q3_2, "42 42 42\n", "Largest: 42", true, 4));
        testCaseRepository.save(new TestCase(q3_2, "-5, -2, -10\n", "Largest: -2", true, 5));

        Question q3_3 = new Question();
        q3_3.setRound(r3);
        q3_3.setTitle("Sum of Even Numbers");
        q3_3.setSlug("sum-of-even-numbers");
        q3_3.setDescription("Write a Python program to calculate the sum of all even numbers from 1 to N using a loop.\n\nPrint the output in the format `Sum: <result>`.");
        q3_3.setInputFormat("A single positive integer N on standard input.");
        q3_3.setOutputFormat("Print `Sum: <result>`.");
        q3_3.setConstraints("1 <= N <= 10000");
        q3_3.setExamples("Input: 10\nOutput: Sum: 30\nExplanation: 2 + 4 + 6 + 8 + 10 = 30");
        q3_3.setStarterCode("import sys\n\nif __name__ == '__main__':\n    raw = sys.stdin.read().strip()\n    if raw:\n        n = int(raw)\n        # Write your code here\n");
        q3_3.setDifficulty("EASY");
        q3_3.setPoints(100);
        q3_3.setTimeLimitMs(2000);
        q3_3.setMemoryLimitMb(128);
        q3_3.setIsEnabled(true);
        q3_3.setOrderIndex(3);
        q3_3 = questionRepository.save(q3_3);

        testCaseRepository.save(new TestCase(q3_3, "10\n", "Sum: 30", false, 1));
        testCaseRepository.save(new TestCase(q3_3, "6\n", "Sum: 12", false, 2));
        testCaseRepository.save(new TestCase(q3_3, "1\n", "Sum: 0", true, 3));
        testCaseRepository.save(new TestCase(q3_3, "2\n", "Sum: 2", true, 4));
        testCaseRepository.save(new TestCase(q3_3, "20\n", "Sum: 110", true, 5));

        Question q3_4 = new Question();
        q3_4.setRound(r3);
        q3_4.setTitle("Reverse a Number");
        q3_4.setSlug("reverse-a-number");
        q3_4.setDescription("Write a Python program to reverse a positive integer using a while loop and the modulus operator.\n\nPrint the output in the format `Reverse: <reversed_number>`.");
        q3_4.setInputFormat("A single positive integer n on standard input.");
        q3_4.setOutputFormat("Print `Reverse: <reversed_number>`.");
        q3_4.setConstraints("1 <= n <= 10^9");
        q3_4.setExamples("Input: 1234\nOutput: Reverse: 4321\n\nInput: 5\nOutput: Reverse: 5");
        q3_4.setStarterCode("import sys\n\nif __name__ == '__main__':\n    raw = sys.stdin.read().strip()\n    if raw:\n        n = int(raw)\n        # Write your code here using while loop and % operator\n");
        q3_4.setDifficulty("EASY");
        q3_4.setPoints(100);
        q3_4.setTimeLimitMs(2000);
        q3_4.setMemoryLimitMb(128);
        q3_4.setIsEnabled(true);
        q3_4.setOrderIndex(4);
        q3_4 = questionRepository.save(q3_4);

        testCaseRepository.save(new TestCase(q3_4, "1234\n", "Reverse: 4321", false, 1));
        testCaseRepository.save(new TestCase(q3_4, "5\n", "Reverse: 5", false, 2));
        testCaseRepository.save(new TestCase(q3_4, "1000\n", "Reverse: 1", true, 3));
        testCaseRepository.save(new TestCase(q3_4, "98765\n", "Reverse: 56789", true, 4));
        testCaseRepository.save(new TestCase(q3_4, "402\n", "Reverse: 204", true, 5));

        Question q3_5 = new Question();
        q3_5.setRound(r3);
        q3_5.setTitle("Factorial of a Number");
        q3_5.setSlug("factorial-of-a-number");
        q3_5.setDescription("Write a Python program to calculate the factorial of a non-negative integer using a loop.\n\nPrint the output in the format `Factorial: <result>`.");
        q3_5.setInputFormat("A single integer n on standard input.");
        q3_5.setOutputFormat("Print `Factorial: <result>`.");
        q3_5.setConstraints("0 <= n <= 20");
        q3_5.setExamples("Input: 5\nOutput: Factorial: 120\nExplanation: 5 x 4 x 3 x 2 x 1 = 120\n\nInput: 0\nOutput: Factorial: 1");
        q3_5.setStarterCode("import sys\n\nif __name__ == '__main__':\n    raw = sys.stdin.read().strip()\n    if raw:\n        n = int(raw)\n        # Write your code here using a loop\n");
        q3_5.setDifficulty("EASY");
        q3_5.setPoints(100);
        q3_5.setTimeLimitMs(2000);
        q3_5.setMemoryLimitMb(128);
        q3_5.setIsEnabled(true);
        q3_5.setOrderIndex(5);
        q3_5 = questionRepository.save(q3_5);

        testCaseRepository.save(new TestCase(q3_5, "5\n", "Factorial: 120", false, 1));
        testCaseRepository.save(new TestCase(q3_5, "0\n", "Factorial: 1", false, 2));
        testCaseRepository.save(new TestCase(q3_5, "1\n", "Factorial: 1", true, 3));
        testCaseRepository.save(new TestCase(q3_5, "4\n", "Factorial: 24", true, 4));
        testCaseRepository.save(new TestCase(q3_5, "6\n", "Factorial: 720", true, 5));

    }

    private void cleanSeededQuestionData() {
        List<Question> questions = questionRepository.findAll();
        for (Question q : questions) {
            boolean updated = false;
            if (q.getDescription() != null && (q.getDescription().contains("\\n") || q.getDescription().contains("$"))) {
                q.setDescription(q.getDescription()
                        .replace("\\n", "\n")
                        .replace("$", ""));
                updated = true;
            }
            if (q.getInputFormat() != null && q.getInputFormat().contains("\\n")) {
                q.setInputFormat(q.getInputFormat().replace("\\n", "\n"));
                updated = true;
            }
            if (q.getOutputFormat() != null && q.getOutputFormat().contains("\\n")) {
                q.setOutputFormat(q.getOutputFormat().replace("\\n", "\n"));
                updated = true;
            }
            if (q.getConstraints() != null && q.getConstraints().contains("\\n")) {
                q.setConstraints(q.getConstraints().replace("\\n", "\n"));
                updated = true;
            }
            if (q.getExamples() != null && q.getExamples().contains("\\n")) {
                q.setExamples(q.getExamples().replace("\\n", "\n"));
                updated = true;
            }
            if (updated) {
                questionRepository.save(q);
            }
        }

        List<TestCase> testCases = testCaseRepository.findAll();
        for (TestCase tc : testCases) {
            boolean updated = false;
            if (tc.getInputData() != null && tc.getInputData().contains("\\n")) {
                tc.setInputData(tc.getInputData().replace("\\n", "\n"));
                updated = true;
            }
            if (tc.getExpectedOutput() != null && tc.getExpectedOutput().contains("\\n")) {
                tc.setExpectedOutput(tc.getExpectedOutput().replace("\\n", "\n"));
                updated = true;
            }
            if (updated) {
                testCaseRepository.save(tc);
            }
        }
    }
}
