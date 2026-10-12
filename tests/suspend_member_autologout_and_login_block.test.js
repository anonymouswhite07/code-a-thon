import assert from 'node:assert';
import test from 'node:test';

const BACKEND_URL = 'http://localhost:8080/api/v1';

test('Participant Suspension: Immediate Token Invalidation, Auto-Logout Message, and Login Block', async (t) => {
  // 1. Login as Admin
  const adminRes = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gct.ac.in', password: 'Admin@2026' })
  });
  const adminData = await adminRes.json();
  assert.strictEqual(adminRes.status, 200, 'Admin login failed');
  const adminToken = adminData.data.token;

  // 2. Register fresh participant
  const timestamp = Date.now();
  const email = `suspend_user_${timestamp}@gct.ac.in`;
  const regRes = await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: `Suspend Test User ${timestamp}`,
      email: email,
      password: 'password123',
      phone: '9876543210',
      college: 'GCT',
      department: 'CSE',
      year: '3rd Year'
    })
  });
  assert.strictEqual(regRes.status, 200, 'User registration failed');
  const regData = (await regRes.json()).data;
  const participantId = regData.participantId;
  const userToken = regData.token;
  assert.ok(participantId, 'Participant ID should be present');

  // 3. Verify participant can initially access protected endpoints
  const meResInitial = await fetch(`${BACKEND_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  assert.strictEqual(meResInitial.status, 200, 'Initial authenticated request should succeed');

  // 4. Admin suspends the participant
  const suspendRes = await fetch(`${BACKEND_URL}/admin/participants/${participantId}/suspend`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(suspendRes.status, 200, 'Admin toggle suspend failed');
  const suspendStatus = (await suspendRes.json()).data;
  assert.strictEqual(suspendStatus, true, 'Participant should now be suspended (true)');
  console.log(`Participant #${participantId} successfully suspended by Admin.`);

  // 5. Verify existing JWT token is immediately rejected with 403 ACCOUNT_SUSPENDED (Auto-Logout trigger)
  const reqWhileSuspended = await fetch(`${BACKEND_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  assert.strictEqual(reqWhileSuspended.status, 403, 'Request with suspended token must be rejected with 403');
  const suspendedBody = await reqWhileSuspended.json();
  console.log('Suspended token rejection response:', suspendedBody);
  assert.strictEqual(suspendedBody?.error?.code, 'ACCOUNT_SUSPENDED');
  assert.ok(
    suspendedBody?.error?.message?.toLowerCase().includes('suspended') &&
    suspendedBody?.error?.message?.toLowerCase().includes('administrator') &&
    suspendedBody?.error?.message?.toLowerCase().includes('active'),
    'Should instruct to contact administrator to make account active'
  );

  // 6. Verify participant attempting to login is rejected with clear instruction to contact admin
  const loginWhileSuspended = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, password: 'password123' })
  });
  assert.strictEqual(loginWhileSuspended.status, 403, 'Login attempt while suspended must return 403 Forbidden');
  const loginSuspendedBody = await loginWhileSuspended.json();
  console.log('Login attempt while suspended response:', loginSuspendedBody);
  assert.strictEqual(loginSuspendedBody?.error?.code, 'ACCOUNT_SUSPENDED');
  assert.strictEqual(
    loginSuspendedBody?.error?.message,
    'Your account has been suspended. Please contact the administrator to make your account active.'
  );

  // 7. Admin restores / makes account active again
  const restoreRes = await fetch(`${BACKEND_URL}/admin/participants/${participantId}/suspend`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(restoreRes.status, 200, 'Admin toggle restore failed');
  const restoreStatus = (await restoreRes.json()).data;
  assert.strictEqual(restoreStatus, false, 'Participant should now be active (false)');
  console.log(`Participant #${participantId} restored by Admin.`);

  // 8. Verify participant can log in again once account is made active
  const loginAfterRestore = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, password: 'password123' })
  });
  assert.strictEqual(loginAfterRestore.status, 200, 'Login should succeed after being restored by admin');
  const restoredLoginData = (await loginAfterRestore.json()).data;
  assert.ok(restoredLoginData.token, 'Should receive fresh valid token after restoration');

  console.log('ALL SUSPENSION AND AUTO-LOGOUT VERIFICATIONS PASSED SUCCESSFULLY!');
});
