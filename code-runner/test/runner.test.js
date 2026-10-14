const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

// Helper to make HTTP POST requests to code runner
function postExecute(payload, port = 5050) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: '/execute',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Helper to wait for the server to be ready before running tests
async function waitForServer(url = 'http://127.0.0.1:5050/health', maxRetries = 20, delayMs = 500) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const ok = await new Promise((resolve, reject) => {
        const req = http.get(url, (r) => {
          let body = '';
          r.on('data', c => body += c);
          r.on('end', () => resolve(r.statusCode === 200));
        });
        req.on('error', reject);
        req.setTimeout(1000, () => req.destroy(new Error('Timeout')));
      });
      if (ok) return true;
    } catch (e) {
      // Server not ready yet
    }
    await new Promise(r => setTimeout(r, delayMs));
  }
  throw new Error(`Server failed to start on ${url} within timeout`);
}

test('Code Runner Test Suite', async (t) => {
  t.before(async () => {
    await waitForServer();
  });

  await t.test('Health check responds with UP', async () => {
    const res = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:5050/health', (r) => {
        let body = '';
        r.on('data', c => body += c);
        r.on('end', () => resolve({ status: r.statusCode, data: JSON.parse(body) }));
      }).on('error', reject);
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'UP');
    assert.ok(res.data.compilers);
  });

  await t.test('Python execution: computes correct output', async () => {
    const payload = {
      language: 'python',
      sourceCode: 'import sys\nline = sys.stdin.read().strip()\nprint(f"HELLO_{line}")\n',
      testCases: [
        { id: 'tc-1', input: 'WORLD', expectedOutput: 'HELLO_WORLD', isHidden: false }
      ],
      timeLimitMs: 2000
    };

    const res = await postExecute(payload);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.overallStatus, 'PASSED');
    assert.strictEqual(res.data.results[0].status, 'PASSED');
    assert.strictEqual(res.data.results[0].actualOutput.trim(), 'HELLO_WORLD');
  });

  await t.test('Python execution: syntax error returns RUNTIME_ERROR', async () => {
    const payload = {
      language: 'python',
      sourceCode: 'def invalid_syntax(:\n',
      testCases: [
        { id: 'tc-syntax', input: '', expectedOutput: '', isHidden: false }
      ],
      timeLimitMs: 2000
    };

    const res = await postExecute(payload);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.overallStatus, 'RUNTIME_ERROR');
    assert.strictEqual(res.data.results[0].status, 'RUNTIME_ERROR');
  });

  await t.test('Python execution: timeout terminates infinite loop with TIME_LIMIT', async () => {
    const payload = {
      language: 'python',
      sourceCode: 'while True:\n    pass\n',
      testCases: [
        { id: 'tc-loop', input: '', expectedOutput: 'DONE', isHidden: false }
      ],
      timeLimitMs: 1000
    };

    const res = await postExecute(payload);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.overallStatus, 'TIME_LIMIT');
    assert.strictEqual(res.data.results[0].status, 'TIME_LIMIT');
  });

  await t.test('Security: Child process cannot access server environment variables (SAFE_ENV verified)', async () => {
    const payload = {
      language: 'python',
      sourceCode: 'import os\nprint("DB_URL=" + str(os.environ.get("DATABASE_URL")))\nprint("JWT=" + str(os.environ.get("JWT_SECRET")))\n',
      testCases: [
        { id: 'tc-sec', input: '', expectedOutput: '', isHidden: false }
      ],
      timeLimitMs: 2000
    };

    const res = await postExecute(payload);
    assert.strictEqual(res.status, 200);
    const output = res.data.results[0].actualOutput;
    assert.ok(output.includes('DB_URL=None'), 'Database URL must not leak to runner child processes!');
    assert.ok(output.includes('JWT=None'), 'JWT secret must not leak to runner child processes!');
  });

  await t.test('Security: Payload larger than 2MB is rejected with 413 Payload Too Large', async () => {
    // Generate 2.5MB payload
    const hugeCode = 'x = 1\n' + '# padding\n'.repeat(200000);
    const payload = {
      language: 'python',
      sourceCode: hugeCode,
      testCases: []
    };

    const res = await postExecute(payload);
    assert.strictEqual(res.status, 413);
  });
});
