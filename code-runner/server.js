const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execSync } = require('child_process');
const crypto = require('crypto');

const PORT = process.env.PORT || 5050;

// Determine available compilers/interpreters
function tryFindSubBins(parent) {
  const res = [];
  try {
    const entries = fs.readdirSync(parent, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.isDirectory()) {
        const subBin = path.join(parent, ent.name, 'bin');
        if (fs.existsSync(subBin)) res.push(subBin);
      }
    }
  } catch (e) {}
  return res;
}

function findGccCommand() {
  // 1. Direct gcc on PATH
  try {
    execSync('gcc --version', { stdio: 'ignore' });
    return { cmd: 'gcc', dir: null };
  } catch (e) {}

  // 2. Windows-specific package paths (WinGet LLVM-MinGW, MSYS2, LLVM, etc.)
  if (os.platform() === 'win32') {
    const candidates = [];
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      const wingetDir = path.join(localAppData, 'Microsoft', 'WinGet', 'Packages');
      if (fs.existsSync(wingetDir)) {
        try {
          const dirs = fs.readdirSync(wingetDir);
          for (const d of dirs) {
            if (d.toLowerCase().includes('llvm-mingw') || d.toLowerCase().includes('mingw')) {
              const fullD = path.join(wingetDir, d);
              const binCandidates = [
                path.join(fullD, 'bin'),
                ...tryFindSubBins(fullD)
              ];
              for (const b of binCandidates) {
                candidates.push(path.join(b, 'gcc.exe'));
                candidates.push(path.join(b, 'clang.exe'));
                candidates.push(path.join(b, 'x86_64-w64-mingw32-gcc.exe'));
              }
            }
          }
        } catch (e) {}
      }
    }

    candidates.push(
      'C:\\msys64\\ucrt64\\bin\\gcc.exe',
      'C:\\msys64\\mingw64\\bin\\gcc.exe',
      'C:\\Program Files\\LLVM\\bin\\clang.exe',
      'C:\\Program Files\\MinGW\\bin\\gcc.exe',
      'C:\\MinGW\\bin\\gcc.exe'
    );

    for (const cand of candidates) {
      if (cand && fs.existsSync(cand)) {
        try {
          execSync(`"${cand}" --version`, { stdio: 'ignore' });
          return { cmd: cand, dir: path.dirname(cand) };
        } catch (e) {}
      }
    }
  }

  // 3. Clang fallback
  try {
    execSync('clang --version', { stdio: 'ignore' });
    return { cmd: 'clang', dir: null };
  } catch (e) {}

  return { cmd: null, dir: null };
}

const gccInfo = findGccCommand();
const hasGcc = !!gccInfo.cmd;
const gccCmd = gccInfo.cmd;

let hasJava = false;
try {
  execSync('javac -version', { stdio: 'ignore' });
  hasJava = true;
} catch (e) {
  hasJava = false;
}

let pythonCmd = 'python';
let hasPython = false;
for (const py of ['python', 'python3', 'py']) {
  try {
    execSync(`${py} --version`, { stdio: 'ignore' });
    pythonCmd = py;
    hasPython = true;
    break;
  } catch (e) {
    hasPython = false;
  }
}

console.log(`[CodeRunner] Environment check: GCC=${hasGcc} (${gccCmd || 'none'}), Java=${hasJava}, Python=${hasPython} (${pythonCmd})`);

// Concurrency queue to protect memory on free hosting tiers (e.g. Render 512MB RAM)
class ExecutionQueue {
  constructor(maxConcurrent = 2) {
    this.maxConcurrent = maxConcurrent;
    this.current = 0;
    this.queue = [];
  }

  enqueue(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.next();
    });
  }

  next() {
    if (this.current >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    this.current++;
    const { fn, resolve, reject } = this.queue.shift();
    fn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.current--;
        this.next();
      });
  }
}

const runnerQueue = new ExecutionQueue(2);

// Minimal safe environment for sandboxed child processes — NO secrets leaked
const basePaths = [
  gccInfo.dir,
  process.env.PATH || '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
].filter(Boolean).join(path.delimiter);

const SAFE_ENV = {
  PATH: basePaths,
  JAVA_HOME: process.env.JAVA_HOME || '',
  SystemRoot: process.env.SystemRoot || (os.platform() === 'win32' ? 'C:\\Windows' : ''),
  windir: process.env.windir || (os.platform() === 'win32' ? 'C:\\Windows' : ''),
  TEMP: os.tmpdir(),
  TMP: os.tmpdir(),
  HOME: os.tmpdir(),
  LANG: 'en_US.UTF-8',
  TERM: 'dumb'
};

function runProcess(cmd, args, options = {}, input = '', timeoutMs = 2000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    let proc;
    try {
      proc = spawn(cmd, args, {
        cwd: options.cwd || process.cwd(),
        env: { ...SAFE_ENV, ...options.env },
        windowsHide: true
      });
    } catch (err) {
      return resolve({
        exitCode: -1,
        stdout: '',
        stderr: err.message,
        executionTimeMs: 0,
        timedOut: false,
        error: err
      });
    }

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        proc.kill('SIGKILL');
      } catch (e) {}
    }, timeoutMs);

    if (input) {
      try {
        proc.stdin.write(input);
        proc.stdin.end();
      } catch (e) {}
    } else {
      try {
        proc.stdin.end();
      } catch (e) {}
    }

    proc.stdout.on('data', (chunk) => {
      if (stdout.length < 50000) stdout += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      if (stderr.length < 50000) stderr += chunk.toString();
    });

    proc.on('close', (exitCode) => {
      clearTimeout(timer);
      const executionTimeMs = Date.now() - startTime;
      resolve({
        exitCode: timedOut ? 124 : (exitCode ?? 0),
        stdout,
        stderr,
        executionTimeMs,
        timedOut
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        exitCode: -1,
        stdout,
        stderr: stderr || err.message,
        executionTimeMs: Date.now() - startTime,
        timedOut: false,
        error: err
      });
    });
  });
}

function normalizeOutput(str) {
  if (!str) return '';
  return str.replace(/\r\n/g, '\n').trim();
}


async function executeSubmission({ language, sourceCode, testCases, timeLimitMs = 2000, memoryLimitMb = 128 }) {
  const runId = crypto.randomUUID();
  const tempDir = path.join(os.tmpdir(), `code-runner-${runId}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const lang = (language || '').toLowerCase().trim();
  let compileOutput = '';
  let compileSuccess = true;
  let compiledExecutable = '';

  const results = [];
  let maxTimeMs = 0;

  try {
    if (lang === 'python' || lang === 'py') {
      const scriptPath = path.join(tempDir, 'solution.py');
      fs.writeFileSync(scriptPath, sourceCode, 'utf8');

      for (const tc of testCases) {
        const input = tc.input || '';
        const expected = normalizeOutput(tc.expectedOutput);
        const res = await runProcess(pythonCmd, ['-I', scriptPath], { cwd: tempDir }, input, timeLimitMs);
        maxTimeMs = Math.max(maxTimeMs, res.executionTimeMs);

        let status = 'PASSED';
        if (res.timedOut) {
          status = 'TIME_LIMIT';
        } else if (res.exitCode !== 0) {
          status = 'RUNTIME_ERROR';
        } else if (expected && normalizeOutput(res.stdout) !== expected) {
          status = 'FAILED';
        }

        results.push({
          testCaseId: tc.id || String(results.length + 1),
          status,
          executionTimeMs: res.executionTimeMs,
          actualOutput: tc.isHidden ? '[HIDDEN]' : res.stdout,
          expectedOutput: tc.isHidden ? '[HIDDEN]' : tc.expectedOutput,
          error: res.stderr ? res.stderr.slice(0, 1000) : null,
          isHidden: !!tc.isHidden
        });
      }
    } else if (lang === 'java') {
      // Find class name or replace public class with Main
      let normalizedCode = sourceCode;
      if (!normalizedCode.includes('class Main')) {
        normalizedCode = normalizedCode.replace(/public\s+class\s+([A-Za-z0-9_]+)/g, 'public class Main');
      }
      const javaFile = path.join(tempDir, 'Main.java');
      fs.writeFileSync(javaFile, normalizedCode, 'utf8');

      // Compile
      const compRes = await runProcess('javac', ['Main.java'], { cwd: tempDir }, '', 5000);
      if (compRes.exitCode !== 0) {
        compileSuccess = false;
        compileOutput = compRes.stderr || compRes.stdout;
      } else {
        for (const tc of testCases) {
          const input = tc.input || '';
          const expected = normalizeOutput(tc.expectedOutput);
          const res = await runProcess('java', [`-Xmx${memoryLimitMb}m`, '-Xms16m', 'Main'], { cwd: tempDir }, input, timeLimitMs);
          maxTimeMs = Math.max(maxTimeMs, res.executionTimeMs);

          let status = 'PASSED';
          if (res.timedOut) {
            status = 'TIME_LIMIT';
          } else if (res.exitCode !== 0) {
            status = 'RUNTIME_ERROR';
          } else if (expected && normalizeOutput(res.stdout) !== expected) {
            status = 'FAILED';
          }

          results.push({
            testCaseId: tc.id || String(results.length + 1),
            status,
            executionTimeMs: res.executionTimeMs,
            actualOutput: tc.isHidden ? '[HIDDEN]' : res.stdout,
            expectedOutput: tc.isHidden ? '[HIDDEN]' : tc.expectedOutput,
            error: res.stderr ? res.stderr.slice(0, 1000) : null,
            isHidden: !!tc.isHidden
          });
        }
      }
    } else if (lang === 'c') {
      const cFile = path.join(tempDir, 'solution.c');
      const exeFile = path.join(tempDir, os.platform() === 'win32' ? 'solution.exe' : 'solution');
      fs.writeFileSync(cFile, sourceCode, 'utf8');

      if (hasGcc) {
        const compRes = await runProcess(gccCmd, ['-O2', cFile, '-lm', '-o', exeFile], { cwd: tempDir }, '', 8000);
        if (compRes.exitCode !== 0) {
          compileSuccess = false;
          let rawErr = compRes.stderr || compRes.stdout || 'Compilation failed';
          compileOutput = rawErr.split(tempDir).join('').replace(/^[\\\/]+/, '');
        } else {
          for (const tc of testCases) {
            let input = tc.input !== undefined && tc.input !== null ? String(tc.input) : '';
            if (input && !input.endsWith('\n')) {
              input += '\n';
            }
            const expected = normalizeOutput(tc.expectedOutput);
            const res = await runProcess(exeFile, [], { cwd: tempDir }, input, timeLimitMs);
            maxTimeMs = Math.max(maxTimeMs, res.executionTimeMs);

            let status = 'PASSED';
            if (res.timedOut) {
              status = 'TIME_LIMIT';
            } else if (res.exitCode !== 0) {
              status = 'RUNTIME_ERROR';
            } else if (expected && normalizeOutput(res.stdout) !== expected) {
              status = 'FAILED';
            }

            results.push({
              testCaseId: tc.id || String(results.length + 1),
              status,
              executionTimeMs: res.executionTimeMs,
              actualOutput: tc.isHidden ? '[HIDDEN]' : res.stdout,
              expectedOutput: tc.isHidden ? '[HIDDEN]' : tc.expectedOutput,
              error: res.stderr ? res.stderr.slice(0, 1000) : null,
              isHidden: !!tc.isHidden
            });
          }
        }
      } else {
        // GCC not available — cannot compile C code, return honest error
        compileSuccess = false;
        compileOutput = 'C compiler (GCC) is not available on this execution host. Please contact the administrator.';
      }
    } else {
      return {
        overallStatus: 'COMPILE_ERROR',
        passedTestCases: 0,
        totalTestCases: testCases.length,
        scorePercent: 0,
        executionTimeMs: 0,
        memoryKb: 0,
        compileOutput: `Unsupported language: ${language}`,
        results: []
      };
    }

    if (!compileSuccess) {
      return {
        overallStatus: 'COMPILE_ERROR',
        passedTestCases: 0,
        totalTestCases: testCases.length,
        scorePercent: 0,
        executionTimeMs: 0,
        memoryKb: 0,
        compileOutput: compileOutput.slice(0, 2000),
        results: []
      };
    }

    const passedCount = results.filter((r) => r.status === 'PASSED').length;
    let overallStatus = 'FAILED';
    if (passedCount === results.length && results.length > 0) {
      overallStatus = 'PASSED';
    } else if (passedCount > 0) {
      overallStatus = 'PARTIAL';
    } else if (results.some((r) => r.status === 'TIME_LIMIT')) {
      overallStatus = 'TIME_LIMIT';
    } else if (results.some((r) => r.status === 'RUNTIME_ERROR')) {
      overallStatus = 'RUNTIME_ERROR';
    }

    const scorePercent = results.length > 0 ? (passedCount / results.length) * 100 : 0;

    return {
      overallStatus,
      passedTestCases: passedCount,
      totalTestCases: results.length,
      scorePercent: Math.round(scorePercent * 10) / 10,
      executionTimeMs: maxTimeMs,
      memoryKb: 0, // Not measured — requires OS-level cgroup monitoring
      compileOutput: compileOutput,
      results
    };
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'UP', service: 'code-runner', compilers: { gcc: hasGcc, java: hasJava, python: hasPython } }));
    return;
  }

  if (req.method === 'POST' && req.url === '/execute') {
    let body = '';
    const MAX_BODY_SIZE = 2 * 1024 * 1024; // 2MB max payload
    let exceeded = false;

    req.on('data', chunk => {
      if (exceeded) return;
      body += chunk.toString();
      if (body.length > MAX_BODY_SIZE) {
        exceeded = true;
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload too large (max 2MB)' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      if (exceeded) return;
      try {
        const payload = JSON.parse(body);
        if (!payload.language || !payload.sourceCode) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing language or sourceCode' }));
          return;
        }

        const testCases = Array.isArray(payload.testCases) ? payload.testCases : [];
        const result = await runnerQueue.enqueue(() => executeSubmission({
          language: payload.language,
          sourceCode: payload.sourceCode,
          testCases,
          timeLimitMs: payload.timeLimitMs || 2000,
          memoryLimitMb: payload.memoryLimitMb || 128
        }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[CodeRunner] Isolated Execution Service listening on 0.0.0.0:${PORT}`);
});
