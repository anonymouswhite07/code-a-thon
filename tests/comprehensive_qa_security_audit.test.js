import { test } from 'node:test';
import assert from 'node:assert/strict';

const BACKEND_URL = 'http://127.0.0.1:8080/api/v1';
const FRONTEND_URL = 'http://127.0.0.1:3000';
const RUNNER_URL = 'http://127.0.0.1:5050';

async function fetchBackend(path, options = {}) {
  const url = `${BACKEND_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { json = { raw: text }; }
  return { status: res.status, headers: res.headers, data: json, text };
}

test('COMPREHENSIVE CODE-A-THON QA & SECURITY AUDIT SUITE', async (t) => {

  let testParticipantEmail = '';
  let participantToken = '';
  let participantId = null;
  let adminToken = '';
  let judgeToken = '';
  let liveRoundId = null;
  let firstQuestionId = null;
  let secondQuestionId = null;
  let sessionToken = '';

  // =========================================================================
  // 1. HTTP SECURITY HEADERS & ACTUATOR PROTECTION
  // =========================================================================
  await t.test('1. Security Headers: Clickjacking and MIME sniffing protections', async () => {
    const res = await fetchBackend('/rounds');
    assert.equal(res.status, 200);
    const xfo = res.headers.get('x-frame-options');
    const xcto = res.headers.get('x-content-type-options');
    assert.equal(xfo?.toUpperCase(), 'SAMEORIGIN', 'X-Frame-Options must be SAMEORIGIN');
    assert.equal(xcto?.toLowerCase(), 'nosniff', 'X-Content-Type-Options must be nosniff');
  });

  await t.test('2. Information Leakage: Actuator sensitive endpoints are blocked', async () => {
    const envRes = await fetch('http://127.0.0.1:8080/actuator/env');
    assert.ok([401, 403, 404].includes(envRes.status), `actuator/env must not be exposed, got ${envRes.status}`);

    const heapRes = await fetch('http://127.0.0.1:8080/actuator/heapdump');
    assert.ok([401, 403, 404].includes(heapRes.status), `actuator/heapdump must not be exposed, got ${heapRes.status}`);
  });

  // =========================================================================
  // 2. RATE LIMITING ENFORCEMENT
  // =========================================================================
  await t.test('3. Rate Limiting: Authentication endpoint throttles bursts (> 20 req/min/IP) with HTTP 429', async () => {
    const spoofIp = `198.51.100.${Math.floor(Math.random() * 200) + 1}`;
    let rateLimited = false;
    let rateLimitResponse = null;

    // Send fast requests (handled before controller/BCrypt execution)
    for (let i = 1; i <= 25; i++) {
      const res = await fetchBackend('/auth/login', {
        method: 'POST',
        headers: { 'X-Forwarded-For': spoofIp },
        body: { email: 'ratelimit@gct.ac.in', password: '' }
      });

      if (res.status === 429) {
        rateLimited = true;
        rateLimitResponse = res;
        break;
      }
    }

    assert.ok(rateLimited, 'Auth endpoint must trigger HTTP 429 Too Many Requests within 25 rapid attempts');
    assert.equal(rateLimitResponse.status, 429);
    assert.equal(rateLimitResponse.headers.get('retry-after'), '60');
    assert.equal(rateLimitResponse.headers.get('x-ratelimit-remaining'), '0');
    assert.equal(rateLimitResponse.data?.error?.code, 'TOO_MANY_REQUESTS');
  });

  // =========================================================================
  // 3. AUTHENTICATION & INPUT VALIDATION
  // =========================================================================
  await t.test('4. Registration: Invalid email format is rejected (HTTP 400)', async () => {
    const res = await fetchBackend('/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Bad User',
        email: 'invalid-email-no-domain',
        password: 'ValidPassword123',
        phone: '9876543210',
        college: 'GCT',
        department: 'CSE',
        year: '3rd Year'
      }
    });
    assert.equal(res.status, 400);
    assert.equal(res.data?.success, false);
  });

  await t.test('5. Registration: Short password (< 6 chars) is rejected (HTTP 400)', async () => {
    const res = await fetchBackend('/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Short Pass User',
        email: `shortpass_${Date.now()}@gct.ac.in`,
        password: '123',
        phone: '9876543210',
        college: 'GCT',
        department: 'CSE',
        year: '3rd Year'
      }
    });
    assert.equal(res.status, 400);
    assert.equal(res.data?.success, false);
  });

  await t.test('6. Registration: Valid participant registration succeeds with JWT token', async () => {
    testParticipantEmail = `qa_contestant_${Date.now()}@gct.ac.in`;
    const res = await fetchBackend('/auth/register', {
      method: 'POST',
      body: {
        fullName: 'QA Master Contestant',
        email: testParticipantEmail,
        password: 'ValidSecret@2026',
        phone: '9876543210',
        college: 'Gnanamani College of Technology',
        department: 'Computer Science & Engineering',
        year: '3rd Year',
        programmingExp: 'Advanced'
      }
    });
    assert.equal(res.status, 200);
    assert.ok(res.data?.data?.token);
    assert.equal(res.data?.data?.role, 'ROLE_PARTICIPANT');
    participantToken = res.data.data.token;
    participantId = res.data.data.participantId;
  });

  await t.test('7. Registration: Duplicate email registration is prevented (HTTP 400)', async () => {
    const res = await fetchBackend('/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Duplicate Contestant',
        email: testParticipantEmail,
        password: 'ValidSecret@2026',
        phone: '9876543210',
        college: 'GCT',
        department: 'CSE',
        year: '3rd Year'
      }
    });
    assert.equal(res.status, 400);
    assert.equal(res.data?.success, false);
  });

  await t.test('8. Authentication: Admin & Judge logins with credentials generate proper roles', async () => {
    const adminRes = await fetchBackend('/auth/login', {
      method: 'POST',
      body: { email: 'admin@gct.ac.in', password: 'Admin@2026' }
    });
    assert.equal(adminRes.status, 200);
    assert.equal(adminRes.data?.data?.role, 'ROLE_ADMIN');
    adminToken = adminRes.data.data.token;

    const judgeRes = await fetchBackend('/auth/login', {
      method: 'POST',
      body: { email: 'judge@gct.ac.in', password: 'Judge@2026' }
    });
    assert.equal(judgeRes.status, 200);
    assert.equal(judgeRes.data?.data?.role, 'ROLE_JUDGE');
    judgeToken = judgeRes.data.data.token;
  });

  // =========================================================================
  // 4. ROLE-BASED ACCESS CONTROL (RBAC)
  // =========================================================================
  await t.test('9. RBAC: Participant is strictly forbidden from Admin endpoints (HTTP 403)', async () => {
    const res = await fetchBackend('/admin/stats', {
      headers: { 'Authorization': `Bearer ${participantToken}` }
    });
    assert.equal(res.status, 403);
  });

  await t.test('10. RBAC: Participant is strictly forbidden from Judge endpoints (HTTP 403)', async () => {
    const res = await fetchBackend('/judge/submissions', {
      headers: { 'Authorization': `Bearer ${participantToken}` }
    });
    assert.equal(res.status, 403);
  });

  await t.test('11. RBAC: Judge cannot access Admin control endpoints (HTTP 403)', async () => {
    const res = await fetchBackend('/admin/stats', {
      headers: { 'Authorization': `Bearer ${judgeToken}` }
    });
    assert.equal(res.status, 403);
  });

  await t.test('12. RBAC: Tampered/Bogus JWT token is rejected (HTTP 401/403)', async () => {
    const res = await fetchBackend('/submissions/my-submissions', {
      headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.bogusPayload.invalidSignature' }
    });
    assert.ok(res.status === 401 || res.status === 403, `Expected 401 or 403, received ${res.status}`);
  });

  // =========================================================================
  // 5. ZERO-TOLERANCE INTEGRITY & SESSION STATE MACHINE
  // =========================================================================
  await t.test('13. Integrity: Starting session without explicit agreement is rejected', async () => {
    const roundsRes = await fetchBackend('/rounds', {
      headers: { 'Authorization': `Bearer ${participantToken}` }
    });
    assert.equal(roundsRes.status, 200);
    const liveRound = roundsRes.data.data.find(r => r.status === 'LIVE' || r.roundNumber === 1);
    assert.ok(liveRound, 'Live round 1 must exist');
    liveRoundId = liveRound.id;

    const noAgreeRes = await fetchBackend('/integrity/session/start', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: { roundId: liveRoundId, agreementAccepted: false }
    });
    assert.equal(noAgreeRes.status, 400, 'Agreement must be required');
  });

  await t.test('14. Integrity: Starting session with agreement returns session token & current question', async () => {
    const startRes = await fetchBackend('/integrity/session/start', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: { roundId: liveRoundId, agreementAccepted: true }
    });
    assert.equal(startRes.status, 200);
    const sess = startRes.data.data;
    assert.ok(sess.sessionToken);
    assert.ok(sess.currentQuestionId);
    assert.ok(sess.remainingSeconds > 0);
    sessionToken = sess.sessionToken;
    firstQuestionId = sess.currentQuestionId;
  });

  await t.test('15. Integrity: Fullscreen and clipboard violation events increment audit counters', async () => {
    const fsRes = await fetchBackend('/integrity/event', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: {
        sessionToken,
        roundId: liveRoundId,
        questionId: firstQuestionId,
        eventType: 'FULLSCREEN_EXITED',
        eventContext: 'User exited fullscreen window'
      }
    });
    assert.equal(fsRes.status, 200);

    const pasteRes = await fetchBackend('/integrity/event', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: {
        sessionToken,
        roundId: liveRoundId,
        questionId: firstQuestionId,
        eventType: 'PASTE_ATTEMPT',
        eventContext: 'External paste blocked in editor'
      }
    });
    assert.equal(pasteRes.status, 200);
  });

  await t.test('16. Zero-Tolerance: Tab switch triggers automatic submission, locks question, and advances', async () => {
    const tabRes = await fetchBackend('/integrity/tab-switch-submit', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: {
        sessionToken,
        roundId: liveRoundId,
        questionId: firstQuestionId,
        language: 'c',
        sourceCode: '#include <stdio.h>\nint main() { printf("YES"); return 0; }',
        idempotencyKey: `auto_smoke_${Date.now()}`
      }
    });
    assert.equal(tabRes.status, 200);
    const tabData = tabRes.data.data;
    assert.equal(tabData.isLocked, true, 'Question must be reported locked');
    assert.ok(tabData.submissionId, 'Auto submission must be created');
    assert.ok(tabData.nextQuestionId, 'Next question must be selected');
    assert.notEqual(tabData.nextQuestionId, firstQuestionId);
    secondQuestionId = tabData.nextQuestionId;
  });

  await t.test('17. Zero-Tolerance: Re-submitting to locked question is rejected with HTTP 409 Conflict', async () => {
    const subRes = await fetchBackend('/submissions/submit', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: {
        questionId: firstQuestionId,
        language: 'c',
        sourceCode: 'int main() { return 0; }'
      }
    });
    assert.equal(subRes.status, 409, 'Locked question must return 409 Conflict');
    const msg = subRes.data?.error?.message || subRes.data?.message || '';
    assert.match(msg, /permanently locked/i);
  });

  await t.test('18. Zero-Tolerance: Tab switch auto-submit idempotency returns existing lock without re-evaluating', async () => {
    const repeatRes = await fetchBackend('/integrity/tab-switch-submit', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: {
        sessionToken,
        roundId: liveRoundId,
        questionId: firstQuestionId,
        language: 'c',
        sourceCode: 'int main() {}',
        idempotencyKey: `auto_smoke_repeat_${Date.now()}`
      }
    });
    assert.equal(repeatRes.status, 200);
    assert.equal(repeatRes.data.data.isLocked, true);
    assert.equal(repeatRes.data.data.questionId, firstQuestionId);
  });

  // =========================================================================
  // 6. SUBMISSION ANTI-ABUSE: COOLDOWN & DUPLICATE CHECKS
  // =========================================================================
  await t.test('19. Submission Cooldown: Rapid submissions on unlocked question are throttled (< 5s)', async () => {
    // Wait for the 5-second cooldown from Test 16's auto-submission to clear
    await new Promise(r => setTimeout(r, 5200));

    // 1st submission on question 2
    const sub1 = await fetchBackend('/submissions/submit', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: {
        questionId: secondQuestionId,
        language: 'c',
        sourceCode: '#include <stdio.h>\nint main() { printf("1"); return 0; }'
      }
    });
    assert.equal(sub1.status, 200, `First submission after cooldown must succeed: ${JSON.stringify(sub1.data)}`);

    // 2nd rapid submission immediately after (< 5s) must be blocked
    const sub2 = await fetchBackend('/submissions/submit', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: {
        questionId: secondQuestionId,
        language: 'c',
        sourceCode: '#include <stdio.h>\nint main() { printf("2"); return 0; }'
      }
    });
    assert.equal(sub2.status, 409, 'Rapid submission must trigger cooldown rejection');
    const msg = sub2.data?.error?.message || sub2.data?.message || '';
    assert.match(msg, /cooldown/i);
  });

  // =========================================================================
  // 7. ADMIN & JUDGE AUDIT VISIBILITY
  // =========================================================================
  await t.test('20. Admin Monitor: Session appears in admin overview with accurate violation counters', async () => {
    const adminSessRes = await fetchBackend('/admin/integrity/sessions', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.equal(adminSessRes.status, 200);
    const sessions = adminSessRes.data.data;
    const contestantSess = sessions.find(s => s.participantEmail === testParticipantEmail);
    assert.ok(contestantSess, 'Contestant session must appear in admin list');
    assert.ok(contestantSess.tabSwitchCount >= 1, 'Tab switch count must be >= 1');
    assert.ok(contestantSess.fullscreenExitCount >= 1, 'Fullscreen exit count must be >= 1');
    assert.ok(contestantSess.clipboardAttemptCount >= 1, 'Clipboard attempt count must be >= 1');
  });

  await t.test('21. Judge Audit Trail: Full chronological event timeline is accessible to Judges', async () => {
    const judgeEventsRes = await fetchBackend(`/judge/integrity/events?participantId=${participantId}`, {
      headers: { 'Authorization': `Bearer ${judgeToken}` }
    });
    assert.equal(judgeEventsRes.status, 200);
    const events = judgeEventsRes.data.data;
    assert.ok(events.length >= 4);

    const types = events.map(e => e.eventType);
    assert.ok(types.includes('INTEGRITY_AGREEMENT_ACCEPTED'));
    assert.ok(types.includes('ROUND_STARTED'));
    assert.ok(types.includes('FULLSCREEN_EXITED'));
    assert.ok(types.includes('PASTE_ATTEMPT'));
    assert.ok(types.includes('TAB_HIDDEN'));
    assert.ok(types.includes('QUESTION_LOCKED'));
  });

  // =========================================================================
  // 8. FRONTEND DELIVERABILITY & ROUTE HEALTH
  // =========================================================================
  await t.test('22. Frontend Deliverability: All user-facing pages load successfully (HTTP 200)', async () => {
    const routes = ['/', '/login', '/register', '/dashboard', '/compete/1', '/admin', '/judge'];
    for (const route of routes) {
      const res = await fetch(`${FRONTEND_URL}${route}`);
      assert.equal(res.status, 200, `Route ${route} must return HTTP 200`);
      const html = await res.text();
      assert.ok(html.includes('<!DOCTYPE html>') || html.includes('<html'), `Route ${route} must deliver HTML`);
    }
  });

  // =========================================================================
  // 9. CODERUNNER ISOLATED SANDBOX
  // =========================================================================
  await t.test('23. CodeRunner Sandbox: Isolated execution service is alive and healthy', async () => {
    const res = await fetch(`${RUNNER_URL}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'UP');
  });
});
