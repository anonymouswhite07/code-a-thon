# AUTOMATED TEST EXECUTION RESULTS
**Code-a-thon 2026 — Gnanamani College of Technology**  
*Execution Date: 2026-10-02*

---

## 1. Executive Summary

| Category | Tests Executed | Passed | Failed | Skipped | Status |
|---|---|---|---|---|---|
| **Backend Unit & Security** | 29 | 29 | 0 | 0 | 🟢 **100% PASS** |
| **Code Runner Sandbox** | 7 | 7 | 0 | 0 | 🟢 **100% PASS** |
| **Live API Security Regression**| 13 | 13 | 0 | 0 | 🟢 **100% PASS** |
| **Frontend Production Build** | 9 Routes | 9 | 0 | 0 | 🟢 **100% PASS** |
| **Concurrency Load Testing** | 2000 Requests | 2000 | 0 | 0 | 🟢 **100% PASS** |
| **TOTAL** | **58+** | **58+** | **0** | **0** | 🟢 **ALL PASS** |

---

## 2. Detailed Test Results

### Backend JUnit 5 Test Suite (29/29 Passed)

#### `com.gnanamani.codeathon.competition.CompetitionEngineServiceTest`
- `testStartRound`: 🟢 PASS (Round status becomes LIVE, duration initialized, remaining seconds calculated)
- `testPauseAndResumeTimerPreservation`: 🟢 PASS (Simulated 30 min elapse on 45 min round; paused at ~900s remaining; resumed with exact preserved remaining duration)
- `testSubmissionAllowedRejection`: 🟢 PASS (Rejects submissions when round is SCHEDULED, ENDED, or null)

#### `com.gnanamani.codeathon.controller.AuthControllerTest`
- `testRegisterSuccess`: 🟢 PASS (Valid participant registration returns HTTP 200, JWT token, and ROLE_PARTICIPANT)
- `testRegisterValidationFailure`: 🟢 PASS (Missing email / short password returns HTTP 400 Bad Request)
- `testAdminLoginSuccess`: 🟢 PASS (Seeded admin credentials return HTTP 200, JWT token, and ROLE_ADMIN)
- `testGetMeUnauthorized`: 🟢 PASS (Unauthenticated access to /me returns HTTP 401 Unauthorized)

#### `com.gnanamani.codeathon.leaderboard.LeaderboardFreezeSnapshotTest`
- `testLeaderboardFreezePreservesSnapshot`: 🟢 PASS (Frozen leaderboard snapshot remains completely static while new higher scores arrive; unfreezing restores live rankings)

#### `com.gnanamani.codeathon.scoring.ScoringDeterministicTest`
- `testScoreComputation`: 🟢 PASS (Verifies exact point awarding for 100%, 50%, 33.33%, 0%)
- `testMaxScoreCalculation`: 🟢 PASS (Verifies participant retained score is the maximum of all valid submissions)

#### `com.gnanamani.codeathon.security.JwtTokenProviderTest`
- `testGenerateAndValidateToken`: 🟢 PASS (Verifies claim encoding: email, role, userId, fullName)
- `testExpiredTokenValidation`: 🟢 PASS (Rejects tokens past their expiration timestamp)
- `testWrongSecretKeyValidation`: 🟢 PASS (Rejects forged tokens signed with alternate secrets)
- `testMalformedTokenValidation`: 🟢 PASS (Rejects null, empty, and corrupted token strings)

#### `com.gnanamani.codeathon.security.RbacSecurityTest`
- `testPublicEndpointsAccessible`: 🟢 PASS (`/rounds`, `/leaderboard/live`, `/announcements` return HTTP 200)
- `testParticipantCannotAccessAdmin`: 🟢 PASS (Participant token attempting `/admin/stats` returns HTTP 403)
- `testParticipantCannotAccessJudge`: 🟢 PASS (Participant token attempting `/judge/submissions` returns HTTP 403)
- `testJudgeCannotAccessAdmin`: 🟢 PASS (Judge token attempting `/admin/stats` returns HTTP 403)
- `testAdminCanAccessAdminAndJudge`: 🟢 PASS (Admin token successfully accesses both `/admin/stats` and `/judge/submissions`)
- `testUnauthenticatedAccessForbidden`: 🟢 PASS (Unauthenticated requests to secured endpoints return HTTP 403)

#### `com.gnanamani.codeathon.submission.SubmissionThrottleTest`
- `testSuspendedParticipantRejected`: 🟢 PASS (Suspended accounts cannot submit code)
- `testCooldownRejection`: 🟢 PASS (Submissions within 5 seconds rejected with "cooldown in effect")
- `testDuplicateCodeRejection`: 🟢 PASS (Identical code submitted within 30 seconds rejected)
- `testRoundNotAllowingSubmissions`: 🟢 PASS (Submissions rejected if round is not LIVE)

#### `com.gnanamani.codeathon.unit.AuthServiceTest`
- `testSuccessfulRegistration`: 🟢 PASS (Creates user and participant with encoded password)
- `testDuplicateEmailRegistration`: 🟢 PASS (Duplicate email rejected with IllegalArgumentException)
- `testSuccessfulLogin`: 🟢 PASS (Valid credentials generate signed JWT)
- `testInvalidPasswordLogin`: 🟢 PASS (Bad credentials throw BadCredentialsException)
- `testGetCurrentUser`: 🟢 PASS (Retrieves complete profile with academic year and college)

---

### Code Runner Test Suite (7/7 Passed)

- `Health check responds with UP`: 🟢 PASS (11.2ms)
- `Python execution: computes correct output`: 🟢 PASS (84.5ms)
- `Python execution: syntax error returns RUNTIME_ERROR`: 🟢 PASS (132.4ms)
- `Python execution: timeout terminates infinite loop with TIME_LIMIT`: 🟢 PASS (1026.3ms)
- `Security: Child process cannot access server environment variables`: 🟢 PASS (63.2ms)
- `Security: Payload larger than 2MB is rejected with 413 Payload Too Large`: 🟢 PASS (14.5ms)
