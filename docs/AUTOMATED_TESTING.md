# AUTOMATED TESTING SUITE
**Code-a-thon 2026 — Gnanamani College of Technology**  
*Lead QA Automation & Production Deployment Engineering*

---

## 1. Test Architecture Overview

The Code-a-thon testing architecture consists of four distinct, automated tiers ensuring end-to-end correctness, security isolation, and multi-user performance:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CODE-A-THON 2026 TEST ARCHITECTURE                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [Tier 1: Backend JUnit 5] ──▶ Unit, Security, Engine & Controllers    │
│                                (29 Automated Tests — 100% Pass)        │
│                                                                        │
│  [Tier 2: Code Runner]     ──▶ Sandbox, Timeout, Payload & Leaks       │
│                                (7 Automated Tests — 100% Pass)         │
│                                                                        │
│  [Tier 3: API Security]    ──▶ Live RBAC, Clickjacking, Headers & Audit│
│                                (13 Automated Tests — 100% Pass)        │
│                                                                        │
│  [Tier 4: Concurrency Load]──▶ 10, 25, 50, 100 Users & Peak RPS Bench  │
│                                (3000+ RPS, 0% Error Rate)              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Test Suites & Coverage

### Tier 1: Backend Automated Tests (JUnit 5 + Spring Boot)
Located in `backend/src/test/java/com/gnanamani/codeathon/`:

| Test Class | Focus Area | Tests | Status |
|---|---|---|---|
| `competition.CompetitionEngineServiceTest` | State machine lifecycle, start/pause/resume, critical timer preservation | 3 | 🟢 PASS |
| `controller.AuthControllerTest` | Registration validation, admin login, unauthenticated session rejection | 4 | 🟢 PASS |
| `leaderboard.LeaderboardFreezeSnapshotTest` | Frozen leaderboard snapshot isolation and unfreeze restoration | 1 | 🟢 PASS |
| `scoring.ScoringDeterministicTest` | Score percentage calculation, highest score across submissions | 2 | 🟢 PASS |
| `security.JwtTokenProviderTest` | Token generation, claims extraction, expiration, secret forgery rejection | 4 | 🟢 PASS |
| `security.RbacSecurityTest` | Public access, Participant forbidden from Admin/Judge, Admin privileges | 6 | 🟢 PASS |
| `submission.SubmissionThrottleTest` | Suspended participant check, 5s cooldown, 30s code deduplication | 4 | 🟢 PASS |
| `unit.AuthServiceTest` | User registration, duplicate email, bad credentials, profile lookup | 5 | 🟢 PASS |
| **Total** | | **29** | 🟢 **100% PASS** |

### Tier 2: Code Runner Sandbox & Security Tests (Node.js)
Located in `code-runner/test/runner.test.js`:

| Test | Objective | Status |
|---|---|---|
| Health Check | Verifies service status and compiler availability | 🟢 PASS |
| Python Valid Program | Executes valid Python code and verifies standard IO output | 🟢 PASS |
| Python Syntax Error | Returns honest `RUNTIME_ERROR` on invalid syntax | 🟢 PASS |
| Infinite Loop Timeout | Terminates hanging process cleanly with `TIME_LIMIT` | 🟢 PASS |
| Secret Leak Prevention | Verifies child processes cannot access `DATABASE_URL` or `JWT_SECRET` | 🟢 PASS |
| Payload Size Cap | Aborts requests exceeding 2MB with HTTP 413 Payload Too Large | 🟢 PASS |
| **Total** | | 🟢 **100% PASS** |

### Tier 3: Live API Security & Regression Tests
Located in `tests/api_security_regression_test.js`:
- Security headers verification (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`)
- Actuator restriction verification (environment and heap dump paths blocked)
- Public endpoint availability (`/rounds`, `/leaderboard/live`, `/announcements`)
- Role-based access control matrix (Participant, Judge, Admin, Anonymous)
- Dynamic client IP capture in audit logs (`X-Forwarded-For` resolution)
- Leaderboard freeze and unfreeze toggles

### Tier 4: Concurrency & Performance Load Tests
Located in `tests/load/`:
- `competition_load.js` — k6 declarative load test with smoke, normal, competition, and burst stages.
- `concurrency_runner.js` — Automated high-concurrency runner measuring p50, p95, p99 percentiles up to 100 concurrent participants.

---

## 3. How to Run the Test Suites

### Master Test Command (All 4 Tiers)
On Windows PowerShell:
```powershell
.\run_all_tests.ps1
```

On Linux / macOS / CI:
```bash
./run_all_tests.sh
```

### Running Individual Tiers

**Backend Tests:**
```bash
cd backend
mvn test
```

**Code Runner Tests:**
```bash
cd code-runner
node --test test/runner.test.js
```

**Live API Security Tests:**
```bash
node --test tests/api_security_regression_test.js
```

**Concurrency Load Benchmark:**
```bash
node tests/load/concurrency_runner.js
```

---

## 4. Continuous Integration (CI/CD)

The automated pipeline is defined in `.github/workflows/ci.yml`. On every push and pull request to `main`, it runs:
1. Full backend compilation and JUnit 5 test suite
2. Code runner startup and sandbox security suite
3. Frontend TypeScript checking and Next.js Turbopack build
