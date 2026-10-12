import { test } from 'node:test';
import assert from 'node:assert/strict';

const BACKEND_URL = 'http://127.0.0.1:8080/api/v1';

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('QUESTION LOCKING, SEQUENTIAL ADVANCEMENT & -25 PENALTY SUITE (ROUND 2 PYTHON)', async (t) => {
  const unique = Date.now();
  let adminToken = '';
  let participantToken = '';
  let round2Id = 2;
  let q1Id = null;
  let q2Id = null;
  let q3Id = null;
  let sessionToken = '';

  // 1. Login as Admin and start Round 2
  await t.test('1. Admin starts Round 2 (LIVE)', async () => {
    const adminRes = await fetchBackend('/auth/login', {
      method: 'POST',
      body: { email: 'admin@gct.ac.in', password: 'Admin@2026' }
    });
    assert.equal(adminRes.status, 200);
    adminToken = adminRes.data.data.token;
    assert.ok(adminToken);

    // Start Round 2
    const startRoundRes = await fetchBackend('/admin/rounds/2/control', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: { action: 'START', durationMinutes: 60 }
    });
    assert.equal(startRoundRes.status, 200);
    assert.equal(startRoundRes.data.data.status, 'LIVE');
  });

  // 2. Register test participant
  await t.test('2. Register test participant', async () => {
    const res = await fetchBackend('/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Locking Penalty Test User',
        email: `locking_penalty_${unique}@gct.ac.in`,
        password: 'Password@2026',
        phone: '9876543210',
        college: 'GCT',
        department: 'CSE',
        year: '3rd Year'
      }
    });
    assert.equal(res.status, 200);
    participantToken = res.data.data.token;
    assert.ok(participantToken);
  });

  // 3. Fetch Round 2 details and question IDs
  await t.test('3. Fetch Round 2 questions', async () => {
    const res = await fetchBackend('/rounds', {
      headers: { 'Authorization': `Bearer ${participantToken}` }
    });
    assert.equal(res.status, 200);
    const r2 = res.data.data.find(r => r.roundNumber === 2);
    assert.ok(r2, 'Round 2 must exist');
    round2Id = r2.id;

    const questionsRes = await fetchBackend(`/questions/round/${round2Id}`, {
      headers: { 'Authorization': `Bearer ${participantToken}` }
    });
    assert.equal(questionsRes.status, 200);
    const questions = questionsRes.data.data;
    assert.ok(questions && questions.length >= 3, 'Round 2 must have at least 3 questions');
    q1Id = questions[0].id;
    q2Id = questions[1].id;
    q3Id = questions[2].id;
  });

  // 4. Start competition session for Round 2
  await t.test('4. Start Round 2 session and verify Q1 is in use', async () => {
    const res = await fetchBackend('/integrity/session/start', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: { roundId: round2Id, agreementAccepted: true }
    });
    assert.equal(res.status, 200);
    sessionToken = res.data.data.sessionToken;
    assert.equal(res.data.data.currentQuestionId, q1Id, 'First question should be Q1');
  });

  // 5. Attempt to advance to Q2 before any submission on Q1 -> MUST BE REJECTED
  await t.test('5. Advance before submitting Q1 is rejected with 400/409', async () => {
    const res = await fetchBackend('/integrity/question/advance', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: {
        roundId: round2Id,
        currentQuestionId: q1Id,
        nextQuestionId: q2Id
      }
    });
    assert.ok(res.status === 400 || res.status === 409, `Must reject advancing without at least 1 submission, got ${res.status}`);
    const msg = res.data?.error?.message || res.data?.message || '';
    assert.match(msg, /at least 1 solution/i);
  });

  // 6. Attempt to submit directly to future question Q2 before completing Q1 -> MUST BE REJECTED
  await t.test('6. Submitting directly to future question Q2 is rejected by sequential progression check', async () => {
    const res = await fetchBackend('/submissions/submit', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: {
        questionId: q2Id,
        language: 'python',
        sourceCode: 'print("skip")',
        idempotencyKey: `skip_attempt_${unique}`
      }
    });
    assert.ok(res.status === 400 || res.status === 409, `Must reject submitting to Q2 when Q1 has not been submitted, got ${res.status}`);
    const msg = res.data?.error?.message || res.data?.message || '';
    assert.match(msg, /at least 1 solution/i);
  });

  // 7. Submit WRONG answer to Q1 -> evaluated to WRONG_ANSWER, 0 points
  await t.test('7. Wrong submission to Q1 receives 0 points and counts as wrong attempt', async () => {
    const res = await fetchBackend('/submissions/submit', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: {
        questionId: q1Id,
        language: 'python',
        sourceCode: 'import sys\nprint("WRONG_OUTPUT_TOTALLY")\n',
        idempotencyKey: `wrong_sub_1_${unique}`
      }
    });
    assert.equal(res.status, 200);
    const sub = res.data.data;
    assert.notEqual(sub.status, 'PASSED', 'Submission should not pass');
    assert.equal(sub.score, 0, 'Wrong submission must receive 0 score');
  });

  // 8. Submit CORRECT answer to Q1 after cooldown -> evaluated to PASSED with -25 penalty
  await t.test('8. Correct submission after 1 wrong attempt gets score reduced by 25 penalty', async () => {
    // Wait out 5.2s cooldown to comply with submission rate limiter
    await sleep(5200);

    const code = 'import sys\ns = sys.stdin.read().strip()\nif s == s[::-1]:\n    print("YES")\nelse:\n    print("NO")\n';

    const res = await fetchBackend('/submissions/submit', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: {
        questionId: q1Id,
        language: 'python',
        sourceCode: code,
        idempotencyKey: `correct_sub_1_${unique}`
      }
    });
    assert.equal(res.status, 200);
    const sub = res.data.data;
    assert.equal(sub.status, 'PASSED', 'Submission should pass');
    // Raw score is 100. 1 prior wrong attempt -> penalty is 25 -> finalScore is 75!
    assert.equal(sub.score, 75, 'Score should be 100 - 25 = 75 points');
  });

  // 9. Now that Q1 has submissions, advance to Q2 -> Locks Q1 permanently
  await t.test('9. Advancing from Q1 to Q2 locks Q1 and updates active session', async () => {
    const res = await fetchBackend('/integrity/question/advance', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: {
        roundId: round2Id,
        currentQuestionId: q1Id,
        nextQuestionId: q2Id
      }
    });
    assert.equal(res.status, 200);
    const data = res.data.data;
    assert.ok(data.lockedQuestionIds.includes(q1Id), 'Q1 must be in lockedQuestionIds');
    assert.equal(data.activeQuestionId, q2Id, 'Active question must now be Q2');
  });

  // 10. Re-submitting to locked question Q1 is strictly rejected (HTTP 409 Conflict)
  await t.test('10. Submitting to permanently locked question Q1 is rejected with HTTP 409', async () => {
    const res = await fetchBackend('/submissions/submit', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: {
        questionId: q1Id,
        language: 'python',
        sourceCode: 'print("hello")',
        idempotencyKey: `locked_resub_${unique}`
      }
    });
    assert.equal(res.status, 409, 'Must be rejected with 409 Conflict');
    const msg = res.data?.error?.message || res.data?.message || '';
    assert.match(msg, /locked/i);
  });

  // 11. Attempt to advance to Q3 without any submission on Q2 -> MUST BE REJECTED
  await t.test('11. Advancing to Q3 without submitting Q2 is rejected', async () => {
    const res = await fetchBackend('/integrity/question/advance', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${participantToken}` },
      body: {
        roundId: round2Id,
        currentQuestionId: q2Id,
        nextQuestionId: q3Id
      }
    });
    assert.ok(res.status === 400 || res.status === 409, `Must reject advancing from Q2 without submission, got ${res.status}`);
    const msg = res.data?.error?.message || res.data?.message || '';
    assert.match(msg, /at least 1 solution/i);
  });

  // 12. Cleanup: Start Round 1 back to LIVE
  await t.test('12. Restore Round 1 as LIVE', async () => {
    await fetchBackend('/admin/rounds/1/control', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: { action: 'START', durationMinutes: 60 }
    });
  });
});
