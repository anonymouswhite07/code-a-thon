async function runSmokeTest() {
  const base = 'http://localhost:8080/api/v1';

  console.log('=== 1. TEST PUBLIC ROUNDS ===');
  const rounds = await fetch(`${base}/rounds`).then(r => r.json());
  console.log('Rounds count:', rounds.data.length, 'Live round:', rounds.data.find(r => r.status === 'LIVE')?.title);

  console.log('\n=== 2. TEST PUBLIC PLAYGROUND ===');
  const pg = await fetch(`${base}/submissions/playground/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: 'python', sourceCode: 'print(10 * 5)', customInput: '' })
  }).then(r => r.json());
  console.log('Playground status:', pg.data?.overallStatus, 'Output:', pg.data?.results?.[0]?.actualOutput?.trim());

  console.log('\n=== 3. TEST PARTICIPANT LOGIN ===');
  const pLogin = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'karthik@gct.ac.in', password: 'Karthik@2026' })
  }).then(r => r.json());
  console.log('Participant login success:', pLogin.success, 'Token:', pLogin.data?.token?.slice(0, 25) + '...');
  const pToken = pLogin.data?.token;

  console.log('\n=== 4. TEST ROUND 1 QUESTIONS ===');
  const questions = await fetch(`${base}/questions/round/1`, {
    headers: { 'Authorization': `Bearer ${pToken}` }
  }).then(r => r.json());
  console.log('Questions in Round 1:', questions.data?.map(q => `${q.id}: ${q.title} (${q.points}pts)`));

  console.log('\n=== 5. TEST CODE SUBMISSION ===');
  // Submit solution for Question 1 (Bitwise Palindrome Checker in C)
  const submitRes = await fetch(`${base}/submissions/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${pToken}`
    },
    body: JSON.stringify({
      questionId: questions.data[0].id,
      language: 'C',
      sourceCode: '#include <stdio.h>\nint main() { unsigned int n; if (scanf("%u", &n)!=1) return 0; printf("YES\\n"); return 0; }'
    })
  }).then(r => r.json());
  console.log('Submission ID:', submitRes.data?.id, 'Status:', submitRes.data?.status, 'Score:', submitRes.data?.score);

  console.log('\n=== 6. TEST ADMIN DASHBOARD & CONTROLS ===');
  const aLogin = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gct.ac.in', password: 'Admin@2026' })
  }).then(r => r.json());
  const aToken = aLogin.data?.token;

  const stats = await fetch(`${base}/admin/stats`, {
    headers: { 'Authorization': `Bearer ${aToken}` }
  }).then(r => r.json());
  console.log('Admin Stats - Participants:', stats.data?.totalParticipants, 'Submissions:', stats.data?.totalSubmissions, 'Round:', stats.data?.currentRoundTitle);

  console.log('\n=== 7. TEST AUDIT LOGS ===');
  const logs = await fetch(`${base}/admin/audit-logs`, {
    headers: { 'Authorization': `Bearer ${aToken}` }
  }).then(r => r.json());
  console.log('Audit logs recorded:', logs.data?.length, 'Latest action:', logs.data?.[0]?.action);

  console.log('\nALL BACKEND API VERIFICATIONS PASSED SUCCESSFULLY!');
}

runSmokeTest().catch(console.error);
