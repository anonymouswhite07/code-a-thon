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

        // 2. Seed Admin & Judges if not present
        if (userRepository.count() == 0) {
            String superAdminPass = System.getenv().getOrDefault("SUPER_ADMIN_PASSWORD", "Super@2026");
            String adminPass = System.getenv().getOrDefault("ADMIN_PASSWORD", "Admin@2026");
            String judgePass = System.getenv().getOrDefault("JUDGE_PASSWORD", "Judge@2026");

            User superAdmin = new User("superadmin@gct.ac.in", passwordEncoder.encode(superAdminPass), "Dr. K. Arulmurugan (Principal)", Role.ROLE_SUPER_ADMIN);
            User admin = new User("admin@gct.ac.in", passwordEncoder.encode(adminPass), "Prof. S. Gnanasambandan (HOD CSE)", Role.ROLE_ADMIN);
            User judge = new User("judge@gct.ac.in", passwordEncoder.encode(judgePass), "Dr. R. Priyadharshini (Lead Judge)", Role.ROLE_JUDGE);
            userRepository.saveAll(List.of(superAdmin, admin, judge));

            // Seed initial student participants
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
        }

        // 3. Ensure Rounds exist
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
            Round r = new Round(2, "Round 02 — Python", "The Logic", "PYTHON",
                    "Think smarter, solve faster. Tackle string processing, lists, frequency counting, and algorithms.", 45);
            r.setStatus("SCHEDULED");
            r.setIsLocked(true);
            return roundRepository.save(r);
        });

        Round r3 = roundRepository.findByRoundNumber(3).orElseGet(() -> {
            Round r = new Round(3, "Round 03 — Java", "The Master", "JAVA",
                    "Apply structured OOP logic, arrays, and standard algorithms to conquer the competition podium.", 60);
            r.setStatus("SCHEDULED");
            r.setIsLocked(true);
            return roundRepository.save(r);
        });

        // 4. Remove previous questions and related dependencies
        eventRepository.deleteAll();
        sessionRepository.deleteAll();
        submissionResultRepository.deleteAll();
        submissionRepository.deleteAll();
        lockRepository.deleteAll();
        testCaseRepository.deleteAll();
        questionRepository.deleteAll();

        // =========================================================================
        // 5. ROUND 1 — 5 SIMPLE C QUESTIONS
        // =========================================================================

        // Q1.1: Sum of First N Natural Numbers
        Question q1_1 = new Question();
        q1_1.setRound(r1);
        q1_1.setTitle("Sum of First N Natural Numbers");
        q1_1.setSlug("sum-of-natural-numbers");
        q1_1.setDescription("Given a positive integer $N$, compute and print the sum of all integers from 1 up to $N$ ($1 + 2 + \\dots + N$).");
        q1_1.setInputFormat("A single positive integer N on standard input.");
        q1_1.setOutputFormat("Print the sum on a single line.");
        q1_1.setConstraints("1 <= N <= 10^5");
        q1_1.setExamples("Input: 5\nOutput: 15\nExplanation: 1 + 2 + 3 + 4 + 5 = 15.");
        q1_1.setStarterCode("#include <stdio.h>\n\nint main() {\n    long long n;\n    if (scanf(\"%lld\", &n) != 1) return 0;\n    // TODO: Compute and print sum from 1 to n\n    return 0;\n}\n");
        q1_1.setDifficulty("EASY");
        q1_1.setPoints(100);
        q1_1.setOrderIndex(1);
        q1_1 = questionRepository.save(q1_1);

        testCaseRepository.save(new TestCase(q1_1, "5\n", "15", false, 1));
        testCaseRepository.save(new TestCase(q1_1, "10\n", "55", false, 2));
        testCaseRepository.save(new TestCase(q1_1, "100\n", "5050", true, 3));
        testCaseRepository.save(new TestCase(q1_1, "1\n", "1", true, 4));

        // Q1.2: Even or Odd Counter
        Question q1_2 = new Question();
        q1_2.setRound(r1);
        q1_2.setTitle("Even and Odd Numbers Counter");
        q1_2.setSlug("even-odd-counter");
        q1_2.setDescription("Given an array of $N$ integers, count how many numbers are even and how many are odd.\n\nPrint the output in the format: `Even: X Odd: Y`.");
        q1_2.setInputFormat("First line contains integer N.\nSecond line contains N space-separated integers.");
        q1_2.setOutputFormat("Print `Even: <even_count> Odd: <odd_count>` on a single line.");
        q1_2.setConstraints("1 <= N <= 10^4\n-10^9 <= element <= 10^9");
        q1_2.setExamples("Input:\n5\n1 2 3 4 5\nOutput:\nEven: 2 Odd: 3");
        q1_2.setStarterCode("#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    // TODO: Read n integers and count even and odd\n    return 0;\n}\n");
        q1_2.setDifficulty("EASY");
        q1_2.setPoints(100);
        q1_2.setOrderIndex(2);
        q1_2 = questionRepository.save(q1_2);

        testCaseRepository.save(new TestCase(q1_2, "5\n1 2 3 4 5\n", "Even: 2 Odd: 3", false, 1));
        testCaseRepository.save(new TestCase(q1_2, "4\n2 4 6 8\n", "Even: 4 Odd: 0", false, 2));
        testCaseRepository.save(new TestCase(q1_2, "3\n7 11 13\n", "Even: 0 Odd: 3", true, 3));

        // Q1.3: Reverse an Integer
        Question q1_3 = new Question();
        q1_3.setRound(r1);
        q1_3.setTitle("Reverse an Integer");
        q1_3.setSlug("reverse-an-integer");
        q1_3.setDescription("Given a positive integer $N$, reverse its digits and print the resulting number without leading zeros.");
        q1_3.setInputFormat("A single positive integer N.");
        q1_3.setOutputFormat("Print the reversed integer.");
        q1_3.setConstraints("1 <= N <= 10^9");
        q1_3.setExamples("Input: 12345\nOutput: 54321\n\nInput: 1020\nOutput: 201");
        q1_3.setStarterCode("#include <stdio.h>\n\nint main() {\n    long long n;\n    if (scanf(\"%lld\", &n) != 1) return 0;\n    // TODO: Reverse the digits of n\n    return 0;\n}\n");
        q1_3.setDifficulty("EASY");
        q1_3.setPoints(100);
        q1_3.setOrderIndex(3);
        q1_3 = questionRepository.save(q1_3);

        testCaseRepository.save(new TestCase(q1_3, "12345\n", "54321", false, 1));
        testCaseRepository.save(new TestCase(q1_3, "1020\n", "201", false, 2));
        testCaseRepository.save(new TestCase(q1_3, "9\n", "9", true, 3));
        testCaseRepository.save(new TestCase(q1_3, "700\n", "7", true, 4));

        // Q1.4: Find Minimum and Maximum
        Question q1_4 = new Question();
        q1_4.setRound(r1);
        q1_4.setTitle("Find Minimum and Maximum");
        q1_4.setSlug("find-min-max");
        q1_4.setDescription("Given an array of $N$ integers, find and print the minimum and maximum elements in the format: `Min: X Max: Y`.");
        q1_4.setInputFormat("First line contains integer N.\nSecond line contains N space-separated integers.");
        q1_4.setOutputFormat("Print `Min: <min_val> Max: <max_val>` on a single line.");
        q1_4.setConstraints("1 <= N <= 10^4\n-10^9 <= element <= 10^9");
        q1_4.setExamples("Input:\n5\n12 45 2 99 23\nOutput:\nMin: 2 Max: 99");
        q1_4.setStarterCode("#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    // TODO: Find min and max element\n    return 0;\n}\n");
        q1_4.setDifficulty("EASY");
        q1_4.setPoints(100);
        q1_4.setOrderIndex(4);
        q1_4 = questionRepository.save(q1_4);

        testCaseRepository.save(new TestCase(q1_4, "5\n12 45 2 99 23\n", "Min: 2 Max: 99", false, 1));
        testCaseRepository.save(new TestCase(q1_4, "3\n10 10 10\n", "Min: 10 Max: 10", false, 2));
        testCaseRepository.save(new TestCase(q1_4, "4\n-5 0 25 -100\n", "Min: -100 Max: 25", true, 3));

        // Q1.5: Prime Number Checker
        Question q1_5 = new Question();
        q1_5.setRound(r1);
        q1_5.setTitle("Prime Number Checker");
        q1_5.setSlug("prime-number-checker");
        q1_5.setDescription("Given an integer $N$, determine whether it is a prime number. Print `PRIME` if it is a prime, otherwise print `NOT PRIME`.");
        q1_5.setInputFormat("A single integer N.");
        q1_5.setOutputFormat("Print `PRIME` or `NOT PRIME`.");
        q1_5.setConstraints("1 <= N <= 10^7");
        q1_5.setExamples("Input: 7\nOutput: PRIME\n\nInput: 12\nOutput: NOT PRIME");
        q1_5.setStarterCode("#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    // TODO: Determine if n is prime\n    return 0;\n}\n");
        q1_5.setDifficulty("EASY");
        q1_5.setPoints(100);
        q1_5.setOrderIndex(5);
        q1_5 = questionRepository.save(q1_5);

        testCaseRepository.save(new TestCase(q1_5, "7\n", "PRIME", false, 1));
        testCaseRepository.save(new TestCase(q1_5, "12\n", "NOT PRIME", false, 2));
        testCaseRepository.save(new TestCase(q1_5, "1\n", "NOT PRIME", true, 3));
        testCaseRepository.save(new TestCase(q1_5, "29\n", "PRIME", true, 4));

        // =========================================================================
        // 6. ROUND 2 — 5 SIMPLE PYTHON QUESTIONS
        // =========================================================================

        // Q2.1: Palindrome String Checker
        Question q2_1 = new Question();
        q2_1.setRound(r2);
        q2_1.setTitle("Palindrome String Checker");
        q2_1.setSlug("palindrome-string-checker");
        q2_1.setDescription("Given a single word $S$, determine if it reads the same forwards and backwards. Print `YES` if it is a palindrome, otherwise print `NO`.");
        q2_1.setInputFormat("A single line string S.");
        q2_1.setOutputFormat("Print YES or NO.");
        q2_1.setConstraints("1 <= len(S) <= 1000");
        q2_1.setExamples("Input: radar\nOutput: YES\n\nInput: python\nOutput: NO");
        q2_1.setStarterCode("import sys\n\ndef solve():\n    s = sys.stdin.read().strip()\n    # TODO: Print YES if palindrome, else NO\n    if s == s[::-1]:\n        print(\"YES\")\n    else:\n        print(\"NO\")\n\nif __name__ == '__main__':\n    solve()\n");
        q2_1.setDifficulty("EASY");
        q2_1.setPoints(100);
        q2_1.setOrderIndex(1);
        q2_1 = questionRepository.save(q2_1);

        testCaseRepository.save(new TestCase(q2_1, "radar\n", "YES", false, 1));
        testCaseRepository.save(new TestCase(q2_1, "python\n", "NO", false, 2));
        testCaseRepository.save(new TestCase(q2_1, "level\n", "YES", true, 3));
        testCaseRepository.save(new TestCase(q2_1, "a\n", "YES", true, 4));

        // Q2.2: Vowels and Consonants Counter
        Question q2_2 = new Question();
        q2_2.setRound(r2);
        q2_2.setTitle("Vowels and Consonants Counter");
        q2_2.setSlug("vowels-consonants-counter");
        q2_2.setDescription("Given a string $S$, count the total number of vowels (`a, e, i, o, u`, case-insensitive) and consonants (alphabetic letters that are not vowels). Non-alphabetic characters should be ignored.\n\nPrint in format: `Vowels: X Consonants: Y`.");
        q2_2.setInputFormat("A single line string S.");
        q2_2.setOutputFormat("Print `Vowels: <v_count> Consonants: <c_count>`.");
        q2_2.setConstraints("1 <= len(S) <= 10^5");
        q2_2.setExamples("Input: CodeAThon\nOutput: Vowels: 4 Consonants: 5");
        q2_2.setStarterCode("import sys\n\ndef solve():\n    s = sys.stdin.read().strip()\n    # TODO: Count vowels and consonants\n\nif __name__ == '__main__':\n    solve()\n");
        q2_2.setDifficulty("EASY");
        q2_2.setPoints(100);
        q2_2.setOrderIndex(2);
        q2_2 = questionRepository.save(q2_2);

        testCaseRepository.save(new TestCase(q2_2, "CodeAThon\n", "Vowels: 4 Consonants: 5", false, 1));
        testCaseRepository.save(new TestCase(q2_2, "Hello World!\n", "Vowels: 3 Consonants: 7", false, 2));
        testCaseRepository.save(new TestCase(q2_2, "aeiou\n", "Vowels: 5 Consonants: 0", true, 3));

        // Q2.3: Word Frequency Counter
        Question q2_3 = new Question();
        q2_3.setRound(r2);
        q2_3.setTitle("Word Frequency Counter");
        q2_3.setSlug("word-frequency-counter");
        q2_3.setDescription("Given space-separated text, count the frequency of each unique word (case-insensitive). Print each distinct word and its count in alphabetical order, formatted as `word: count` on separate lines.");
        q2_3.setInputFormat("Space or newline separated text.");
        q2_3.setOutputFormat("Each word and its count formatted as `<word>: <count>` in alphabetical order.");
        q2_3.setConstraints("1 <= total words <= 10^4");
        q2_3.setExamples("Input: apple banana Apple orange banana apple\nOutput:\napple: 3\nbanana: 2\norange: 1");
        q2_3.setStarterCode("import sys\n\ndef solve():\n    words = sys.stdin.read().lower().split()\n    # TODO: Count frequencies and print sorted alphabetically\n\nif __name__ == '__main__':\n    solve()\n");
        q2_3.setDifficulty("EASY");
        q2_3.setPoints(100);
        q2_3.setOrderIndex(3);
        q2_3 = questionRepository.save(q2_3);

        testCaseRepository.save(new TestCase(q2_3, "apple banana Apple orange banana apple\n", "apple: 3\nbanana: 2\norange: 1", false, 1));
        testCaseRepository.save(new TestCase(q2_3, "Code code CODE\n", "code: 3", false, 2));
        testCaseRepository.save(new TestCase(q2_3, "hello world\n", "hello: 1\nworld: 1", true, 3));

        // Q2.4: Second Largest Distinct Number
        Question q2_4 = new Question();
        q2_4.setRound(r2);
        q2_4.setTitle("Second Largest Distinct Number");
        q2_4.setSlug("second-largest-number");
        q2_4.setDescription("Given $N$ integers, find the second largest distinct number in the list. If no second distinct largest number exists (e.g., all numbers are identical), print `-1`.");
        q2_4.setInputFormat("First line contains integer N.\nSecond line contains N space-separated integers.");
        q2_4.setOutputFormat("Print the second largest distinct integer, or -1.");
        q2_4.setConstraints("1 <= N <= 10^5\n-10^9 <= element <= 10^9");
        q2_4.setExamples("Input:\n5\n10 40 30 20 50\nOutput:\n40");
        q2_4.setStarterCode("import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if not tokens: return\n    n = int(tokens[0])\n    nums = list(map(int, tokens[1:n+1]))\n    # TODO: Find second largest distinct number\n\nif __name__ == '__main__':\n    solve()\n");
        q2_4.setDifficulty("EASY");
        q2_4.setPoints(100);
        q2_4.setOrderIndex(4);
        q2_4 = questionRepository.save(q2_4);

        testCaseRepository.save(new TestCase(q2_4, "5\n10 40 30 20 50\n", "40", false, 1));
        testCaseRepository.save(new TestCase(q2_4, "3\n5 5 5\n", "-1", false, 2));
        testCaseRepository.save(new TestCase(q2_4, "4\n100 20 100 50\n", "50", true, 3));

        // Q2.5: Anagram Verifier
        Question q2_5 = new Question();
        q2_5.setRound(r2);
        q2_5.setTitle("Anagram Verifier");
        q2_5.setSlug("anagram-verifier");
        q2_5.setDescription("Two words are anagrams if they contain the exact same characters with the same frequencies (ignoring case). Given two words, determine if they are anagrams. Print `ANAGRAM` or `NOT ANAGRAM`.");
        q2_5.setInputFormat("Two words separated by space or newline.");
        q2_5.setOutputFormat("Print `ANAGRAM` or `NOT ANAGRAM`.");
        q2_5.setConstraints("1 <= len(word) <= 1000");
        q2_5.setExamples("Input: listen silent\nOutput: ANAGRAM\n\nInput: hello world\nOutput: NOT ANAGRAM");
        q2_5.setStarterCode("import sys\n\ndef solve():\n    words = sys.stdin.read().split()\n    if len(words) < 2: return\n    # TODO: Check if words are anagrams\n\nif __name__ == '__main__':\n    solve()\n");
        q2_5.setDifficulty("EASY");
        q2_5.setPoints(100);
        q2_5.setOrderIndex(5);
        q2_5 = questionRepository.save(q2_5);

        testCaseRepository.save(new TestCase(q2_5, "listen\nsilent\n", "ANAGRAM", false, 1));
        testCaseRepository.save(new TestCase(q2_5, "hello\nworld\n", "NOT ANAGRAM", false, 2));
        testCaseRepository.save(new TestCase(q2_5, "triangle\nintegral\n", "ANAGRAM", true, 3));

        // =========================================================================
        // 7. ROUND 3 — 5 SIMPLE JAVA QUESTIONS
        // =========================================================================

        // Q3.1: Fibonacci Number
        Question q3_1 = new Question();
        q3_1.setRound(r3);
        q3_1.setTitle("Fibonacci Number Generator");
        q3_1.setSlug("fibonacci-number");
        q3_1.setDescription("Given a non-negative integer $N$, calculate the $N$-th Fibonacci number, where $F(0) = 0, F(1) = 1$, and $F(n) = F(n-1) + F(n-2)$ for $n \\ge 2$.");
        q3_1.setInputFormat("A single integer N on standard input.");
        q3_1.setOutputFormat("Print F(N).");
        q3_1.setConstraints("0 <= N <= 30");
        q3_1.setExamples("Input: 6\nOutput: 8\n\nInput: 10\nOutput: 55");
        q3_1.setStarterCode("import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        // TODO: Compute and print nth Fibonacci number\n    }\n}\n");
        q3_1.setDifficulty("EASY");
        q3_1.setPoints(100);
        q3_1.setOrderIndex(1);
        q3_1 = questionRepository.save(q3_1);

        testCaseRepository.save(new TestCase(q3_1, "6\n", "8", false, 1));
        testCaseRepository.save(new TestCase(q3_1, "10\n", "55", false, 2));
        testCaseRepository.save(new TestCase(q3_1, "0\n", "0", true, 3));
        testCaseRepository.save(new TestCase(q3_1, "1\n", "1", true, 4));

        // Q3.2: Right Array Rotation
        Question q3_2 = new Question();
        q3_2.setRound(r3);
        q3_2.setTitle("Right Array Rotation");
        q3_2.setSlug("right-array-rotation");
        q3_2.setDescription("Given an array of $N$ integers and a positive integer $K$, rotate the array to the right by $K$ steps.\n\nPrint the rotated elements separated by a space on a single line.");
        q3_2.setInputFormat("First line contains two integers N and K.\nSecond line contains N space-separated integers.");
        q3_2.setOutputFormat("Print the rotated array elements separated by spaces.");
        q3_2.setConstraints("1 <= N <= 10^5\n0 <= K <= 10^9");
        q3_2.setExamples("Input:\n5 2\n1 2 3 4 5\nOutput:\n4 5 1 2 3");
        q3_2.setStarterCode("import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int k = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        // TODO: Rotate array right by k steps and print\n    }\n}\n");
        q3_2.setDifficulty("EASY");
        q3_2.setPoints(100);
        q3_2.setOrderIndex(2);
        q3_2 = questionRepository.save(q3_2);

        testCaseRepository.save(new TestCase(q3_2, "5 2\n1 2 3 4 5\n", "4 5 1 2 3", false, 1));
        testCaseRepository.save(new TestCase(q3_2, "4 4\n10 20 30 40\n", "10 20 30 40", false, 2));
        testCaseRepository.save(new TestCase(q3_2, "3 1\n7 8 9\n", "9 7 8", true, 3));

        // Q3.3: Find the Missing Number
        Question q3_3 = new Question();
        q3_3.setRound(r3);
        q3_3.setTitle("Find the Missing Number");
        q3_3.setSlug("find-the-missing-number");
        q3_3.setDescription("You are given an array of $N$ distinct integers chosen from the range $1$ to $N+1$. Exactly one number from the range is missing. Find and print the missing number.");
        q3_3.setInputFormat("First line contains integer N.\nSecond line contains N space-separated integers.");
        q3_3.setOutputFormat("Print the missing number.");
        q3_3.setConstraints("1 <= N <= 10^5");
        q3_3.setExamples("Input:\n4\n1 2 4 5\nOutput:\n3");
        q3_3.setStarterCode("import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        // TODO: Find missing number from 1 to n+1\n    }\n}\n");
        q3_3.setDifficulty("EASY");
        q3_3.setPoints(100);
        q3_3.setOrderIndex(3);
        q3_3 = questionRepository.save(q3_3);

        testCaseRepository.save(new TestCase(q3_3, "4\n1 2 4 5\n", "3", false, 1));
        testCaseRepository.save(new TestCase(q3_3, "3\n2 3 4\n", "1", false, 2));
        testCaseRepository.save(new TestCase(q3_3, "5\n1 2 3 4 5\n", "6", true, 3));

        // Q3.4: Run-Length String Compressor
        Question q3_4 = new Question();
        q3_4.setRound(r3);
        q3_4.setTitle("Run-Length String Compressor");
        q3_4.setSlug("run-length-compressor");
        q3_4.setDescription("Compress a string of lowercase letters using run-length encoding. Each contiguous sequence of identical letters is replaced by the letter followed by its count (e.g., `aaabbc` becomes `a3b2c1`).");
        q3_4.setInputFormat("A single line string S.");
        q3_4.setOutputFormat("Print the compressed string.");
        q3_4.setConstraints("1 <= len(S) <= 10^5");
        q3_4.setExamples("Input: aaabbc\nOutput: a3b2c1\n\nInput: abcd\nOutput: a1b1c1d1");
        q3_4.setStarterCode("import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNext()) return;\n        String s = sc.next();\n        // TODO: Perform run-length encoding and print\n    }\n}\n");
        q3_4.setDifficulty("EASY");
        q3_4.setPoints(100);
        q3_4.setOrderIndex(4);
        q3_4 = questionRepository.save(q3_4);

        testCaseRepository.save(new TestCase(q3_4, "aaabbc\n", "a3b2c1", false, 1));
        testCaseRepository.save(new TestCase(q3_4, "abcd\n", "a1b1c1d1", false, 2));
        testCaseRepository.save(new TestCase(q3_4, "zzzz\n", "z4", true, 3));

        // Q3.5: Matrix Diagonal Sum
        Question q3_5 = new Question();
        q3_5.setRound(r3);
        q3_5.setTitle("Matrix Diagonal Sum");
        q3_5.setSlug("matrix-diagonal-sum");
        q3_5.setDescription("Given an $N \\times N$ square integer matrix, calculate the sum of elements on both the primary diagonal (top-left to bottom-right) and the secondary diagonal (top-right to bottom-left). If $N$ is odd, the intersecting center element is counted only once.");
        q3_5.setInputFormat("First line contains integer N.\nNext N lines each contain N space-separated integers.");
        q3_5.setOutputFormat("Print the total diagonal sum.");
        q3_5.setConstraints("1 <= N <= 500\n-10^4 <= matrix[i][j] <= 10^4");
        q3_5.setExamples("Input:\n3\n1 2 3\n4 5 6\n7 8 9\nOutput:\n25\nExplanation: Diagonals are 1, 5, 9 and 3, 5, 7. Center 5 is added only once: 1 + 5 + 9 + 3 + 7 = 25.");
        q3_5.setStarterCode("import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[][] mat = new int[n][n];\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) {\n                mat[i][j] = sc.nextInt();\n            }\n        }\n        // TODO: Compute and print total diagonal sum\n    }\n}\n");
        q3_5.setDifficulty("EASY");
        q3_5.setPoints(100);
        q3_5.setOrderIndex(5);
        q3_5 = questionRepository.save(q3_5);

        testCaseRepository.save(new TestCase(q3_5, "3\n1 2 3\n4 5 6\n7 8 9\n", "25", false, 1));
        testCaseRepository.save(new TestCase(q3_5, "2\n1 2\n3 4\n", "10", false, 2));
        testCaseRepository.save(new TestCase(q3_5, "1\n42\n", "42", true, 3));

        // 8. Seed Announcements if not present
        if (announcementRepository.count() == 0) {
            announcementRepository.save(new Announcement(
                    "Welcome to Code-a-thon 2026!",
                    "Greetings from Gnanamani College of Technology! Round 01 (C Programming - The Foundation) is now LIVE! Verify your connections and review the problem statements.",
                    "ROUND",
                    r1.getId(),
                    "admin@gct.ac.in"
            ));

            announcementRepository.save(new Announcement(
                    "Competition Guidelines & Code Integrity Policy",
                    "Ensure that all solutions are written independently. Automated code execution evaluates submissions against hidden test cases. Tab switching and exiting fullscreen are strictly monitored.",
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
        }

        System.out.println("[DataSeeder] 5 simple questions per round (15 total) successfully seeded for GCT Code-a-thon 2026.");
    }
}
