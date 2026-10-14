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
                    "Apply structured OOP logic, arrays, and standard algorithms to conquer the competition podium.", 45);
            r.setStatus("SCHEDULED");
            r.setIsLocked(true);
            return roundRepository.save(r);
        });
        r2.setTitle("Round 02 — Java");
        r2.setSubtitle("The Logic");
        r2.setLanguage("JAVA");
        r2.setDescription("Apply structured OOP logic, arrays, and standard algorithms to conquer the competition podium.");
        r2 = roundRepository.save(r2);

        Round r3 = roundRepository.findByRoundNumber(3).orElseGet(() -> {
            Round r = new Round(3, "Round 03 — Python", "The Master", "PYTHON",
                    "Think smarter, solve faster. Tackle string processing, lists, frequency counting, and algorithms.", 60);
            r.setStatus("SCHEDULED");
            r.setIsLocked(true);
            return roundRepository.save(r);
        });
        r3.setTitle("Round 03 — Python");
        r3.setSubtitle("The Master");
        r3.setLanguage("PYTHON");
        r3.setDescription("Think smarter, solve faster. Tackle string processing, lists, frequency counting, and algorithms.");
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
        boolean r2NeedsSync = r2Questions.isEmpty() || !r2Questions.get(0).getSlug().equals("second-largest-distinct-element");

        List<Question> r3Questions = questionRepository.findByRoundOrderByOrderIndexAsc(r3);
        boolean r3NeedsSync = r3Questions.isEmpty() || !r3Questions.get(0).getSlug().equals("subarray-sum-equals-k");

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
        q2_1.setTitle("Find the Second Largest Distinct Element");
        q2_1.setSlug("second-largest-distinct-element");
        q2_1.setDescription("Given an integer array nums, return the second-largest distinct element in the array.\n\nIf no second-largest distinct element exists (e.g. all elements are identical, or the array has fewer than 2 distinct values), return -1.\n\nYou must solve the problem without sorting the array.");
        q2_1.setInputFormat("A single line containing space-separated integers representing nums.");
        q2_1.setOutputFormat("Print the second-largest distinct integer, or -1.");
        q2_1.setConstraints("1 <= nums.length <= 100000\n-10^9 <= nums[i] <= 10^9\nDo not use sorting algorithms or Arrays.sort().");
        q2_1.setExamples("Input: 12 35 1 10 34 1\nOutput: 34\nExplanation: The largest element is 35, and the second-largest distinct element is 34.\n\nInput: 10 10 10\nOutput: -1\nExplanation: All elements are identical, so no second-largest distinct element exists.");
        q2_1.setStarterCode("import java.util.*;\n\npublic class Main {\n    public static int secondLargest(int[] nums) {\n        // Write your code here (without sorting)\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while (sc.hasNextInt()) {\n            list.add(sc.nextInt());\n        }\n        if (list.isEmpty()) {\n            System.out.println(-1);\n            return;\n        }\n        int[] nums = new int[list.size()];\n        for (int i = 0; i < list.size(); i++) nums[i] = list.get(i);\n        System.out.println(secondLargest(nums));\n    }\n}\n");
        q2_1.setDifficulty("MEDIUM");
        q2_1.setPoints(100);
        q2_1.setTimeLimitMs(2000);
        q2_1.setMemoryLimitMb(128);
        q2_1.setIsEnabled(true);
        q2_1.setOrderIndex(1);
        q2_1 = questionRepository.save(q2_1);

        testCaseRepository.save(new TestCase(q2_1, "12 35 1 10 34 1\n", "34", false, 1));
        testCaseRepository.save(new TestCase(q2_1, "10 10 10\n", "-1", false, 2));
        testCaseRepository.save(new TestCase(q2_1, "-5 -2 -8\n", "-5", false, 3));
        testCaseRepository.save(new TestCase(q2_1, "5\n", "-1", true, 4));
        testCaseRepository.save(new TestCase(q2_1, "100 200 300 300 200\n", "200", true, 5));
        testCaseRepository.save(new TestCase(q2_1, "-100 -200 -300 -50\n", "-100", true, 6));

        Question q2_2 = new Question();
        q2_2.setRound(r2);
        q2_2.setTitle("Longest Substring Without Repeating Characters");
        q2_2.setSlug("longest-substring-without-repeating");
        q2_2.setDescription("Given a string s, return the length of the longest contiguous substring that contains no repeated characters.\n\nA substring must contain consecutive characters from the original string. Your solution should run in O(n) time complexity.");
        q2_2.setInputFormat("A single line containing string s on standard input.");
        q2_2.setOutputFormat("Print the length of the longest substring without repeating characters.");
        q2_2.setConstraints("0 <= s.length <= 50000\ns contains English letters, digits, symbols, and spaces.\nRequired time complexity: O(n).");
        q2_2.setExamples("Input: abcabcbb\nOutput: 3\nExplanation: The longest substring without repeating characters is 'abc', with length 3.\n\nInput: bbbbb\nOutput: 1\n\nInput: pwwkew\nOutput: 3");
        q2_2.setStarterCode("import java.util.*;\n\npublic class Main {\n    public static int lengthOfLongestSubstring(String s) {\n        // Write your code here (O(n) time complexity)\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNextLine() ? sc.nextLine() : \"\";\n        System.out.println(lengthOfLongestSubstring(s));\n    }\n}\n");
        q2_2.setDifficulty("MEDIUM");
        q2_2.setPoints(100);
        q2_2.setTimeLimitMs(2000);
        q2_2.setMemoryLimitMb(128);
        q2_2.setIsEnabled(true);
        q2_2.setOrderIndex(2);
        q2_2 = questionRepository.save(q2_2);

        testCaseRepository.save(new TestCase(q2_2, "abcabcbb\n", "3", false, 1));
        testCaseRepository.save(new TestCase(q2_2, "bbbbb\n", "1", false, 2));
        testCaseRepository.save(new TestCase(q2_2, "pwwkew\n", "3", false, 3));
        testCaseRepository.save(new TestCase(q2_2, "abcdef\n", "6", true, 4));
        testCaseRepository.save(new TestCase(q2_2, "au\n", "2", true, 5));
        testCaseRepository.save(new TestCase(q2_2, "aab\n", "2", true, 6));

        Question q2_3 = new Question();
        q2_3.setRound(r2);
        q2_3.setTitle("Group Anagrams");
        q2_3.setSlug("group-anagrams");
        q2_3.setDescription("Given an array of strings strs, group the strings that are anagrams of one another.\nTwo strings are anagrams if they contain the same characters with the same frequencies.\n\nPrint the total number of distinct anagram groups on the first line, and the sorted sizes of each group separated by space on the second line.");
        q2_3.setInputFormat("A single line containing space-separated lowercase strings.");
        q2_3.setOutputFormat("First line: Total count of anagram groups.\nSecond line: Space-separated sizes of each group sorted in ascending order.");
        q2_3.setConstraints("1 <= strs.length <= 10000\n0 <= strs[i].length <= 100\nStrings contain lowercase English letters.");
        q2_3.setExamples("Input: eat tea tan ate nat bat\nOutput:\n3\n1 2 3\nExplanation: The groups are ['bat'] (size 1), ['tan', 'nat'] (size 2), and ['eat', 'tea', 'ate'] (size 3).\n\nInput: a\nOutput:\n1\n1");
        q2_3.setStarterCode("import java.util.*;\n\npublic class Main {\n    public static List<List<String>> groupAnagrams(String[] strs) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNext()) {\n            System.out.println(\"0\\n0\");\n            return;\n        }\n        String line = sc.nextLine().trim();\n        String[] strs = line.split(\"\\\\s+\");\n        Map<String, List<String>> groups = new HashMap<>();\n        for (String word : strs) {\n            char[] chars = word.toCharArray();\n            Arrays.sort(chars);\n            String key = new String(chars);\n            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(word);\n        }\n        System.out.println(groups.size());\n        List<Integer> sizes = new ArrayList<>();\n        for (List<String> g : groups.values()) sizes.add(g.size());\n        Collections.sort(sizes);\n        for (int i = 0; i < sizes.size(); i++) {\n            if (i > 0) System.out.print(\" \");\n            System.out.print(sizes.get(i));\n        }\n        System.out.println();\n    }\n}\n");
        q2_3.setDifficulty("MEDIUM");
        q2_3.setPoints(100);
        q2_3.setTimeLimitMs(2000);
        q2_3.setMemoryLimitMb(128);
        q2_3.setIsEnabled(true);
        q2_3.setOrderIndex(3);
        q2_3 = questionRepository.save(q2_3);

        testCaseRepository.save(new TestCase(q2_3, "eat tea tan ate nat bat\n", "3\n1 2 3", false, 1));
        testCaseRepository.save(new TestCase(q2_3, "a\n", "1\n1", false, 2));
        testCaseRepository.save(new TestCase(q2_3, "listen silent enlist apple\n", "2\n1 3", true, 3));
        testCaseRepository.save(new TestCase(q2_3, "rat tar car art\n", "2\n1 3", true, 4));
        testCaseRepository.save(new TestCase(q2_3, "abc bca cab cba bac acb def fed\n", "2\n2 6", true, 5));

        Question q2_4 = new Question();
        q2_4.setRound(r2);
        q2_4.setTitle("Rotate a Matrix by 90 Degrees");
        q2_4.setSlug("rotate-matrix-90");
        q2_4.setDescription("Given an n x n integer matrix, rotate it 90 degrees clockwise in place.\n\nYou must modify the original matrix directly without creating a second matrix.");
        q2_4.setInputFormat("First line contains an integer n.\nThe next n lines each contain n space-separated integers representing matrix rows.");
        q2_4.setOutputFormat("Print the rotated n x n matrix with space-separated integers on each line.");
        q2_4.setConstraints("1 <= n <= 20\n-1000 <= matrix[i][j] <= 1000");
        q2_4.setExamples("Input:\n3\n1 2 3\n4 5 6\n7 8 9\nOutput:\n7 4 1\n8 5 2\n9 6 3\n\nInput:\n2\n1 2\n3 4\nOutput:\n3 1\n4 2");
        q2_4.setStarterCode("import java.util.*;\n\npublic class Main {\n    public static void rotate(int[][] matrix) {\n        // Write your code here (in-place clockwise rotation)\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[][] matrix = new int[n][n];\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) {\n                matrix[i][j] = sc.nextInt();\n            }\n        }\n        rotate(matrix);\n        for (int i = 0; i < n; i++) {\n            StringBuilder sb = new StringBuilder();\n            for (int j = 0; j < n; j++) {\n                if (j > 0) sb.append(\" \");\n                sb.append(matrix[i][j]);\n            }\n            System.out.println(sb.toString());\n        }\n    }\n}\n");
        q2_4.setDifficulty("MEDIUM");
        q2_4.setPoints(100);
        q2_4.setTimeLimitMs(2000);
        q2_4.setMemoryLimitMb(128);
        q2_4.setIsEnabled(true);
        q2_4.setOrderIndex(4);
        q2_4 = questionRepository.save(q2_4);

        testCaseRepository.save(new TestCase(q2_4, "3\n1 2 3\n4 5 6\n7 8 9\n", "7 4 1\n8 5 2\n9 6 3", false, 1));
        testCaseRepository.save(new TestCase(q2_4, "2\n1 2\n3 4\n", "3 1\n4 2", false, 2));
        testCaseRepository.save(new TestCase(q2_4, "1\n42\n", "42", false, 3));
        testCaseRepository.save(new TestCase(q2_4, "4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n13 14 15 16\n", "13 9 5 1\n14 10 6 2\n15 11 7 3\n16 12 8 4", true, 4));

        Question q2_5 = new Question();
        q2_5.setRound(r2);
        q2_5.setTitle("Find the Kth Largest Element");
        q2_5.setSlug("kth-largest-element");
        q2_5.setDescription("Given an integer array nums and an integer k, return the kth-largest element in the array.\n\nNote that it is the kth-largest element in the sorted order, not the kth distinct element. Duplicate values count separately.\nSolve the problem efficiently (e.g. using a min-heap or quickselect) without fully sorting the entire array if possible.");
        q2_5.setInputFormat("First line contains the integer k.\nSecond line contains space-separated integers representing nums.");
        q2_5.setOutputFormat("Print the kth-largest element.");
        q2_5.setConstraints("1 <= k <= nums.length <= 100000\n-10000 <= nums[i] <= 10000");
        q2_5.setExamples("Input:\n2\n3 2 1 5 6 4\nOutput: 5\nExplanation: The sorted array is [1, 2, 3, 4, 5, 6]. The 2nd largest element is 5.\n\nInput:\n4\n3 2 3 1 2 4 5 5 6\nOutput: 4");
        q2_5.setStarterCode("import java.util.*;\n\npublic class Main {\n    public static int findKthLargest(int[] nums, int k) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int k = sc.nextInt();\n        List<Integer> list = new ArrayList<>();\n        while (sc.hasNextInt()) {\n            list.add(sc.nextInt());\n        }\n        int[] nums = new int[list.size()];\n        for (int i = 0; i < list.size(); i++) nums[i] = list.get(i);\n        System.out.println(findKthLargest(nums, k));\n    }\n}\n");
        q2_5.setDifficulty("MEDIUM");
        q2_5.setPoints(100);
        q2_5.setTimeLimitMs(2000);
        q2_5.setMemoryLimitMb(128);
        q2_5.setIsEnabled(true);
        q2_5.setOrderIndex(5);
        q2_5 = questionRepository.save(q2_5);

        testCaseRepository.save(new TestCase(q2_5, "2\n3 2 1 5 6 4\n", "5", false, 1));
        testCaseRepository.save(new TestCase(q2_5, "4\n3 2 3 1 2 4 5 5 6\n", "4", false, 2));
        testCaseRepository.save(new TestCase(q2_5, "1\n10 20 30\n", "30", false, 3));
        testCaseRepository.save(new TestCase(q2_5, "3\n7 10 4 3 20 15\n", "10", true, 4));
        testCaseRepository.save(new TestCase(q2_5, "1\n-5\n", "-5", true, 5));

    }

    private void seedRound3PythonQuestions(Round r3) {
        Question q3_1 = new Question();
        q3_1.setRound(r3);
        q3_1.setTitle("Subarray Sum Equals K");
        q3_1.setSlug("subarray-sum-equals-k");
        q3_1.setDescription("Given an integer array nums and an integer k, return the total number of continuous subarrays whose sum equals k.\n\nA subarray must contain consecutive elements. The array may contain negative numbers, zeros, and positive numbers.\nYour solution should run in O(n) time complexity using prefix sums and a hash map.");
        q3_1.setInputFormat("First line contains integer k.\nSecond line contains space-separated integers representing nums.");
        q3_1.setOutputFormat("Print the total number of continuous subarrays whose sum equals k.");
        q3_1.setConstraints("1 <= nums.length <= 20000\n-1000 <= nums[i] <= 1000\n-10^7 <= k <= 10^7");
        q3_1.setExamples("Input:\n2\n1 1 1\nOutput: 2\nExplanation: Subarrays with sum 2 are nums[0..1] and nums[1..2].\n\nInput:\n3\n1 2 3\nOutput: 2\n\nInput:\n0\n1 -1 0\nOutput: 3");
        q3_1.setStarterCode("import sys\n\ndef subarraySum(nums: list[int], k: int) -> int:\n    # Write your code here (O(n) prefix sum + hash map)\n    return 0\n\nif __name__ == '__main__':\n    lines = [line.strip() for line in sys.stdin.read().splitlines() if line.strip()]\n    if len(lines) >= 2:\n        k = int(lines[0])\n        nums = list(map(int, lines[1].replace(',', ' ').replace('[', ' ').replace(']', ' ').split()))\n        print(subarraySum(nums, k))\n");
        q3_1.setDifficulty("MEDIUM");
        q3_1.setPoints(100);
        q3_1.setTimeLimitMs(2000);
        q3_1.setMemoryLimitMb(128);
        q3_1.setIsEnabled(true);
        q3_1.setOrderIndex(1);
        q3_1 = questionRepository.save(q3_1);

        testCaseRepository.save(new TestCase(q3_1, "2\n1 1 1\n", "2", false, 1));
        testCaseRepository.save(new TestCase(q3_1, "3\n1 2 3\n", "2", false, 2));
        testCaseRepository.save(new TestCase(q3_1, "0\n1 -1 0\n", "3", false, 3));
        testCaseRepository.save(new TestCase(q3_1, "5\n2 3 5 -5 5\n", "3", true, 4));
        testCaseRepository.save(new TestCase(q3_1, "7\n1 2 3 4 5\n", "1", true, 5));

        Question q3_2 = new Question();
        q3_2.setRound(r3);
        q3_2.setTitle("Product of Array Except Self");
        q3_2.setSlug("product-of-array-except-self");
        q3_2.setDescription("Given an integer array nums, return an array answer such that answer[i] is equal to the product of all elements of nums except nums[i].\n\nYou must solve the problem without using division and in O(n) time complexity.");
        q3_2.setInputFormat("A single line containing space-separated integers representing nums.");
        q3_2.setOutputFormat("Print the resulting array in standard Python list format: [answer[0], answer[1], ...].");
        q3_2.setConstraints("2 <= nums.length <= 100000\n-30 <= nums[i] <= 30\nDo not use division.\nThe product of any prefix or suffix fits in a 32-bit integer.");
        q3_2.setExamples("Input: 1 2 3 4\nOutput: [24, 12, 8, 6]\n\nInput: -1 1 0 -3 3\nOutput: [0, 0, 9, 0, 0]");
        q3_2.setStarterCode("import sys\n\ndef productExceptSelf(nums: list[int]) -> list[int]:\n    # Write your code here (without using division, O(n) time)\n    return []\n\nif __name__ == '__main__':\n    raw = sys.stdin.read().strip()\n    if raw:\n        nums = list(map(int, raw.replace(',', ' ').replace('[', ' ').replace(']', ' ').split()))\n        print(productExceptSelf(nums))\n");
        q3_2.setDifficulty("MEDIUM");
        q3_2.setPoints(100);
        q3_2.setTimeLimitMs(2000);
        q3_2.setMemoryLimitMb(128);
        q3_2.setIsEnabled(true);
        q3_2.setOrderIndex(2);
        q3_2 = questionRepository.save(q3_2);

        testCaseRepository.save(new TestCase(q3_2, "1 2 3 4\n", "[24, 12, 8, 6]", false, 1));
        testCaseRepository.save(new TestCase(q3_2, "-1 1 0 -3 3\n", "[0, 0, 9, 0, 0]", false, 2));
        testCaseRepository.save(new TestCase(q3_2, "2 3\n", "[3, 2]", false, 3));
        testCaseRepository.save(new TestCase(q3_2, "1 1 1 1\n", "[1, 1, 1, 1]", true, 4));
        testCaseRepository.save(new TestCase(q3_2, "5 0 2\n", "[0, 10, 0]", true, 5));

        Question q3_3 = new Question();
        q3_3.setRound(r3);
        q3_3.setTitle("Minimum Size Subarray Sum");
        q3_3.setSlug("min-size-subarray-sum");
        q3_3.setDescription("Given an array of positive integers nums and a positive integer target, return the minimum length of a contiguous subarray whose sum is greater than or equal to target.\n\nIf no such subarray exists, return 0. Your solution should run in O(n) time complexity using a sliding window approach.");
        q3_3.setInputFormat("First line contains the integer target.\nSecond line contains space-separated integers representing nums.");
        q3_3.setOutputFormat("Print the minimum length of the contiguous subarray, or 0.");
        q3_3.setConstraints("1 <= target <= 10^9\n1 <= nums.length <= 100000\n1 <= nums[i] <= 10000");
        q3_3.setExamples("Input:\n7\n2 3 1 2 4 3\nOutput: 2\nExplanation: The subarray [4, 3] has minimal length 2 with sum 7 >= 7.\n\nInput:\n4\n1 4 4\nOutput: 1\n\nInput:\n11\n1 1 1 1 1 1 1 1\nOutput: 0");
        q3_3.setStarterCode("import sys\n\ndef minSubArrayLen(target: int, nums: list[int]) -> int:\n    # Write your code here (O(n) sliding window)\n    return 0\n\nif __name__ == '__main__':\n    lines = [line.strip() for line in sys.stdin.read().splitlines() if line.strip()]\n    if len(lines) >= 2:\n        target = int(lines[0])\n        nums = list(map(int, lines[1].replace(',', ' ').replace('[', ' ').replace(']', ' ').split()))\n        print(minSubArrayLen(target, nums))\n");
        q3_3.setDifficulty("MEDIUM");
        q3_3.setPoints(100);
        q3_3.setTimeLimitMs(2000);
        q3_3.setMemoryLimitMb(128);
        q3_3.setIsEnabled(true);
        q3_3.setOrderIndex(3);
        q3_3 = questionRepository.save(q3_3);

        testCaseRepository.save(new TestCase(q3_3, "7\n2 3 1 2 4 3\n", "2", false, 1));
        testCaseRepository.save(new TestCase(q3_3, "4\n1 4 4\n", "1", false, 2));
        testCaseRepository.save(new TestCase(q3_3, "11\n1 1 1 1 1 1 1 1\n", "0", false, 3));
        testCaseRepository.save(new TestCase(q3_3, "15\n1 2 3 4 5\n", "5", true, 4));
        testCaseRepository.save(new TestCase(q3_3, "5\n2 3 1 2 4 3\n", "2", true, 5));

        Question q3_4 = new Question();
        q3_4.setRound(r3);
        q3_4.setTitle("Search in a Rotated Sorted Array");
        q3_4.setSlug("search-rotated-sorted-array");
        q3_4.setDescription("An integer array nums was originally sorted in ascending order with distinct values. It was subsequently rotated at an unknown pivot index.\n\nGiven the rotated array nums and an integer target, return the index of target if it exists in nums, or -1 if it is not present.\nYour algorithm must run in O(log n) runtime complexity using binary search.");
        q3_4.setInputFormat("First line contains the integer target.\nSecond line contains space-separated integers representing nums.");
        q3_4.setOutputFormat("Print the 0-based index of target, or -1.");
        q3_4.setConstraints("1 <= nums.length <= 50000\n-10^4 <= nums[i] <= 10^4\nAll values in nums are unique.\n-10^4 <= target <= 10^4");
        q3_4.setExamples("Input:\n0\n4 5 6 7 0 1 2\nOutput: 4\n\nInput:\n3\n4 5 6 7 0 1 2\nOutput: -1\n\nInput:\n0\n1\nOutput: -1");
        q3_4.setStarterCode("import sys\n\ndef search(nums: list[int], target: int) -> int:\n    # Write your code here (O(log n) binary search)\n    return -1\n\nif __name__ == '__main__':\n    lines = [line.strip() for line in sys.stdin.read().splitlines() if line.strip()]\n    if len(lines) >= 2:\n        target = int(lines[0])\n        nums = list(map(int, lines[1].replace(',', ' ').replace('[', ' ').replace(']', ' ').split()))\n        print(search(nums, target))\n");
        q3_4.setDifficulty("MEDIUM");
        q3_4.setPoints(100);
        q3_4.setTimeLimitMs(2000);
        q3_4.setMemoryLimitMb(128);
        q3_4.setIsEnabled(true);
        q3_4.setOrderIndex(4);
        q3_4 = questionRepository.save(q3_4);

        testCaseRepository.save(new TestCase(q3_4, "0\n4 5 6 7 0 1 2\n", "4", false, 1));
        testCaseRepository.save(new TestCase(q3_4, "3\n4 5 6 7 0 1 2\n", "-1", false, 2));
        testCaseRepository.save(new TestCase(q3_4, "0\n1\n", "-1", false, 3));
        testCaseRepository.save(new TestCase(q3_4, "1\n1\n", "0", true, 4));
        testCaseRepository.save(new TestCase(q3_4, "8\n4 5 6 7 8 1 2 3\n", "4", true, 5));
        testCaseRepository.save(new TestCase(q3_4, "2\n4 5 6 7 8 1 2 3\n", "6", true, 6));

        Question q3_5 = new Question();
        q3_5.setRound(r3);
        q3_5.setTitle("Longest Consecutive Sequence");
        q3_5.setSlug("longest-consecutive-sequence");
        q3_5.setDescription("Given an unsorted integer array nums, return the length of the longest consecutive elements sequence.\nThe consecutive elements do not need to appear next to each other in the original array.\n\nYour algorithm must run in O(n) time complexity using a set and sequence-start detection.");
        q3_5.setInputFormat("A single line containing space-separated integers representing nums (or empty line for empty array).");
        q3_5.setOutputFormat("Print the length of the longest consecutive sequence.");
        q3_5.setConstraints("0 <= nums.length <= 100000\n-10^9 <= nums[i] <= 10^9");
        q3_5.setExamples("Input: 100 4 200 1 3 2\nOutput: 4\nExplanation: The longest consecutive elements sequence is [1, 2, 3, 4] with length 4.\n\nInput: 0 3 7 2 5 8 4 6 0 1\nOutput: 9\n\nInput: 1 0 1 2\nOutput: 3");
        q3_5.setStarterCode("import sys\n\ndef longestConsecutive(nums: list[int]) -> int:\n    # Write your code here (O(n) time complexity)\n    return 0\n\nif __name__ == '__main__':\n    raw = sys.stdin.read().strip()\n    if not raw or raw == '[]':\n        print(0)\n    else:\n        nums = list(map(int, raw.replace(',', ' ').replace('[', ' ').replace(']', ' ').split()))\n        print(longestConsecutive(nums))\n");
        q3_5.setDifficulty("MEDIUM");
        q3_5.setPoints(100);
        q3_5.setTimeLimitMs(2000);
        q3_5.setMemoryLimitMb(128);
        q3_5.setIsEnabled(true);
        q3_5.setOrderIndex(5);
        q3_5 = questionRepository.save(q3_5);

        testCaseRepository.save(new TestCase(q3_5, "100 4 200 1 3 2\n", "4", false, 1));
        testCaseRepository.save(new TestCase(q3_5, "0 3 7 2 5 8 4 6 0 1\n", "9", false, 2));
        testCaseRepository.save(new TestCase(q3_5, "1 0 1 2\n", "3", false, 3));
        testCaseRepository.save(new TestCase(q3_5, "\n", "0", true, 4));
        testCaseRepository.save(new TestCase(q3_5, "9 1 4 7 3 -1 0 5 8 -1 6\n", "7", true, 5));

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
