# Takshvaya (तक्ष्वया) - Deployment & Testing Guide
*Zero-Ad, High-Security Fresher Career Portal*

---

## 1. Quick Start (Local Development)

### Prerequisites
- Node.js >= 18 (Tested on v24.18)
- NPM >= 9

### Step 1: Start Backend Service
```bash
cd backend
npm install
npm run dev
# Backend starts on http://localhost:5000
```

### Step 2: Start Frontend Next.js Web App
```bash
cd frontend
npm install
npm run dev
# Frontend web app active on http://localhost:3000
```

---

## 2. Automated Test Suite (93/93 Tests Passing)

Takshvaya includes five comprehensive test runners covering the OWASP ASVS Level 2 requirements and all core business logic:

```bash
cd backend

# 1. Auth & Dual-Factor Admin OTP Tests (15 Tests)
npx ts-node src/tests/run-auth-tests.ts

# 2. Job Search, Typo-Tolerance & Legal Aggregation Tests (21 Tests)
npx ts-node src/tests/run-jobs-tests.ts

# 3. Resume Magic Byte Parser, Match Score & Roadmaps Tests (20 Tests)
npx ts-node src/tests/run-skills-tests.ts

# 4. Auto-Apply Quotas, Recruiter Vetting & ATS Tests (21 Tests)
npx ts-node src/tests/run-auto-apply-and-recruiter-tests.ts

# 5. Anti-Fraud Auto-Quarantine & Admin Moderation Tests (16 Tests)
npx ts-node src/tests/run-anti-fraud-and-admin-tests.ts
```

All 93 tests execute with 100% pass rates.

---

## 3. Production Docker Deployment

Deploy the full stack with internal database network isolation and non-root unprivileged containers:

```bash
cd docker
docker compose up -d --build
```

### What this provisions:
- **`postgres`**: PostgreSQL 16 on private internal network `takshvaya-internal` (zero public port exposure).
- **`redis`**: Redis 7 for rate-limiting, session families, and BullMQ queues.
- **`clamav`**: Anti-malware container for uploaded resumes.
- **`backend`**: Node.js/Express API with helmet CSP and rate limiting.
- **`frontend`**: Next.js 14 SSR Web App on port 3000.

---

## 4. Free-Tier Friendly Deployment Architecture

If deploying without dedicated VPS infrastructure, use this zero-cost serverless stack:

| Component | Recommended Free Provider | Setup Notes |
| :--- | :--- | :--- |
| **Frontend** | Vercel or Cloudflare Pages | Set `NEXT_PUBLIC_API_URL` to backend URL. Global CDN caching enabled. |
| **Backend API** | Render / Railway / Fly.io | 512MB free container with automatic HTTPS. Set `ADMIN_EMAIL` and `ADMIN_PHONE`. |
| **Database** | Neon.tech / Supabase (PostgreSQL) | Run `backend/src/database/schema.sql` directly in SQL editor. Free 500MB storage. |
| **Redis** | Upstash Serverless Redis | 10,000 free commands/day for rate-limiting and session rotation. |
| **Resume Storage** | Cloudflare R2 | 10 GB free private storage; zero egress fees. Pre-signed URLs for downloads. |

---

## 5. Security & Penetration Testing Guide

1. **Test Admin Dual-Factor OTP Gate**:
   - Access `/admin/gateway`.
   - Submit unauthorized email or phone. Confirm timing-equalized generic response without session disclosure.
   - Enter `bhusalapraveen6@gmail.com` and `9640742659`.
   - Verify that both Email OTP and Phone OTP are required before admin privileges are granted.
2. **Test Fee Scam Auto-Quarantine**:
   - Post or report a job requesting "registration fee" or "security deposit".
   - Confirm job status changes to `FLAGGED` and is immediately hidden from `/jobs` search results.
3. **Test Session Family Theft Protection**:
   - Replay an expired/used refresh token.
   - Confirm that the server invalidates the whole session family across all devices immediately.
4. **Test IDOR / BOLA Prevention**:
   - Confirm that recruiter A attempting to query applicants for recruiter B's job receives an instant `403 Forbidden`.
