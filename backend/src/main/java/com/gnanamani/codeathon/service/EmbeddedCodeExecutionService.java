package com.gnanamani.codeathon.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.*;
import java.util.regex.Pattern;

/**
 * Embedded Native Code Execution Engine.
 * Provides fallback in-process compilation and execution of Java, Python, and C
 * directly on the host JVM container when the external HTTP runner is unreachable.
 */
@Service
public class EmbeddedCodeExecutionService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddedCodeExecutionService.class);

    private static final Pattern PUBLIC_CLASS_PATTERN = Pattern.compile("public\\s+class\\s+([A-Za-z0-9_]+)");
    private static final boolean IS_WINDOWS = System.getProperty("os.name", "").toLowerCase().contains("win");

    private volatile String detectedPythonCmd = null;
    private volatile String detectedGccCmd = null;

    public Map<String, Object> execute(Map<String, Object> payload) {
        String language = (String) payload.getOrDefault("language", "python");
        String sourceCode = (String) payload.getOrDefault("sourceCode", "");
        List<Map<String, Object>> testCases = (List<Map<String, Object>>) payload.getOrDefault("testCases", List.of());
        int timeLimitMs = payload.containsKey("timeLimitMs") ? ((Number) payload.get("timeLimitMs")).intValue() : 3000;
        int memoryLimitMb = payload.containsKey("memoryLimitMb") ? ((Number) payload.get("memoryLimitMb")).intValue() : 128;

        String lang = language == null ? "python" : language.trim().toLowerCase();

        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("codeathon-exec-" + UUID.randomUUID());
            switch (lang) {
                case "java":
                    return executeJava(tempDir, sourceCode, testCases, timeLimitMs, memoryLimitMb);
                case "python":
                case "py":
                    return executePython(tempDir, sourceCode, testCases, timeLimitMs);
                case "c":
                    return executeC(tempDir, sourceCode, testCases, timeLimitMs);
                default:
                    return errorResult("Unsupported language for code execution: " + lang, testCases.size());
            }
        } catch (Exception e) {
            log.error("Embedded code execution encountered an error", e);
            return errorResult("Execution error: " + e.getMessage(), testCases.size());
        } finally {
            if (tempDir != null) {
                deleteDirectory(tempDir.toFile());
            }
        }
    }

    private Map<String, Object> executeJava(Path tempDir, String sourceCode, List<Map<String, Object>> testCases, int timeLimitMs, int memoryLimitMb) throws IOException {
        String normalizedCode = sourceCode != null ? sourceCode : "";
        if (!normalizedCode.contains("class Main")) {
            normalizedCode = PUBLIC_CLASS_PATTERN.matcher(normalizedCode).replaceAll("public class Main");
        }
        Path javaFile = tempDir.resolve("Main.java");
        Files.writeString(javaFile, normalizedCode, StandardCharsets.UTF_8);

        // Compile Java code
        ProcessResult compRes = runCommand(List.of("javac", "Main.java"), tempDir, "", 8000);
        if (compRes.exitCode != 0) {
            String compileErr = !compRes.stderr.isEmpty() ? compRes.stderr : compRes.stdout;
            return compileErrorResult(compileErr, testCases.size());
        }

        List<Map<String, Object>> results = new ArrayList<>();
        int maxTimeMs = 0;

        for (int i = 0; i < testCases.size(); i++) {
            Map<String, Object> tc = testCases.get(i);
            String tcId = String.valueOf(tc.getOrDefault("id", String.valueOf(i + 1)));
            String input = String.valueOf(tc.getOrDefault("input", ""));
            String expected = normalizeOutput(String.valueOf(tc.getOrDefault("expectedOutput", "")));
            boolean isHidden = Boolean.TRUE.equals(tc.get("isHidden"));

            List<String> runCmd = List.of("java", "-Xmx" + memoryLimitMb + "m", "-Xms16m", "Main");
            ProcessResult runRes = runCommand(runCmd, tempDir, input, timeLimitMs);
            maxTimeMs = Math.max(maxTimeMs, (int) runRes.executionTimeMs);

            String actualNormalized = normalizeOutput(runRes.stdout);
            String status = "PASSED";
            if (runRes.timedOut) {
                status = "TIME_LIMIT";
            } else if (runRes.exitCode != 0) {
                status = "RUNTIME_ERROR";
            } else if (!expected.isEmpty() && !actualNormalized.equals(expected)) {
                status = "FAILED";
            }

            Map<String, Object> r = new HashMap<>();
            r.put("testCaseId", tcId);
            r.put("status", status);
            r.put("executionTimeMs", (int) runRes.executionTimeMs);
            r.put("actualOutput", isHidden ? "[HIDDEN]" : runRes.stdout);
            r.put("expectedOutput", isHidden ? "[HIDDEN]" : tc.getOrDefault("expectedOutput", ""));
            r.put("error", !runRes.stderr.isEmpty() ? runRes.stderr : null);
            r.put("isHidden", isHidden);
            results.add(r);
        }

        return buildFinalResult(results, maxTimeMs, "");
    }

    private Map<String, Object> executePython(Path tempDir, String sourceCode, List<Map<String, Object>> testCases, int timeLimitMs) throws IOException {
        String pyCmd = getPythonCommand();
        if (pyCmd == null) {
            return compileErrorResult("Python interpreter (python3/python) not found on host environment.", testCases.size());
        }

        Path scriptFile = tempDir.resolve("solution.py");
        Files.writeString(scriptFile, sourceCode != null ? sourceCode : "", StandardCharsets.UTF_8);

        List<Map<String, Object>> results = new ArrayList<>();
        int maxTimeMs = 0;

        for (int i = 0; i < testCases.size(); i++) {
            Map<String, Object> tc = testCases.get(i);
            String tcId = String.valueOf(tc.getOrDefault("id", String.valueOf(i + 1)));
            String input = String.valueOf(tc.getOrDefault("input", ""));
            String expected = normalizeOutput(String.valueOf(tc.getOrDefault("expectedOutput", "")));
            boolean isHidden = Boolean.TRUE.equals(tc.get("isHidden"));

            List<String> runCmd = List.of(pyCmd, "-I", "solution.py");
            ProcessResult runRes = runCommand(runCmd, tempDir, input, timeLimitMs);
            maxTimeMs = Math.max(maxTimeMs, (int) runRes.executionTimeMs);

            String actualNormalized = normalizeOutput(runRes.stdout);
            String status = "PASSED";
            if (runRes.timedOut) {
                status = "TIME_LIMIT";
            } else if (runRes.exitCode != 0) {
                status = "RUNTIME_ERROR";
            } else if (!expected.isEmpty() && !actualNormalized.equals(expected)) {
                status = "FAILED";
            }

            Map<String, Object> r = new HashMap<>();
            r.put("testCaseId", tcId);
            r.put("status", status);
            r.put("executionTimeMs", (int) runRes.executionTimeMs);
            r.put("actualOutput", isHidden ? "[HIDDEN]" : runRes.stdout);
            r.put("expectedOutput", isHidden ? "[HIDDEN]" : tc.getOrDefault("expectedOutput", ""));
            r.put("error", !runRes.stderr.isEmpty() ? runRes.stderr : null);
            r.put("isHidden", isHidden);
            results.add(r);
        }

        return buildFinalResult(results, maxTimeMs, "");
    }

    private Map<String, Object> executeC(Path tempDir, String sourceCode, List<Map<String, Object>> testCases, int timeLimitMs) throws IOException {
        String gccCmd = getGccCommand();
        if (gccCmd == null) {
            return compileErrorResult("C compiler (GCC) is not available on host environment.", testCases.size());
        }

        Path cFile = tempDir.resolve("solution.c");
        Files.writeString(cFile, sourceCode != null ? sourceCode : "", StandardCharsets.UTF_8);

        String exeName = IS_WINDOWS ? "solution.exe" : "solution";
        ProcessResult compRes = runCommand(List.of(gccCmd, "-O2", "solution.c", "-lm", "-o", exeName), tempDir, "", 8000);
        if (compRes.exitCode != 0) {
            String compileErr = !compRes.stderr.isEmpty() ? compRes.stderr : compRes.stdout;
            return compileErrorResult(compileErr, testCases.size());
        }

        List<Map<String, Object>> results = new ArrayList<>();
        int maxTimeMs = 0;
        String runBinary = IS_WINDOWS ? tempDir.resolve(exeName).toString() : "./" + exeName;

        for (int i = 0; i < testCases.size(); i++) {
            Map<String, Object> tc = testCases.get(i);
            String tcId = String.valueOf(tc.getOrDefault("id", String.valueOf(i + 1)));
            String input = String.valueOf(tc.getOrDefault("input", ""));
            if (!input.isEmpty() && !input.endsWith("\n")) {
                input += "\n";
            }
            String expected = normalizeOutput(String.valueOf(tc.getOrDefault("expectedOutput", "")));
            boolean isHidden = Boolean.TRUE.equals(tc.get("isHidden"));

            ProcessResult runRes = runCommand(List.of(runBinary), tempDir, input, timeLimitMs);
            maxTimeMs = Math.max(maxTimeMs, (int) runRes.executionTimeMs);

            String actualNormalized = normalizeOutput(runRes.stdout);
            String status = "PASSED";
            if (runRes.timedOut) {
                status = "TIME_LIMIT";
            } else if (runRes.exitCode != 0) {
                status = "RUNTIME_ERROR";
            } else if (!expected.isEmpty() && !actualNormalized.equals(expected)) {
                status = "FAILED";
            }

            Map<String, Object> r = new HashMap<>();
            r.put("testCaseId", tcId);
            r.put("status", status);
            r.put("executionTimeMs", (int) runRes.executionTimeMs);
            r.put("actualOutput", isHidden ? "[HIDDEN]" : runRes.stdout);
            r.put("expectedOutput", isHidden ? "[HIDDEN]" : tc.getOrDefault("expectedOutput", ""));
            r.put("error", !runRes.stderr.isEmpty() ? runRes.stderr : null);
            r.put("isHidden", isHidden);
            results.add(r);
        }

        return buildFinalResult(results, maxTimeMs, "");
    }

    private Map<String, Object> buildFinalResult(List<Map<String, Object>> results, int maxTimeMs, String compileOutput) {
        long passedCount = results.stream().filter(r -> "PASSED".equals(r.get("status"))).count();
        String overallStatus = "FAILED";
        if (passedCount == results.size() && !results.isEmpty()) {
            overallStatus = "PASSED";
        } else if (passedCount > 0) {
            overallStatus = "PARTIAL";
        } else if (results.stream().anyMatch(r -> "TIME_LIMIT".equals(r.get("status")))) {
            overallStatus = "TIME_LIMIT";
        } else if (results.stream().anyMatch(r -> "RUNTIME_ERROR".equals(r.get("status")))) {
            overallStatus = "RUNTIME_ERROR";
        }

        double scorePercent = results.isEmpty() ? 0.0 : ((double) passedCount / results.size()) * 100.0;
        scorePercent = Math.round(scorePercent * 10.0) / 10.0;

        Map<String, Object> res = new HashMap<>();
        res.put("overallStatus", overallStatus);
        res.put("passedTestCases", (int) passedCount);
        res.put("totalTestCases", results.size());
        res.put("scorePercent", scorePercent);
        res.put("executionTimeMs", maxTimeMs);
        res.put("memoryKb", 0);
        res.put("compileOutput", compileOutput != null ? compileOutput : "");
        res.put("results", results);
        return res;
    }

    private Map<String, Object> compileErrorResult(String compileOutput, int totalTestCases) {
        Map<String, Object> res = new HashMap<>();
        res.put("overallStatus", "COMPILE_ERROR");
        res.put("passedTestCases", 0);
        res.put("totalTestCases", totalTestCases);
        res.put("scorePercent", 0.0);
        res.put("executionTimeMs", 0);
        res.put("memoryKb", 0);
        res.put("compileOutput", compileOutput != null ? compileOutput.substring(0, Math.min(2000, compileOutput.length())) : "");
        res.put("results", List.of());
        return res;
    }

    private Map<String, Object> errorResult(String message, int totalTestCases) {
        Map<String, Object> res = new HashMap<>();
        res.put("overallStatus", "ERROR");
        res.put("passedTestCases", 0);
        res.put("totalTestCases", totalTestCases);
        res.put("scorePercent", 0.0);
        res.put("executionTimeMs", 0);
        res.put("memoryKb", 0);
        res.put("compileOutput", message);
        res.put("results", List.of());
        return res;
    }

    private String normalizeOutput(String str) {
        if (str == null) return "";
        return str.replace("\r\n", "\n").trim();
    }

    private synchronized String getPythonCommand() {
        if (detectedPythonCmd != null) return detectedPythonCmd;
        for (String cmd : List.of("python3", "python", "py")) {
            try {
                Process p = new ProcessBuilder(cmd, "--version").start();
                if (p.waitFor(2, TimeUnit.SECONDS) && p.exitValue() == 0) {
                    detectedPythonCmd = cmd;
                    return cmd;
                }
            } catch (Exception ignored) {}
        }
        return null;
    }

    private synchronized String getGccCommand() {
        if (detectedGccCmd != null) return detectedGccCmd;
        for (String cmd : List.of("gcc", "clang")) {
            try {
                Process p = new ProcessBuilder(cmd, "--version").start();
                if (p.waitFor(2, TimeUnit.SECONDS) && p.exitValue() == 0) {
                    detectedGccCmd = cmd;
                    return cmd;
                }
            } catch (Exception ignored) {}
        }
        return null;
    }

    private ProcessResult runCommand(List<String> command, Path workingDir, String input, long timeoutMs) {
        long startTime = System.currentTimeMillis();
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.directory(workingDir.toFile());

        Process process = null;
        ExecutorService readerPool = Executors.newFixedThreadPool(2);
        try {
            process = pb.start();

            // Write stdin
            if (input != null && !input.isEmpty()) {
                try (OutputStream os = process.getOutputStream()) {
                    os.write(input.getBytes(StandardCharsets.UTF_8));
                    os.flush();
                } catch (IOException ignored) {}
            } else {
                try {
                    process.getOutputStream().close();
                } catch (IOException ignored) {}
            }

            InputStream stdOutIs = process.getInputStream();
            InputStream stdErrIs = process.getErrorStream();
            Future<String> stdoutFuture = readerPool.submit(() -> readStream(stdOutIs));
            Future<String> stderrFuture = readerPool.submit(() -> readStream(stdErrIs));

            boolean finished = process.waitFor(timeoutMs, TimeUnit.MILLISECONDS);
            long elapsed = System.currentTimeMillis() - startTime;

            if (!finished) {
                process.destroyForcibly();
                return new ProcessResult(124, "", "Execution Timed Out (Limit: " + timeoutMs + "ms)", elapsed, true);
            }

            int exitCode = process.exitValue();
            String stdout = "";
            String stderr = "";
            try {
                stdout = stdoutFuture.get(1, TimeUnit.SECONDS);
            } catch (Exception ignored) {}
            try {
                stderr = stderrFuture.get(1, TimeUnit.SECONDS);
            } catch (Exception ignored) {}

            return new ProcessResult(exitCode, stdout, stderr, elapsed, false);
        } catch (Exception e) {
            if (process != null) {
                process.destroyForcibly();
            }
            long elapsed = System.currentTimeMillis() - startTime;
            return new ProcessResult(-1, "", e.getMessage(), elapsed, false);
        } finally {
            readerPool.shutdownNow();
        }
    }

    private String readStream(InputStream is) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            char[] buf = new char[1024];
            int read;
            while ((read = reader.read(buf)) != -1) {
                if (sb.length() + read > 100000) {
                    sb.append(buf, 0, 100000 - sb.length());
                    break;
                }
                sb.append(buf, 0, read);
            }
            return sb.toString();
        } catch (IOException e) {
            return "";
        }
    }

    private void deleteDirectory(File dir) {
        if (dir == null || !dir.exists()) return;
        File[] files = dir.listFiles();
        if (files != null) {
            for (File f : files) {
                if (f.isDirectory()) {
                    deleteDirectory(f);
                } else {
                    f.delete();
                }
            }
        }
        dir.delete();
    }

    private static class ProcessResult {
        final int exitCode;
        final String stdout;
        final String stderr;
        final long executionTimeMs;
        final boolean timedOut;

        ProcessResult(int exitCode, String stdout, String stderr, long executionTimeMs, boolean timedOut) {
            this.exitCode = exitCode;
            this.stdout = stdout != null ? stdout : "";
            this.stderr = stderr != null ? stderr : "";
            this.executionTimeMs = executionTimeMs;
            this.timedOut = timedOut;
        }
    }
}
