const http = require('http');

async function makeRequest(options, postData = null) {
  const start = Date.now();
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({
          statusCode: res.statusCode,
          duration,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 0,
        duration: Date.now() - start,
        success: false,
        error: err.message
      });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function calculatePercentiles(latencies) {
  if (latencies.length === 0) return { p50: 0, p95: 0, p99: 0, avg: 0, min: 0, max: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.50)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const avg = Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length);
  return { p50, p95, p99, avg, min: sorted[0], max: sorted[sorted.length - 1] };
}

async function runScenario(scenarioName, concurrentUsers, totalRequests, endpoint, method = 'GET', postData = null) {
  console.log(`\n========================================`);
  console.log(`[LOAD TEST] Running: ${scenarioName}`);
  console.log(`Concurrency: ${concurrentUsers} concurrent users | Total Requests: ${totalRequests}`);
  console.log(`Endpoint: ${method} ${endpoint}`);
  console.log(`========================================`);

  const results = [];
  let completed = 0;
  const startTime = Date.now();

  const [path] = endpoint.split('?');

  const options = {
    hostname: '127.0.0.1',
    port: 8080,
    path: endpoint,
    method: method,
    headers: {
      'Accept': 'application/json',
      'X-Forwarded-For': '192.168.1.100'
    }
  };

  if (postData) {
    options.headers['Content-Type'] = 'application/json';
    options.headers['Content-Length'] = Buffer.byteLength(postData);
  }

  // Worker queue
  let requestIndex = 0;
  async function worker() {
    while (requestIndex < totalRequests) {
      requestIndex++;
      const res = await makeRequest(options, postData);
      results.push(res);
      completed++;
    }
  }

  const workers = [];
  for (let i = 0; i < concurrentUsers; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  const totalTimeSeconds = (Date.now() - startTime) / 1000;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const latencies = results.map(r => r.duration);
  const stats = calculatePercentiles(latencies);
  const rps = Math.round((totalRequests / totalTimeSeconds) * 10) / 10;
  const errorRate = Math.round((failed / totalRequests) * 1000) / 10;

  console.log(`Completed ${completed} requests in ${totalTimeSeconds.toFixed(2)}s`);
  console.log(`Success: ${successful} | Failed: ${failed} | Error Rate: ${errorRate}%`);
  console.log(`Throughput: ${rps} req/sec`);
  console.log(`Latency: p50=${stats.p50}ms | p95=${stats.p95}ms | p99=${stats.p99}ms | Avg=${stats.avg}ms (Min=${stats.min}ms, Max=${stats.max}ms)`);

  return {
    scenario: scenarioName,
    concurrentUsers,
    totalRequests,
    throughputRps: rps,
    latencies: stats,
    errorRatePercent: errorRate,
    successful,
    failed
  };
}

async function runAll() {
  console.log("Waiting for backend on port 8080 to be ready...");
  let ready = false;
  for (let i = 0; i < 30; i++) {
    const res = await makeRequest({ hostname: '127.0.0.1', port: 8080, path: '/api/v1/rounds', method: 'GET' });
    if (res.statusCode === 200) {
      ready = true;
      break;
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  if (!ready) {
    console.error("Backend failed to become ready on port 8080 after 30 seconds.");
    process.exit(1);
  }
  console.log("Backend is ready! Beginning automated load tests.\n");

  const summary = [];

  // Scenario 1: Smoke (10 users)
  summary.push(await runScenario("SMOKE_TEST", 10, 100, "/api/v1/rounds"));

  // Scenario 2: Normal (25 users)
  summary.push(await runScenario("NORMAL_TRAFFIC", 25, 250, "/api/v1/leaderboard/live"));

  // Scenario 3: Target (50 users)
  summary.push(await runScenario("TARGET_LOAD", 50, 500, "/api/v1/announcements"));

  // Scenario 4: Competition Peak (100 concurrent participants)
  summary.push(await runScenario("COMPETITION_PEAK", 100, 1000, "/api/v1/rounds"));

  // Scenario 5: Burst Auth (50 concurrent logins)
  const loginBody = JSON.stringify({ email: 'admin@gct.ac.in', password: 'Admin@2026' });
  summary.push(await runScenario("BURST_AUTH_LOGIN", 50, 150, "/api/v1/auth/login", "POST", loginBody));

  console.log("\n========================================");
  console.log("LOAD TEST EXECUTION SUMMARY (MEASURED VALUES)");
  console.log("========================================");
  console.table(summary.map(s => ({
    Scenario: s.scenario,
    Users: s.concurrentUsers,
    Requests: s.totalRequests,
    RPS: s.throughputRps,
    'p50 (ms)': s.latencies.p50,
    'p95 (ms)': s.latencies.p95,
    'p99 (ms)': s.latencies.p99,
    'Error %': s.errorRatePercent + '%'
  })));

  process.exit(0);
}

runAll().catch(err => {
  console.error(err);
  process.exit(1);
});
