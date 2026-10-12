import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:8080/api/v1';

async function postJson(endpoint, data, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = { raw: text };
  }
  return { status: res.status, ok: res.ok, data: json };
}

async function getJson(endpoint, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = { raw: text };
  }
  return { status: res.status, ok: res.ok, data: json };
}

test('E2E Smoke: Full Zero-Tolerance Integrity Pipeline', async (t) => {
  // 1. Register Fresh Participant for Complete Test Isolation
  const testEmail = `contestant_${Date.now()}@gct.ac.in`;
  const regRes = await postJson('/auth/register', {
    fullName: 'Integrity Tester',
    email: testEmail,
    password: 'Password@2026',
    phone: '9876543210',
    college: 'Gnanamani College of Technology',
    department: 'CSE',
    year: '3rd Year',
    programmingExp: 'Advanced'
  });
  assert.equal(regRes.status, 200, `Registration failed: ${JSON.stringify(regRes.data)}`);
  const participantToken = regRes.data.data?.token || regRes.data.token;
  assert.ok(participantToken, 'Participant token should be present');

  // 2. Fetch Active Rounds
  const roundsRes = await getJson('/rounds', participantToken);
  assert.equal(roundsRes.status, 200);
  const roundsList = roundsRes.data.data || roundsRes.data;
  const liveRound = roundsList.find(r => r.status === 'LIVE' || r.roundNumber === 1);
  assert.ok(liveRound, 'Live round 1 must exist');
  const roundId = liveRound.id;

  // 3. Start Competition Session with Zero-Tolerance Agreement
  const startSessionRes = await postJson('/integrity/session/start', {
    roundId,
    agreementAccepted: true
  }, participantToken);
  assert.equal(startSessionRes.status, 200, `Start session failed: ${JSON.stringify(startSessionRes.data)}`);
  const sessionData = startSessionRes.data.data || startSessionRes.data;
  assert.ok(sessionData.sessionToken, 'Session token should be returned');
  assert.ok(sessionData.currentQuestionId, 'Current question ID should be returned');
  assert.ok(sessionData.remainingSeconds > 0, 'Authoritative remaining seconds returned');
  const sessionToken = sessionData.sessionToken;
  const currentQId = sessionData.currentQuestionId;

  // 4. Record Deterrence Events (Fullscreen exit & clipboard attempt)
  const fsEventRes = await postJson('/integrity/event', {
    sessionToken,
    roundId,
    questionId: currentQId,
    eventType: 'FULLSCREEN_EXITED',
    eventContext: 'User pressed Escape or exited kiosk/fullscreen'
  }, participantToken);
  assert.equal(fsEventRes.status, 200, `Fullscreen event failed: ${JSON.stringify(fsEventRes.data)}`);

  const clipEventRes = await postJson('/integrity/event', {
    sessionToken,
    roundId,
    questionId: currentQId,
    eventType: 'PASTE_ATTEMPT',
    eventContext: 'Blocked paste attempt into code editor'
  }, participantToken);
  assert.equal(clipEventRes.status, 200, `Clipboard event failed: ${JSON.stringify(clipEventRes.data)}`);

  // 5. Simulate Tab Switch (Visibility Change: Hidden)
  const autoSubmitRes = await postJson('/integrity/tab-switch-submit', {
    sessionToken,
    roundId,
    questionId: currentQId,
    language: 'c',
    sourceCode: '#include <stdio.h>\nint main() { printf("YES"); return 0; }',
    idempotencyKey: `auto_tab_${Date.now()}`
  }, participantToken);
  assert.equal(autoSubmitRes.status, 200, `Tab switch submit failed: ${JSON.stringify(autoSubmitRes.data)}`);
  const tabSubmitData = autoSubmitRes.data.data || autoSubmitRes.data;
  assert.equal(tabSubmitData.isLocked, true, 'Question should be reported locked');
  assert.ok(tabSubmitData.submissionId, 'Submission should have been created');
  assert.notEqual(tabSubmitData.nextQuestionId, currentQId, 'Next question should be advanced');

  // 6. Verify Question is Permanently Locked against subsequent manual submissions
  const manualSubRes = await postJson('/submissions/submit', {
    questionId: currentQId,
    language: 'c',
    sourceCode: '#include <stdio.h>\nint main() { return 0; }'
  }, participantToken);
  assert.equal(manualSubRes.status, 409, 'Locked question submission must be rejected with 409 Conflict');
  const errorMsg = manualSubRes.data.error?.message || manualSubRes.data.message || JSON.stringify(manualSubRes.data);
  assert.match(errorMsg, /locked/i, 'Error message must specify question is locked');

  // 7. Admin Panel Verification
  const adminLoginRes = await postJson('/auth/login', {
    email: 'admin@gct.ac.in',
    password: 'Admin@2026'
  });
  assert.equal(adminLoginRes.status, 200);
  const adminToken = adminLoginRes.data.data?.token || adminLoginRes.data.token;

  const adminSessionsRes = await getJson('/admin/integrity/sessions', adminToken);
  assert.equal(adminSessionsRes.status, 200);
  const sessionList = adminSessionsRes.data.data || adminSessionsRes.data;
  const participantSession = sessionList.find(s => s.participantEmail === testEmail);
  assert.ok(participantSession, 'Participant session should appear in admin monitor');
  assert.ok(participantSession.tabSwitchCount >= 1, 'Tab switch count must be >= 1');
  assert.ok(participantSession.fullscreenExitCount >= 1, 'Fullscreen exit count must be >= 1');
  assert.ok(participantSession.clipboardAttemptCount >= 1, 'Clipboard attempt count must be >= 1');

  // 8. Judge Panel Audit Timeline Verification
  const judgeLoginRes = await postJson('/auth/login', {
    email: 'judge@gct.ac.in',
    password: 'Judge@2026'
  });
  assert.equal(judgeLoginRes.status, 200);
  const judgeToken = judgeLoginRes.data.data?.token || judgeLoginRes.data.token;

  const participantId = participantSession.participantId;
  const auditTimelineRes = await getJson(`/judge/integrity/events?participantId=${participantId}`, judgeToken);
  assert.equal(auditTimelineRes.status, 200);
  const events = auditTimelineRes.data.data || auditTimelineRes.data;
  assert.ok(events.length >= 4, 'Audit timeline should have multiple events');

  const eventTypes = events.map(e => e.eventType);
  assert.ok(eventTypes.includes('INTEGRITY_AGREEMENT_ACCEPTED'), 'Timeline contains agreement acceptance');
  assert.ok(eventTypes.includes('ROUND_STARTED'), 'Timeline contains round started');
  assert.ok(eventTypes.includes('FULLSCREEN_EXITED'), 'Timeline contains fullscreen exited');
  assert.ok(eventTypes.includes('PASTE_ATTEMPT'), 'Timeline contains paste attempt');
  assert.ok(eventTypes.includes('TAB_HIDDEN'), 'Timeline contains tab hidden');
  assert.ok(eventTypes.includes('AUTO_SUBMISSION_CONFIRMED'), 'Timeline contains auto submission confirmed');
  assert.ok(eventTypes.includes('QUESTION_LOCKED'), 'Timeline contains question locked');
  assert.ok(eventTypes.includes('QUESTION_ADVANCED'), 'Timeline contains question advanced');
});
