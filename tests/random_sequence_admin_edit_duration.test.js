import assert from 'node:assert';
import test from 'node:test';

const BACKEND_URL = 'http://localhost:8080/api/v1';

test('Randomized Question Sequence, Locked Question Restriction, Admin Edit Question, and Admin Round Duration', async (t) => {
  // 1. Login as Admin
  const adminRes = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gct.org.in', password: 'Gnyan@codingclub.com' })
  });
  const adminData = await adminRes.json();
  assert.strictEqual(adminRes.status, 200, 'Admin login failed');
  const adminToken = adminData.data.token;

  // 2. Register Participant A and Participant B
  const timestamp = Date.now();
  const regUser = async (name, email) => {
    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: name,
        email: email,
        password: 'password123',
        phone: '9876543210',
        college: 'GCT',
        department: 'CSE',
        year: '3rd Year'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200, `Registration failed for ${email}`);
    return data.data.token;
  };

  const tokenA = await regUser(`Student A ${timestamp}`, `student_a_${timestamp}@gct.ac.in`);
  const tokenB = await regUser(`Student B ${timestamp}`, `student_b_${timestamp}@gct.ac.in`);

  // 3. Start sessions for Round 1 for both users
  await fetch(`${BACKEND_URL}/integrity/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ roundId: 1, agreementAccepted: true })
  });
  await fetch(`${BACKEND_URL}/integrity/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
    body: JSON.stringify({ roundId: 1, agreementAccepted: true })
  });

  // 4. Verify Randomized Question Sequence per participant
  const resQuestionsA = await fetch(`${BACKEND_URL}/questions/round/1`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const questionsA = (await resQuestionsA.json()).data;

  const resQuestionsB = await fetch(`${BACKEND_URL}/questions/round/1`, {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  const questionsB = (await resQuestionsB.json()).data;

  assert.strictEqual(questionsA.length, 5, 'User A should receive 5 questions');
  assert.strictEqual(questionsB.length, 5, 'User B should receive 5 questions');

  const orderA = questionsA.map(q => q.id);
  const orderB = questionsB.map(q => q.id);
  console.log('Participant A question sequence:', orderA);
  console.log('Participant B question sequence:', orderB);

  // Both should contain the same 5 question IDs
  assert.deepStrictEqual([...orderA].sort(), [...orderB].sort());
  // But the sequence should not be identical (randomized per user)
  assert.notDeepStrictEqual(orderA, orderB, 'Question order must be randomized differently across participants');

  // 5. Submit solution and advance question for Participant A
  const firstQ = questionsA[0];
  const secondQ = questionsA[1];

  // Submit attempt for firstQ
  const subRes = await fetch(`${BACKEND_URL}/submissions/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({
      questionId: firstQ.id,
      language: 'c',
      sourceCode: '#include <stdio.h>\nint main(){printf("Hello");return 0;}'
    })
  });
  assert.strictEqual(subRes.status, 200, 'Submission failed');

  // Advance to secondQ
  const advRes = await fetch(`${BACKEND_URL}/integrity/question/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({
      roundId: 1,
      currentQuestionId: firstQ.id,
      nextQuestionId: secondQ.id
    })
  });
  assert.strictEqual(advRes.status, 200, 'Advancing question failed');

  // 6. Test Restriction: Attempting to view the completed/locked previous question
  const detailLockedRes = await fetch(`${BACKEND_URL}/questions/${firstQ.id}`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert.strictEqual(detailLockedRes.status, 409, 'Viewing locked question must return 409 Conflict');
  const lockedBody = await detailLockedRes.json();
  console.log('Locked question restriction response:', lockedBody);
  assert.ok(
    lockedBody?.error?.message?.includes('locked and completed') || lockedBody?.message?.includes('locked and completed'),
    'Response should clearly indicate access is restricted because question is locked'
  );

  // Viewing active second question should succeed
  const detailActiveRes = await fetch(`${BACKEND_URL}/questions/${secondQ.id}`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert.strictEqual(detailActiveRes.status, 200, 'Viewing active unlocked question should succeed');

  // 7. Admin Modifies / Updates Existing Question
  const updateRes = await fetch(`${BACKEND_URL}/admin/questions/${firstQ.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: 'Updated Challenge Title By Admin',
      description: 'Updated challenge description by admin for testing.',
      points: 150,
      difficulty: 'HARD',
      starterCode: '// Updated starter code',
      inputFormat: 'Updated input format',
      outputFormat: 'Updated output format'
    })
  });
  assert.strictEqual(updateRes.status, 200, 'Admin question update failed');
  const updatedId = (await updateRes.json()).data;
  assert.strictEqual(Number(updatedId), Number(firstQ.id));

  // Verify the update via admin get questions
  const allQsRes = await fetch(`${BACKEND_URL}/admin/questions`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const allQs = (await allQsRes.json()).data;
  const updatedQ = allQs.find(q => q.id === firstQ.id);
  assert.strictEqual(updatedQ.title, 'Updated Challenge Title By Admin');
  assert.strictEqual(updatedQ.points, 150);
  console.log('Admin updated question successfully verified:', updatedQ.id, updatedQ.title, updatedQ.points);

  // 8. Admin Chooses / Sets Round Duration
  const setDurationRes = await fetch(`${BACKEND_URL}/admin/rounds/1/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      action: 'SET_DURATION',
      durationMinutes: 75
    })
  });
  assert.strictEqual(setDurationRes.status, 200, 'Admin set duration failed');
  const durationData = (await setDurationRes.json()).data;
  assert.strictEqual(durationData.durationMinutes, 75, 'Round duration should now be 75 minutes');
  console.log('Admin set round duration successfully:', durationData.id, durationData.durationMinutes, 'minutes');

  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
});
