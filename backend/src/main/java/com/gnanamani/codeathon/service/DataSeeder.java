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

        // 2. Clear mock participant submissions, locks, sessions, events, and mock students
        eventRepository.deleteAll();
        sessionRepository.deleteAll();
        submissionResultRepository.deleteAll();
        submissionRepository.deleteAll();
        lockRepository.deleteAll();
        participantRepository.deleteAll();

        // Remove old mock/demo participant users and legacy accounts
        List<User> mockUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_PARTICIPANT || u.getEmail().endsWith("@gct.ac.in"))
                .toList();
        if (!mockUsers.isEmpty()) {
            userRepository.deleteAll(mockUsers);
        }

        // 3. Upsert Admin: admin@gct.org.in / Gnyan@codingclub.com
        String adminEmail = "admin@gct.org.in";
        String adminPass = System.getenv().getOrDefault("ADMIN_PASSWORD", "Gnyan@codingclub.com");
        User admin = userRepository.findByEmail(adminEmail)
                .orElseGet(() -> new User(adminEmail, "", "GCT Admin", Role.ROLE_ADMIN));
        admin.setPasswordHash(passwordEncoder.encode(adminPass));
        admin.setFullName("GCT Admin");
        admin.setRole(Role.ROLE_ADMIN);
        userRepository.save(admin);

        // 4. Upsert Judges: judge1@gct.org.in, judge2@gct.org.in, judge3@gct.org.in / Judge@codingclub.com
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
        // 5. ROUND 1 — C PROGRAMMING (FROM DOCX)
        // =========================================================================

        Question q1_1 = new Question();
        q1_1.setRound(r1);
        q1_1.setTitle("Even or Odd Number");
        q1_1.setSlug("even-or-odd-number");
        q1_1.setDescription("Given an integer $n$, determine whether it is even or odd.\\n\\nPrint `1` if the number is even and `0` if the number is odd.");
        q1_1.setInputFormat("A single integer n on standard input.");
        q1_1.setOutputFormat("Print 1 if n is even, or 0 if n is odd.");
        q1_1.setConstraints("-10^6 <= n <= 10^6");
        q1_1.setExamples("Input: 8\\nOutput: 1\\n\\nInput: 7\\nOutput: 0");
        q1_1.setStarterCode("#include <stdio.h>\\n\\nint main() {\\n    int n;\\n    if (scanf(\"%d\", &n) != 1) return 0;\\n    // Write your code here\\n    return 0;\\n}\\n");
        q1_1.setDifficulty("EASY");
        q1_1.setPoints(100);
        q1_1.setOrderIndex(1);
        q1_1 = questionRepository.save(q1_1);

        testCaseRepository.save(new TestCase(q1_1, "8\\n", "1", false, 1));
        testCaseRepository.save(new TestCase(q1_1, "7\\n", "0", false, 2));
        testCaseRepository.save(new TestCase(q1_1, "0\\n", "1", true, 3));
        testCaseRepository.save(new TestCase(q1_1, "-4\\n", "1", true, 4));
        testCaseRepository.save(new TestCase(q1_1, "-9\\n", "0", true, 5));
        testCaseRepository.save(new TestCase(q1_1, "1000000\\n", "1", true, 6));

        Question q1_2 = new Question();
        q1_2.setRound(r1);
        q1_2.setTitle("Find the Largest of Three Numbers");
        q1_2.setSlug("largest-of-three-numbers");
        q1_2.setDescription("Given three integers $a$, $b$, and $c$, determine and print the largest number.");
        q1_2.setInputFormat("Three space-separated integers a, b, and c on standard input.");
        q1_2.setOutputFormat("Print the largest integer on a single line.");
        q1_2.setConstraints("-10^4 <= a, b, c <= 10^4");
        q1_2.setExamples("Input: 10 25 15\\nOutput: 25\\n\\nInput: 8 8 3\\nOutput: 8");
        q1_2.setStarterCode("#include <stdio.h>\\n\\nint main() {\\n    int a, b, c;\\n    if (scanf(\"%d %d %d\", &a, &b, &c) != 3) return 0;\\n    // Write your code here\\n    return 0;\\n}\\n");
        q1_2.setDifficulty("EASY");
        q1_2.setPoints(100);
        q1_2.setOrderIndex(2);
        q1_2 = questionRepository.save(q1_2);

        testCaseRepository.save(new TestCase(q1_2, "10 25 15\\n", "25", false, 1));
        testCaseRepository.save(new TestCase(q1_2, "8 8 3\\n", "8", false, 2));
        testCaseRepository.save(new TestCase(q1_2, "-10 -5 -20\\n", "-5", true, 3));
        testCaseRepository.save(new TestCase(q1_2, "42 42 42\\n", "42", true, 4));
        testCaseRepository.save(new TestCase(q1_2, "100 200 500\\n", "500", true, 5));
        testCaseRepository.save(new TestCase(q1_2, "999 50 10\\n", "999", true, 6));

        Question q1_3 = new Question();
        q1_3.setRound(r1);
        q1_3.setTitle("Sum of Digits");
        q1_3.setSlug("sum-of-digits");
        q1_3.setDescription("Given an integer $n$, calculate and print the sum of its digits. If $n$ is negative, calculate the sum using its absolute value.");
        q1_3.setInputFormat("A single integer n on standard input.");
        q1_3.setOutputFormat("Print the sum of the digits.");
        q1_3.setConstraints("-10^9 <= n <= 10^9");
        q1_3.setExamples("Input: 1234\\nOutput: 10\\nExplanation: 1 + 2 + 3 + 4 = 10\\n\\nInput: -567\\nOutput: 18\\nExplanation: 5 + 6 + 7 = 18");
        q1_3.setStarterCode("#include <stdio.h>\\n\\nint main() {\\n    int n;\\n    if (scanf(\"%d\", &n) != 1) return 0;\\n    // Write your code here\\n    return 0;\\n}\\n");
        q1_3.setDifficulty("EASY");
        q1_3.setPoints(100);
        q1_3.setOrderIndex(3);
        q1_3 = questionRepository.save(q1_3);

        testCaseRepository.save(new TestCase(q1_3, "1234\\n", "10", false, 1));
        testCaseRepository.save(new TestCase(q1_3, "-567\\n", "18", false, 2));
        testCaseRepository.save(new TestCase(q1_3, "0\\n", "0", true, 3));
        testCaseRepository.save(new TestCase(q1_3, "9\\n", "9", true, 4));
        testCaseRepository.save(new TestCase(q1_3, "1000000\\n", "1", true, 5));
        testCaseRepository.save(new TestCase(q1_3, "-9999\\n", "36", true, 6));

        Question q1_4 = new Question();
        q1_4.setRound(r1);
        q1_4.setTitle("Count Vowels in a String");
        q1_4.setSlug("count-vowels-in-a-string");
        q1_4.setDescription("Given a string $s$, count the number of vowels (a, e, i, o, u) present in the string. Both uppercase and lowercase vowels must be counted. Non-vowel characters and spaces should be ignored.");
        q1_4.setInputFormat("A single line containing string s on standard input.");
        q1_4.setOutputFormat("Print the total count of vowels.");
        q1_4.setConstraints("1 <= length of s <= 1000\\nThe string contains English letters and spaces.");
        q1_4.setExamples("Input: Hello World\\nOutput: 3\\nExplanation: The vowels are e, o, and o.\\n\\nInput: EDUCATION\\nOutput: 5");
        q1_4.setStarterCode("#include <stdio.h>\\n#include <ctype.h>\\n\\nint main() {\\n    char s[1005];\\n    if (!fgets(s, sizeof(s), stdin)) return 0;\\n    // Write your code here\\n    return 0;\\n}\\n");
        q1_4.setDifficulty("EASY");
        q1_4.setPoints(100);
        q1_4.setOrderIndex(4);
        q1_4 = questionRepository.save(q1_4);

        testCaseRepository.save(new TestCase(q1_4, "Hello World\\n", "3", false, 1));
        testCaseRepository.save(new TestCase(q1_4, "EDUCATION\\n", "5", false, 2));
        testCaseRepository.save(new TestCase(q1_4, "rhythm\\n", "0", true, 3));
        testCaseRepository.save(new TestCase(q1_4, "AeIou\\n", "5", true, 4));
        testCaseRepository.save(new TestCase(q1_4, "Gnanamani College of Technology\\n", "9", true, 5));

        Question q1_5 = new Question();
        q1_5.setRound(r1);
        q1_5.setTitle("Find the Maximum Element Using a Function");
        q1_5.setSlug("find-maximum-element-function");
        q1_5.setDescription("Given an integer array `nums` containing $n$ elements, find and print the largest element using a user-defined function named `findMax`.\\n\\nYour solution must define and call `int findMax(int nums[], int n)` to return the maximum value.");
        q1_5.setInputFormat("First line contains integer n.\\nSecond line contains n space-separated integers.");
        q1_5.setOutputFormat("Print the maximum element.");
        q1_5.setConstraints("1 <= n <= 1000\\n-10^4 <= nums[i] <= 10^4");
        q1_5.setExamples("Input:\\n5\\n3 7 2 9 4\\nOutput: 9\\n\\nInput:\\n4\\n-5 -2 -10 -1\\nOutput: -1");
        q1_5.setStarterCode("#include <stdio.h>\\n\\nint findMax(int nums[], int n) {\\n    // Write your function here\\n    return nums[0];\\n}\\n\\nint main() {\\n    int n;\\n    if (scanf(\"%d\", &n) != 1) return 0;\\n    int nums[1000];\\n    for (int i = 0; i < n; i++) {\\n        scanf(\"%d\", &nums[i]);\\n    }\\n    printf(\"%d\\n\", findMax(nums, n));\\n    return 0;\\n}\\n");
        q1_5.setDifficulty("EASY");
        q1_5.setPoints(100);
        q1_5.setOrderIndex(5);
        q1_5 = questionRepository.save(q1_5);

        testCaseRepository.save(new TestCase(q1_5, "5\\n3 7 2 9 4\\n", "9", false, 1));
        testCaseRepository.save(new TestCase(q1_5, "4\\n-5 -2 -10 -1\\n", "-1", false, 2));
        testCaseRepository.save(new TestCase(q1_5, "1\\n42\\n", "42", true, 3));
        testCaseRepository.save(new TestCase(q1_5, "6\\n10 20 30 50 40 50\\n", "50", true, 4));
        testCaseRepository.save(new TestCase(q1_5, "5\\n-100 -200 -300 -400 -50\\n", "-50", true, 5));

        // =========================================================================
        // 6. ROUND 2 — PYTHON PROGRAMMING (FROM DOCX)
        // =========================================================================

        Question q2_1 = new Question();
        q2_1.setRound(r2);
        q2_1.setTitle("Array: Second Largest Distinct Element");
        q2_1.setSlug("second-largest-distinct-element");
        q2_1.setDescription("Given an integer array `nums`, return the second-largest distinct element in the array.\\n\\nIf a second-largest distinct element does not exist (e.g. all elements are identical, or array has < 2 distinct values), return `-1`.\\n\\nYou must solve the problem without sorting the array.");
        q2_1.setInputFormat("Space or comma separated integers on standard input.");
        q2_1.setOutputFormat("Print the second largest distinct integer, or -1.");
        q2_1.setConstraints("1 <= len(nums) <= 10^5\\n-10^9 <= nums[i] <= 10^9\\nDo not use sort() or sorted().");
        q2_1.setExamples("Input: 12 35 1 10 34 35\\nOutput: 34\\nExplanation: The largest element is 35, and the second-largest distinct element is 34.\\n\\nInput: 10 10 10\\nOutput: -1\\nExplanation: There is no second-largest distinct element.");
        q2_1.setStarterCode("import sys\\n\\ndef second_largest(nums):\\n    # Write your code here (without using sort or sorted)\\n    return -1\\n\\nif __name__ == '__main__':\\n    raw = sys.stdin.read().strip()\\n    if raw:\\n        nums = list(map(int, raw.replace(',', ' ').replace('[', ' ').replace(']', ' ').split()))\\n        print(second_largest(nums))\\n");
        q2_1.setDifficulty("MEDIUM");
        q2_1.setPoints(100);
        q2_1.setOrderIndex(1);
        q2_1 = questionRepository.save(q2_1);

        testCaseRepository.save(new TestCase(q2_1, "12 35 1 10 34 35\\n", "34", false, 1));
        testCaseRepository.save(new TestCase(q2_1, "10 10 10\\n", "-1", false, 2));
        testCaseRepository.save(new TestCase(q2_1, "5\\n", "-1", true, 3));
        testCaseRepository.save(new TestCase(q2_1, "7 2\\n", "2", true, 4));
        testCaseRepository.save(new TestCase(q2_1, "-10 -20 -30 -5\\n", "-10", true, 5));
        testCaseRepository.save(new TestCase(q2_1, "100 200 300 300 200\\n", "200", true, 6));

        Question q2_2 = new Question();
        q2_2.setRound(r2);
        q2_2.setTitle("Marksheet: Student Grade Analyzer");
        q2_2.setSlug("student-grade-analyzer");
        q2_2.setDescription("You are given a list of five subject marks for a student. Each mark is an integer between 0 and 100.\\n\\nWrite a program that calculates:\\n1. Total marks.\\n2. Average percentage out of 100 (rounded to two decimal places).\\n3. Grade based on rules:\\n- 90–100: A\\n- 80–89: B\\n- 70–79: C\\n- 60–69: D\\n- Below 60: F\\n\\nIf any subject mark is below 35, the student must receive grade F, regardless of the average.\\n\\nReturn the formatted tuple `(Total, Average, 'Grade')`.");
        q2_2.setInputFormat("Five space-separated integers representing subject marks on standard input.");
        q2_2.setOutputFormat("Print `(Total, Average, 'Grade')` with average formatted to two decimal places (e.g. `(440, 88.00, 'B')`).");
        q2_2.setConstraints("Exactly five subject marks must be provided.\\n0 <= marks[i] <= 100.");
        q2_2.setExamples("Input: 95 87 92 78 88\\nOutput: (440, 88.00, 'B')\\n\\nInput: 95 92 28 90 85\\nOutput: (390, 78.00, 'F')\\nExplanation: Although the average is 78.00, the student failed because one mark is below 35.");
        q2_2.setStarterCode("import sys\\n\\ndef analyze_marks(marks):\\n    # Write your code here\\n    # Return total, average (rounded to 2 decimal places), grade\\n    pass\\n\\nif __name__ == '__main__':\\n    raw = sys.stdin.read().strip()\\n    if raw:\\n        marks = list(map(int, raw.replace(',', ' ').replace('[', ' ').replace(']', ' ').split()))\\n        total, avg, grade = analyze_marks(marks)\\n        print(f\"({total}, {avg:.2f}, '{grade}')\")\\n");
        q2_2.setDifficulty("MEDIUM");
        q2_2.setPoints(100);
        q2_2.setOrderIndex(2);
        q2_2 = questionRepository.save(q2_2);

        testCaseRepository.save(new TestCase(q2_2, "95 87 92 78 88\\n", "(440, 88.00, 'B')", false, 1));
        testCaseRepository.save(new TestCase(q2_2, "95 92 28 90 85\\n", "(390, 78.00, 'F')", false, 2));
        testCaseRepository.save(new TestCase(q2_2, "100 95 92 98 94\\n", "(479, 95.80, 'A')", true, 3));
        testCaseRepository.save(new TestCase(q2_2, "60 62 65 68 64\\n", "(319, 63.80, 'D')", true, 4));
        testCaseRepository.save(new TestCase(q2_2, "75 72 78 71 74\\n", "(370, 74.00, 'C')", true, 5));
        testCaseRepository.save(new TestCase(q2_2, "40 45 50 55 34\\n", "(224, 44.80, 'F')", true, 6));

        Question q2_3 = new Question();
        q2_3.setRound(r2);
        q2_3.setTitle("String Slicing: Extract and Reverse a Substring");
        q2_3.setSlug("string-slicing-extract-reverse");
        q2_3.setDescription("Given a string $s$ and two integers `start` and `end`, extract the substring from index `start` up to, but not including, index `end` ($s[start:end]$).\\n\\nThen reverse the extracted substring and return the result.\\nIf `start` or `end` is negative, interpret it using Python's negative-indexing rules.\\n\\nUse Python slicing. Do not use loops to reverse the substring.");
        q2_3.setInputFormat("First line contains string s.\\nSecond line contains two space-separated integers start and end.");
        q2_3.setOutputFormat("Print the reversed extracted substring.");
        q2_3.setConstraints("1 <= len(s) <= 10^5\\n-len(s) <= start <= len(s)\\n-len(s) <= end <= len(s)");
        q2_3.setExamples("Input:\\nprogramming\\n2 7\\nOutput: margo\\nExplanation: s[2:7] produces 'ogram'. Reversing it produces 'margo'.\\n\\nInput:\\nPythonProgramming\\n-11 -5\\nOutput: margor");
        q2_3.setStarterCode("import sys\\n\\ndef reverse_substring(s, start, end):\\n    # Write your code here using slicing\\n    pass\\n\\nif __name__ == '__main__':\\n    lines = [line.strip() for line in sys.stdin.read().splitlines() if line.strip()]\\n    if len(lines) >= 2:\\n        s = lines[0]\\n        parts = lines[1].split()\\n        print(reverse_substring(s, int(parts[0]), int(parts[1])))\\n");
        q2_3.setDifficulty("MEDIUM");
        q2_3.setPoints(100);
        q2_3.setOrderIndex(3);
        q2_3 = questionRepository.save(q2_3);

        testCaseRepository.save(new TestCase(q2_3, "programming\\n2 7\\n", "margo", false, 1));
        testCaseRepository.save(new TestCase(q2_3, "PythonProgramming\\n-11 -5\\n", "margor", false, 2));
        testCaseRepository.save(new TestCase(q2_3, "abcdef\\n0 6\\n", "fedcba", true, 3));
        testCaseRepository.save(new TestCase(q2_3, "hello world\\n0 5\\n", "olleh", true, 4));
        testCaseRepository.save(new TestCase(q2_3, "CodeAThon\\n1 5\\n", "Aedo", true, 5));

        Question q2_4 = new Question();
        q2_4.setRound(r2);
        q2_4.setTitle("Calculator: Expression Evaluator");
        q2_4.setSlug("calculator-expression-evaluator");
        q2_4.setDescription("Implement a basic calculator function `calculator(a, b, operator)` that takes two numbers and an operator string.\\n\\nSupported operators:\\n- `+` for addition\\n- `-` for subtraction\\n- `*` for multiplication\\n- `/` for division\\n- `%` for modulus\\n- `**` for exponentiation\\n\\nIf the operator is not one of the supported operators, return `Invalid operator`.\\nIf division or modulus by zero is attempted (b == 0), return `Division by zero`.\\n\\nDo not use eval().");
        q2_4.setInputFormat("Space-separated a b operator on standard input (e.g. 10 3 %).");
        q2_4.setOutputFormat("Print the computed result, Division by zero, or Invalid operator.");
        q2_4.setConstraints("-10^4 <= a, b <= 10^4\\nDo not use eval().");
        q2_4.setExamples("Input: 10 3 %\\nOutput: 1\\n\\nInput: 2 5 **\\nOutput: 32\\n\\nInput: 10 0 /\\nOutput: Division by zero");
        q2_4.setStarterCode("import sys\\n\\ndef calculator(a, b, operator):\\n    # Write your code here (without using eval)\\n    pass\\n\\nif __name__ == '__main__':\\n    parts = sys.stdin.read().split()\\n    if len(parts) >= 3:\\n        a = float(parts[0]) if '.' in parts[0] else int(parts[0])\\n        b = float(parts[1]) if '.' in parts[1] else int(parts[1])\\n        op = parts[2]\\n        res = calculator(a, b, op)\\n        if isinstance(res, float) and res.is_integer():\\n            print(int(res))\\n        else:\\n            print(res)\\n");
        q2_4.setDifficulty("MEDIUM");
        q2_4.setPoints(100);
        q2_4.setOrderIndex(4);
        q2_4 = questionRepository.save(q2_4);

        testCaseRepository.save(new TestCase(q2_4, "10 3 %\\n", "1", false, 1));
        testCaseRepository.save(new TestCase(q2_4, "2 5 **\\n", "32", false, 2));
        testCaseRepository.save(new TestCase(q2_4, "10 0 /\\n", "Division by zero", false, 3));
        testCaseRepository.save(new TestCase(q2_4, "15 4 +\\n", "19", true, 4));
        testCaseRepository.save(new TestCase(q2_4, "50 20 -\\n", "30", true, 5));
        testCaseRepository.save(new TestCase(q2_4, "7 8 *\\n", "56", true, 6));
        testCaseRepository.save(new TestCase(q2_4, "8 0 %\\n", "Division by zero", true, 7));
        testCaseRepository.save(new TestCase(q2_4, "10 5 ^\\n", "Invalid operator", true, 8));

        Question q2_5 = new Question();
        q2_5.setRound(r2);
        q2_5.setTitle("Functions: Analyze a Number List");
        q2_5.setSlug("analyze-number-list");
        q2_5.setDescription("Write a function named `analyze_numbers(nums)` that accepts a list of integers and returns a tuple containing:\\n1. The sum of all elements.\\n2. The arithmetic mean, rounded to two decimal places.\\n3. The largest element.\\n4. The smallest element.\\n5. The count of even numbers.\\n\\nIf the list is empty, return `Empty list`.");
        q2_5.setInputFormat("Space-separated integers on standard input (or [] for empty).");
        q2_5.setOutputFormat("Print tuple (Sum, Mean, Max, Min, EvenCount) or Empty list.");
        q2_5.setConstraints("0 <= len(nums) <= 10^5\\n-10^6 <= nums[i] <= 10^6");
        q2_5.setExamples("Input: 4 7 2 9 10\\nOutput: (32, 6.4, 10, 2, 3)\\nExplanation: Sum = 32, Mean = 6.40, Max = 10, Min = 2, Even numbers = 4, 2, 10 (count 3).\\n\\nInput: []\\nOutput: Empty list");
        q2_5.setStarterCode("import sys\\n\\ndef analyze_numbers(nums):\\n    # Write your code here\\n    pass\\n\\nif __name__ == '__main__':\\n    raw = sys.stdin.read().strip()\\n    if not raw or raw == '[]':\\n        print(analyze_numbers([]))\\n    else:\\n        nums = list(map(int, raw.replace(',', ' ').replace('[', ' ').replace(']', ' ').split()))\\n        print(analyze_numbers(nums))\\n");
        q2_5.setDifficulty("MEDIUM");
        q2_5.setPoints(100);
        q2_5.setOrderIndex(5);
        q2_5 = questionRepository.save(q2_5);

        testCaseRepository.save(new TestCase(q2_5, "4 7 2 9 10\\n", "(32, 6.4, 10, 2, 3)", false, 1));
        testCaseRepository.save(new TestCase(q2_5, "[]\\n", "Empty list", false, 2));
        testCaseRepository.save(new TestCase(q2_5, "10 20 30 40 50\\n", "(150, 30.0, 50, 10, 5)", true, 3));
        testCaseRepository.save(new TestCase(q2_5, "1 3 5 7\\n", "(16, 4.0, 7, 1, 0)", true, 4));
        testCaseRepository.save(new TestCase(q2_5, "-5 0 5\\n", "(0, 0.0, 5, -5, 1)", true, 5));

        // =========================================================================
        // 7. ROUND 3 — JAVA PROGRAMMING (FROM DOCX)
        // =========================================================================

        Question q3_1 = new Question();
        q3_1.setRound(r3);
        q3_1.setTitle("Product of Array Except Self");
        q3_1.setSlug("product-of-array-except-self");
        q3_1.setDescription("Given an integer array `nums`, return an array `answer` such that `answer[i]` equals the product of every element in `nums` except `nums[i]`.\\n\\nYou must solve the problem without using division and in $O(n)$ time complexity.");
        q3_1.setInputFormat("Space-separated integers on standard input (or array format [1, 2, 3, 4]).");
        q3_1.setOutputFormat("Print array [answer[0], answer[1], ...].");
        q3_1.setConstraints("2 <= nums.length <= 10^5\\n-30 <= nums[i] <= 30\\nDo not use division.\\nRequired time complexity: O(n).");
        q3_1.setExamples("Input: 1 2 3 4\\nOutput: [24, 12, 8, 6]\\n\\nInput: -1 1 0 -3 3\\nOutput: [0, 0, 9, 0, 0]");
        q3_1.setStarterCode("import java.util.*;\\n\\npublic class Main {\\n    public static int[] productExceptSelf(int[] nums) {\\n        // Write your code here (without using division)\\n        return new int[nums.length];\\n    }\\n\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        if (!sc.hasNext()) return;\\n        String line = sc.nextLine().replaceAll(\"[\\\\[\\\\],]\", \" \").trim();\\n        String[] parts = line.split(\"\\\\s+\");\\n        int[] nums = new int[parts.length];\\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\\n        int[] ans = productExceptSelf(nums);\\n        System.out.println(Arrays.toString(ans));\\n    }\\n}\\n");
        q3_1.setDifficulty("MEDIUM");
        q3_1.setPoints(100);
        q3_1.setOrderIndex(1);
        q3_1 = questionRepository.save(q3_1);

        testCaseRepository.save(new TestCase(q3_1, "1 2 3 4\\n", "[24, 12, 8, 6]", false, 1));
        testCaseRepository.save(new TestCase(q3_1, "-1 1 0 -3 3\\n", "[0, 0, 9, 0, 0]", false, 2));
        testCaseRepository.save(new TestCase(q3_1, "2 3\\n", "[3, 2]", true, 3));
        testCaseRepository.save(new TestCase(q3_1, "1 1 1 1\\n", "[1, 1, 1, 1]", true, 4));
        testCaseRepository.save(new TestCase(q3_1, "5 0 2\\n", "[0, 10, 0]", true, 5));

        Question q3_2 = new Question();
        q3_2.setRound(r3);
        q3_2.setTitle("Longest Substring Without Repeating Characters");
        q3_2.setSlug("longest-substring-without-repeating");
        q3_2.setDescription("Given a string $s$, find the length of the longest substring that contains no repeated characters.\\n\\nA substring must consist of consecutive characters from the original string. Your solution must run in $O(n)$ time.");
        q3_2.setInputFormat("A single string s on standard input.");
        q3_2.setOutputFormat("Print the maximum length as an integer.");
        q3_2.setConstraints("0 <= s.length <= 5 * 10^4\\ns contains English letters, digits, symbols, and spaces.\\nRequired time complexity: O(n).");
        q3_2.setExamples("Input: abcabcbb\\nOutput: 3\\nExplanation: The longest substring without repeating characters is 'abc', with length 3.\\n\\nInput: pwwkew\\nOutput: 3\\nExplanation: One valid longest substring is 'wke', with length 3.\\n\\nInput: abba\\nOutput: 2");
        q3_2.setStarterCode("import java.util.*;\\n\\npublic class Main {\\n    public static int lengthOfLongestSubstring(String s) {\\n        // Write your code here\\n        return 0;\\n    }\\n\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        String s = sc.hasNextLine() ? sc.nextLine() : \"\";\\n        System.out.println(lengthOfLongestSubstring(s));\\n    }\\n}\\n");
        q3_2.setDifficulty("HARD");
        q3_2.setPoints(100);
        q3_2.setOrderIndex(2);
        q3_2 = questionRepository.save(q3_2);

        testCaseRepository.save(new TestCase(q3_2, "abcabcbb\\n", "3", false, 1));
        testCaseRepository.save(new TestCase(q3_2, "pwwkew\\n", "3", false, 2));
        testCaseRepository.save(new TestCase(q3_2, "abba\\n", "2", false, 3));
        testCaseRepository.save(new TestCase(q3_2, "bbbbb\\n", "1", true, 4));
        testCaseRepository.save(new TestCase(q3_2, "abcdefg\\n", "7", true, 5));

        Question q3_3 = new Question();
        q3_3.setRound(r3);
        q3_3.setTitle("3Sum");
        q3_3.setSlug("three-sum");
        q3_3.setDescription("Given an integer array `nums`, return all unique triplets `[nums[i], nums[j], nums[k]]` such that:\\n- i, j, and k are distinct indices.\\n- nums[i] + nums[j] + nums[k] == 0.\\n\\nThe result must not contain duplicate triplets.\\nYour solution should run in $O(n^2)$ time.");
        q3_3.setInputFormat("Space-separated integers on standard input.");
        q3_3.setOutputFormat("Print all unique triplets in list format (e.g. [[-1, -1, 2], [-1, 0, 1]]).");
        q3_3.setConstraints("3 <= nums.length <= 3000\\n-10^5 <= nums[i] <= 10^5\\nNo duplicate triplets in result.\\nRequired time complexity: O(n^2).");
        q3_3.setExamples("Input: -1 0 1 2 -1 -4\\nOutput: [[-1, -1, 2], [-1, 0, 1]]\\n\\nInput: 0 1 1\\nOutput: []\\n\\nInput: 0 0 0 0\\nOutput: [[0, 0, 0]]");
        q3_3.setStarterCode("import java.util.*;\\n\\npublic class Main {\\n    public static List<List<Integer>> threeSum(int[] nums) {\\n        // Write your code here\\n        return new ArrayList<>();\\n    }\\n\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        if (!sc.hasNext()) {\\n            System.out.println(\"[]\");\\n            return;\\n        }\\n        String line = sc.nextLine().replaceAll(\"[\\\\[\\\\],]\", \" \").trim();\\n        if (line.isEmpty()) {\\n            System.out.println(\"[]\");\\n            return;\\n        }\\n        String[] parts = line.split(\"\\\\s+\");\\n        int[] nums = new int[parts.length];\\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\\n        List<List<Integer>> ans = threeSum(nums);\\n        System.out.println(ans);\\n    }\\n}\\n");
        q3_3.setDifficulty("HARD");
        q3_3.setPoints(100);
        q3_3.setOrderIndex(3);
        q3_3 = questionRepository.save(q3_3);

        testCaseRepository.save(new TestCase(q3_3, "-1 0 1 2 -1 -4\\n", "[[-1, -1, 2], [-1, 0, 1]]", false, 1));
        testCaseRepository.save(new TestCase(q3_3, "0 1 1\\n", "[]", false, 2));
        testCaseRepository.save(new TestCase(q3_3, "0 0 0 0\\n", "[[0, 0, 0]]", false, 3));
        testCaseRepository.save(new TestCase(q3_3, "-2 0 1 1 2\\n", "[[-2, 0, 2], [-2, 1, 1]]", true, 4));
        testCaseRepository.save(new TestCase(q3_3, "1 2 -2 -1\\n", "[]", true, 5));

        Question q3_4 = new Question();
        q3_4.setRound(r3);
        q3_4.setTitle("Number of Islands");
        q3_4.setSlug("number-of-islands");
        q3_4.setDescription("You are given a 2D grid consisting of '1' (land) and '0' (water).\\nAn island is a group of connected land cells. Cells are connected horizontally or vertically, but not diagonally.\\n\\nReturn the total number of islands in the grid.\\nYour solution must use Depth-First Search (DFS) or Breadth-First Search (BFS).");
        q3_4.setInputFormat("First line contains two integers: rows and cols.\\nNext rows lines each contain cols space-separated characters ('1' or '0').");
        q3_4.setOutputFormat("Print the total number of islands.");
        q3_4.setConstraints("1 <= rows, cols <= 300\\ngrid[i][j] is either '0' or '1'.");
        q3_4.setExamples("Input:\\n4 5\\n1 1 1 1 0\\n1 1 0 1 0\\n1 1 0 0 0\\n0 0 0 0 0\\nOutput: 1\\n\\nInput:\\n4 5\\n1 1 0 0 0\\n1 1 0 0 0\\n0 0 1 0 0\\n0 0 0 1 1\\nOutput: 3");
        q3_4.setStarterCode("import java.util.*;\\n\\npublic class Main {\\n    public static int numIslands(char[][] grid) {\\n        // Write your code here (DFS or BFS)\\n        return 0;\\n    }\\n\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        if (!sc.hasNextInt()) return;\\n        int r = sc.nextInt();\\n        int c = sc.nextInt();\\n        char[][] grid = new char[r][c];\\n        for (int i = 0; i < r; i++) {\\n            for (int j = 0; j < c; j++) {\\n                grid[i][j] = sc.next().charAt(0);\\n            }\\n        }\\n        System.out.println(numIslands(grid));\\n    }\\n}\\n");
        q3_4.setDifficulty("HARD");
        q3_4.setPoints(100);
        q3_4.setOrderIndex(4);
        q3_4 = questionRepository.save(q3_4);

        testCaseRepository.save(new TestCase(q3_4, "4 5\\n1 1 1 1 0\\n1 1 0 1 0\\n1 1 0 0 0\\n0 0 0 0 0\\n", "1", false, 1));
        testCaseRepository.save(new TestCase(q3_4, "4 5\\n1 1 0 0 0\\n1 1 0 0 0\\n0 0 1 0 0\\n0 0 0 1 1\\n", "3", false, 2));
        testCaseRepository.save(new TestCase(q3_4, "1 1\\n0\\n", "0", true, 3));
        testCaseRepository.save(new TestCase(q3_4, "1 1\\n1\\n", "1", true, 4));
        testCaseRepository.save(new TestCase(q3_4, "3 3\\n1 0 1\\n0 1 0\\n1 0 1\\n", "5", true, 5));

        Question q3_5 = new Question();
        q3_5.setRound(r3);
        q3_5.setTitle("LRU Cache Design");
        q3_5.setSlug("lru-cache-design");
        q3_5.setDescription("Design a data structure that follows the Least Recently Used (LRU) cache policy.\\n\\nImplement the class `LRUCache` with operations:\\n- `LRUCache(int capacity)`: Initialize cache with positive capacity.\\n- `int get(int key)`: Return value if key exists, else -1. Accessing key makes it most recently used.\\n- `void put(int key, int value)`: Insert or update key-value. If capacity exceeded, evict the least recently used entry.\\n\\nBoth get and put must run in O(1) average time.");
        q3_5.setInputFormat("First line contains capacity integer.\\nRemaining lines contain commands: 'put key value' or 'get key'.");
        q3_5.setOutputFormat("For each 'get key' command, print the returned integer on a new line.");
        q3_5.setConstraints("1 <= capacity <= 3000\\n0 <= key <= 10^4\\n0 <= value <= 10^5");
        q3_5.setExamples("Input:\\n2\\nput 1 1\\nput 2 2\\nget 1\\nput 3 3\\nget 2\\nput 4 4\\nget 1\\nget 3\\nget 4\\nOutput:\\n1\\n-1\\n-1\\n3\\n4");
        q3_5.setStarterCode("import java.util.*;\\n\\nclass LRUCache {\\n    public LRUCache(int capacity) {\\n        // Initialize cache\\n    }\\n\\n    public int get(int key) {\\n        // Return value or -1\\n        return -1;\\n    }\\n\\n    public void put(int key, int value) {\\n        // Put key-value\\n    }\\n}\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        if (!sc.hasNextInt()) return;\\n        int capacity = sc.nextInt();\\n        LRUCache cache = new LRUCache(capacity);\\n        while (sc.hasNext()) {\\n            String op = sc.next();\\n            if (op.equalsIgnoreCase(\"put\")) {\\n                int k = sc.nextInt();\\n                int v = sc.nextInt();\\n                cache.put(k, v);\\n            } else if (op.equalsIgnoreCase(\"get\")) {\\n                int k = sc.nextInt();\\n                System.out.println(cache.get(k));\\n            }\\n        }\\n    }\\n}\\n");
        q3_5.setDifficulty("HARD");
        q3_5.setPoints(100);
        q3_5.setOrderIndex(5);
        q3_5 = questionRepository.save(q3_5);

        testCaseRepository.save(new TestCase(q3_5, "2\\nput 1 1\\nput 2 2\\nget 1\\nput 3 3\\nget 2\\nput 4 4\\nget 1\\nget 3\\nget 4\\n", "1\\n-1\\n-1\\n3\\n4", false, 1));
        testCaseRepository.save(new TestCase(q3_5, "1\\nput 1 10\\nget 1\\nput 2 20\\nget 1\\nget 2\\n", "10\\n-1\\n20", true, 2));
        testCaseRepository.save(new TestCase(q3_5, "2\\nget 2\\nput 2 6\\nget 1\\nput 1 5\\nput 1 2\\nget 1\\nget 2\\n", "-1\\n-1\\n2\\n6", true, 3));
        // 8. Seed Announcements if not present
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
                    "Round 02 Python Schedule Update",
                    "Round 02 (The Logic) is scheduled to unlock immediately following the evaluation window of Round 01. Keep your terminal ready!",
                    "SCHEDULE",
                    r2.getId(),
                    "admin@gct.org.in"
            ));
        }

        System.out.println("[DataSeeder] 5 simple questions per round (15 total) successfully seeded for GCT Code-a-thon 2026.");
    }
}
