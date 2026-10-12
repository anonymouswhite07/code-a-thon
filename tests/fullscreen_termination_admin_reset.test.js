import assert from 'node:assert';
import test from 'node:test';

const BACKEND_URL = 'http://localhost:8080/api/v1';

test('E2E Fullscreen Exit Termination and Admin Restart Flow', async (t) => {
  // 1. Login as Admin
  const adminRes = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gct.ac.in', password: 'Admin@2026' })
  });
  const adminData = await adminRes.json();
  assert.strictEqual(adminRes.status, 200);
  const adminToken = adminData.data.token;

  // 2. Register fresh participant
  const uniqueId = Date.now();
  const regRes = await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: `Fullscreen Test User ${uniqueId}`,
      email: `fs_test_${uniqueId}@gct.ac.in`,
      password: 'password123',
      phone: '9876543210',
      college: 'GCT',
      department: 'CSE',
      year: '3rd Year'
    })
  });
  const regData = await regRes.json();
  assert.strictEqual(regRes.status, 200);
  const participantToken = regData.data.token;

  // 3. Start competition session for Round 1
  const startRes = await fetch(`${BACKEND_URL}/integrity/session/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${participantToken}`
    },
    body: JSON.stringify({ roundId: 1, agreementAccepted: true })
  });
  const startData = (await startRes.json()).data;
  assert.strictEqual(startRes.status, 200);
  const sessionToken = startData.sessionToken;
  assert.ok(sessionToken, 'Session token should be present');

  // 4. Verify session is ACTIVE initially
  const statusRes1 = await fetch(`${BACKEND_URL}/integrity/session/status?roundId=1`, {
    headers: { 'Authorization': `Bearer ${participantToken}` }
  });
  const status1 = (await statusRes1.json()).data;
  assert.strictEqual(status1.status, 'ACTIVE');

  // 5. Trigger Fullscreen Exit Termination (Participant pressed Esc / exited fullscreen)
  const termRes = await fetch(`${BACKEND_URL}/integrity/session/fullscreen-exit-terminate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${participantToken}`
    },
    body: JSON.stringify({
      sessionToken,
      roundId: 1,
      questionId: status1.currentQuestionId || 1,
      language: 'c',
      sourceCode: '#include <stdio.h>\nint main(){ return 0; }'
    })
  });
  const termData = (await termRes.json()).data;
  assert.strictEqual(termRes.status, 200);
  assert.strictEqual(termData.status, 'TERMINATED_FULLSCREEN');
  assert.strictEqual(termData.isTerminated, true);

  // 6. Verify session status on backend is now TERMINATED_FULLSCREEN
  const statusRes2 = await fetch(`${BACKEND_URL}/integrity/session/status?roundId=1`, {
    headers: { 'Authorization': `Bearer ${participantToken}` }
  });
  const status2 = (await statusRes2.json()).data;
  assert.strictEqual(status2.status, 'TERMINATED_FULLSCREEN');

  // 7. Verify Admin sees the terminated session in the live sessions list
  const sessionsRes = await fetch(`${BACKEND_URL}/admin/integrity/sessions?roundId=1`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const sessions = (await sessionsRes.json()).data;
  const ourSession = sessions.find((s) => s.participantEmail === `fs_test_${uniqueId}@gct.ac.in`);
  assert.ok(ourSession, 'Session should be visible to admin');
  assert.strictEqual(ourSession.status, 'TERMINATED_FULLSCREEN');

  // 8. Admin restarts round for this session
  const resetRes = await fetch(`${BACKEND_URL}/admin/integrity/sessions/${ourSession.sessionId}/reset`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const resetData = (await resetRes.json()).data;
  assert.strictEqual(resetRes.status, 200);
  assert.strictEqual(resetData.status, 'ACTIVE');

  // 9. Verify participant status is back to ACTIVE with questions unlocked
  const statusRes3 = await fetch(`${BACKEND_URL}/integrity/session/status?roundId=1`, {
    headers: { 'Authorization': `Bearer ${participantToken}` }
  });
  const status3 = (await statusRes3.json()).data;
  assert.strictEqual(status3.status, 'ACTIVE');
  assert.strictEqual((status3.lockedQuestionIds || []).length, 0);

  // 10. Check Admin Audit Trail for ADMIN_ROUND_RESET
  const eventsRes = await fetch(`${BACKEND_URL}/admin/integrity/events?roundId=1`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const events = (await eventsRes.json()).data;
  const resetEvent = events.find(
    (e) => e.eventType === 'ADMIN_ROUND_RESET' && e.participantName.includes(String(uniqueId))
  );
  assert.ok(resetEvent, 'ADMIN_ROUND_RESET audit event should be logged');
});
