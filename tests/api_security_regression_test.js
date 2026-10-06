const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const BASE_URL = 'http://127.0.0.1:8080';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8080,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json,
          raw: data
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

test('Comprehensive API, Security & Regression Suite', async (t) => {

  let participantToken = '';
  let participantId = null;
  let adminToken = '';

  await t.test('1. Security Headers: Clickjacking protection (X-Frame-Options: SAMEORIGIN)', async () => {
    const res = await request({ path: '/api/v1/rounds', method: 'GET' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['x-frame-options']?.toUpperCase(), 'SAMEORIGIN', 'Clickjacking protection header must be SAMEORIGIN');
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
  });

  await t.test('2. Actuator Exposure: Actuator endpoints do not leak secrets or metadata', async () => {
    const env = await request({ path: '/actuator/env', method: 'GET' });
    assert.ok(env.statusCode === 401 || env.statusCode === 403 || env.statusCode === 404,
      `Actuator env endpoint must not be exposed! Got status: ${env.statusCode}`);

    const heapdump = await request({ path: '/actuator/heapdump', method: 'GET' });
    assert.ok(heapdump.statusCode === 401 || heapdump.statusCode === 403 || heapdump.statusCode === 404);
  });

  await t.test('3. Public Endpoints: rounds, leaderboard, and announcements are accessible without token', async () => {
    const rounds = await request({ path: '/api/v1/rounds', method: 'GET' });
    assert.strictEqual(rounds.statusCode, 200);
    assert.ok(rounds.data.success);
    assert.ok(Array.isArray(rounds.data.data));

    const lb = await request({ path: '/api/v1/leaderboard/live', method: 'GET' });
    assert.strictEqual(lb.statusCode, 200);
    assert.ok(lb.data.success);

    const ann = await request({ path: '/api/v1/announcements', method: 'GET' });
    assert.strictEqual(ann.statusCode, 200);
    assert.ok(ann.data.success);
  });

  await t.test('4. Registration: Valid user registration creates account & participant record', async () => {
    const email = `audit_student_${Date.now()}@gct.ac.in`;
    const res = await request({
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Audit Student',
      email: email,
      password: 'Password@2026',
      phone: '9876543210',
      college: 'Gnanamani College of Technology',
      department: 'CSE',
      year: '3rd Year',
      programmingExp: 'Advanced'
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.role, 'ROLE_PARTICIPANT');
    assert.ok(res.data.data.token);

    participantToken = res.data.data.token;
    participantId = res.data.data.participantId;
  });

  await t.test('5. Registration: Duplicate email is rejected with error', async () => {
    const res = await request({
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Duplicate Student',
      email: 'admin@gct.ac.in', // Existing email
      password: 'Password@2026',
      phone: '9876543210',
      college: 'GCT',
      department: 'CSE',
      year: '2nd Year',
      programmingExp: 'Beginner'
    });

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
  });

  await t.test('6. Authentication: Admin login with seeded credentials succeeds', async () => {
    const res = await request({
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@gct.ac.in',
      password: 'Admin@2026'
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.data.role, 'ROLE_ADMIN');
    assert.ok(res.data.data.token);
    adminToken = res.data.data.token;
  });

  await t.test('7. RBAC Protection: Participant is blocked from Admin endpoints (HTTP 403)', async () => {
    const res = await request({
      path: '/api/v1/admin/stats',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${participantToken}`
      }
    });

    assert.strictEqual(res.statusCode, 403, 'Participant must be forbidden from accessing admin endpoints');
  });

  await t.test('8. RBAC Protection: Participant is blocked from Judge endpoints (HTTP 403)', async () => {
    const res = await request({
      path: '/api/v1/judge/submissions',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${participantToken}`
      }
    });

    assert.strictEqual(res.statusCode, 403, 'Participant must be forbidden from accessing judge endpoints');
  });

  await t.test('9. RBAC Protection: Unauthenticated request to Admin endpoints is blocked (HTTP 403)', async () => {
    const res = await request({
      path: '/api/v1/admin/stats',
      method: 'GET'
    });

    assert.strictEqual(res.statusCode, 403);
  });

  await t.test('10. RBAC Authorization: Admin can access Admin and Judge endpoints', async () => {
    const stats = await request({
      path: '/api/v1/admin/stats',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert.strictEqual(stats.statusCode, 200);
    assert.ok(stats.data.success);

    const judgeSubs = await request({
      path: '/api/v1/judge/submissions',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert.strictEqual(judgeSubs.statusCode, 200);
  });

  await t.test('11. Leaderboard Freeze State: Admin can freeze and unfreeze leaderboard', async () => {
    // 1. Freeze leaderboard
    const freeze = await request({
      path: '/api/v1/admin/leaderboard/freeze?freeze=true',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert.strictEqual(freeze.statusCode, 200);

    // 2. Check status
    const statusRes = await request({ path: '/api/v1/leaderboard/status', method: 'GET' });
    assert.strictEqual(statusRes.statusCode, 200);
    assert.strictEqual(statusRes.data.data.frozen, true);

    // 3. Unfreeze leaderboard
    const unfreeze = await request({
      path: '/api/v1/admin/leaderboard/freeze?freeze=false',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert.strictEqual(unfreeze.statusCode, 200);

    const statusUnfrozen = await request({ path: '/api/v1/leaderboard/status', method: 'GET' });
    assert.strictEqual(statusUnfrozen.data.data.frozen, false);
  });

  await t.test('12. Audit Trail: Admin actions generate audit log entries with dynamic client IP', async () => {
    const logsRes = await request({
      path: '/api/v1/admin/audit-logs',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    assert.strictEqual(logsRes.statusCode, 200);
    assert.ok(Array.isArray(logsRes.data.data));
    assert.ok(logsRes.data.data.length > 0);
    const latestLog = logsRes.data.data[0];
    assert.ok(latestLog.userEmail);
    assert.ok(latestLog.action);
    assert.ok(latestLog.ipAddress);
    // Verified: Admin email is recorded as admin@gct.ac.in from authenticated token
    assert.strictEqual(latestLog.userEmail, 'admin@gct.ac.in');
  });
});
