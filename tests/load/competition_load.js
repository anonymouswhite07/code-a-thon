import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Metrics
const errorRate = new Rate('error_rate');
const submissionLatency = new Trend('submission_latency_ms');

// Scenarios configuration
export const options = {
  scenarios: {
    smoke_test: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      startTime: '0s',
      tags: { scenario: 'smoke_10_users' },
    },
    normal_traffic: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 25 },
        { duration: '1m', target: 25 },
        { duration: '30s', target: 0 },
      ],
      startTime: '35s',
      tags: { scenario: 'normal_25_users' },
    },
    competition_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 0 },
      ],
      startTime: '2m40s',
      tags: { scenario: 'competition_100_users' },
    },
    burst_submissions: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 100,
      maxDuration: '30s',
      startTime: '4m45s',
      tags: { scenario: 'burst_100_concurrent_submissions' },
    },
  },
  thresholds: {
    'http_req_duration': ['p(95)<1500', 'p(99)<3000'],
    'error_rate': ['rate<0.05'], // < 5% error rate under peak load
  },
};

const BASE_URL = __ENV.API_URL || 'http://127.0.0.1:8080';

export default function () {
  group('Public & Participant Flows', () => {
    // 1. Fetch rounds
    const roundsRes = http.get(`${BASE_URL}/api/v1/rounds`);
    check(roundsRes, {
      'rounds status 200': (r) => r.status === 200,
      'has round data': (r) => JSON.parse(r.body).data.length > 0,
    }) || errorRate.add(1);

    // 2. Fetch live leaderboard
    const lbRes = http.get(`${BASE_URL}/api/v1/leaderboard/live`);
    check(lbRes, {
      'leaderboard status 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    // 3. Announcements
    const annRes = http.get(`${BASE_URL}/api/v1/announcements`);
    check(annRes, {
      'announcements status 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(1);
  });

  group('Authentication Flow', () => {
    // Participant Login
    const loginPayload = JSON.stringify({
      email: 'admin@gct.ac.in',
      password: 'Admin@2026',
    });

    const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
    });

    const loginSuccess = check(loginRes, {
      'login status 200': (r) => r.status === 200,
      'token present': (r) => JSON.parse(r.body).data.token !== undefined,
    });

    if (!loginSuccess) {
      errorRate.add(1);
      return;
    }

    const token = JSON.parse(loginRes.body).data.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // Authenticated me check
    const meRes = http.get(`${BASE_URL}/api/v1/auth/me`, { headers: authHeaders });
    check(meRes, {
      'me status 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(1);
  });
}
