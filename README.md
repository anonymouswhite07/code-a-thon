# CODE-A-THON 2026 Platform
**Gnanamani College of Technology | Think. Code. Conquer.**

A complete, production-grade 3-round college coding festival platform engineered with a **Playful Editorial × Premium Competition** design language, a robust **Spring Boot 3 (Java 17/21)** backend, an isolated **Code Execution Sandbox Service**, and a modern **Next.js (App Router, Tailwind CSS, Monaco Editor)** frontend.

Pre-configured for **1-click cloud hosting**:
- **Frontend**: [Vercel](https://vercel.com) (Next.js Edge)
- **Backend & Code Runner**: [Render](https://render.com) (Spring Boot & Docker Sandbox)
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for full setup instructions.

---

## Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│               NEXT.JS FRONTEND (PORT 3001)             │
│   • Editorial Festival Landing Page & Interactive Hero │
│   • Live Authoritative Countdown & Journey Roadmap     │
│   • Public Monaco Code Playground                      │
│   • Participant Portal & Live Coding Arena             │
│   • Admin Command Center & Judge Review Desk           │
└───────────────────────────┬────────────────────────────┘
                            │ REST APIs + Real-time SSE
┌───────────────────────────▼────────────────────────────┐
│             SPRING BOOT 3 BACKEND (PORT 8080)          │
│   • Spring Security + JWT Authentication               │
│   • Authoritative Timer & Competition Engine           │
│   • Real-Time Event Stream (Server-Sent Events)        │
│   • Audit Logging & RBAC Access Control                │
│   • Embedded H2 (Local) / PostgreSQL (Production)      │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP JSON Payload
┌───────────────────────────▼────────────────────────────┐
│            ISOLATED CODE RUNNER (PORT 5050)            │
│   • Sandboxed Subprocess Execution (C, Python, Java)   │
│   • Strict CPU Timeout & Memory Constraints            │
│   • Ephemeral Workspace Cleanup & Security Controls    │
│   • Automated Standard I/O Test Suite Evaluation       │
└────────────────────────────────────────────────────────┘
```

---

## Default Seeded Credentials

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@gct.ac.in` | `Super@2026` | `/admin` Command Center |
| **Admin** | `admin@gct.ac.in` | `Admin@2026` | `/admin` Command Center |
| **Judge** | `judge@gct.ac.in` | `Judge@2026` | `/judge` Evaluation Desk |
| **Participant 1** | `karthik@gct.ac.in` | `Karthik@2026` | `/dashboard`, `/compete/1` |
| **Participant 2** | `sneha@gct.ac.in` | `Sneha@2026` | `/dashboard`, `/compete/1` |
| **Participant 3** | `rahul@gct.ac.in` | `Rahul@2026` | `/dashboard`, `/compete/1` |

*(Quick one-click demo login buttons are provided directly on the `/login` screen for rapid evaluation.)*

---

## Three-Round Structure

1. **Round 01 — C: The Foundation**
   - Focus: Bitwise algorithms, memory management, pointers, and array spirals.
   - Default Status: `LIVE` (45 minutes, authoritative countdown enabled).
2. **Round 02 — Python: The Logic**
   - Focus: Algorithmic efficiency, string parsing, sorting, and graph exploration.
   - Default Status: `SCHEDULED` (Unlocks via Admin control).
3. **Round 03 — Java: The Master**
   - Focus: OOP enterprise structures, dynamic programming, and stream processing.
   - Default Status: `SCHEDULED` (Unlocks via Admin control).

---

## Local Development Quick Start

### 1. Start Isolated Code Runner
```bash
cd code-runner
node server.js
# Runs on http://localhost:5050
```

### 2. Start Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080
# Database automatically seeds with rounds, questions, test cases, and users
```

### 3. Start Next.js Frontend
```bash
cd frontend
npm run start -- -p 3001
# Or for dev mode: npm run dev -- -p 3001
# Open http://localhost:3001
```

---

## Production Containerized Deployment

Run the complete stack with Docker Compose:
```bash
cd infrastructure
docker-compose up -d --build
```
This deploys PostgreSQL, the isolated execution sandbox, the Spring Boot API, Next.js, and an Nginx reverse proxy on port 80/443.

---

## Verification & API Testing

Run the included automated smoke test to verify all backend API flows:
```bash
cd backend
node smoke_test.js
```
