# Takshvaya (तक्ष्वया) - RESTful API Specification (v1)
*Base URL: `/api/v1`*

---

## 1. Authentication & Sessions (`/api/v1/auth`)

### 1.1 Candidate & Recruiter Google OAuth
- **`GET /auth/google/initiate?role=JOB_SEEKER|RECRUITER`**
  - Initiates Google OAuth 2.0 flow with PKCE, returning auth URL and setting encrypted state/nonce cookies.
- **`POST /auth/google/callback`**
  - Exchanges authorization code with PKCE verification.
  - Returns user profile and sets `accessToken` and `refreshToken` in `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
- **`POST /auth/refresh`**
  - Rotates refresh token, detects token reuse/theft, issues new access token.
- **`POST /auth/logout`**
  - Revokes current refresh token family and clears cookies.
- **`POST /auth/logout-all-devices`**
  - Revokes all session families for the authenticated user ID.
- **`GET /auth/sessions`**
  - Returns list of active sessions (device name, IP address, created time, current session indicator).

### 1.2 Admin Dual-Factor OTP Authentication (`/api/v1/admin-auth` - Hidden Endpoints)
- **`POST /admin-auth/request-otp`**
  - Body: `{ email: string, phone: string, captcha_token: string }`
  - Validates against environment allowlist:
    - `ADMIN_EMAIL = bhusalapraveen6@gmail.com`
    - `ADMIN_PHONE = 9640742659`
  - Generates two independent cryptographically secure OTPs (Email OTP & Phone OTP via SMS/WhatsApp).
  - Returns generic confirmation message: `"If authorized, verification codes have been dispatched."`
- **`POST /admin-auth/verify-otp`**
  - Body: `{ email: string, email_otp: string, phone_otp: string }`
  - Verifies both OTP hashes. Max 3 attempts before temporary account lockout.
  - On success: issues short-lived (30-min idle timeout) `adminSessionToken` cookie bound to IP and user-agent.
- **`POST /admin-auth/sensitive-action/re-verify`**
  - Sends a fresh high-priority OTP before sensitive actions (delete user, modify platform settings, blacklist domain).

---

## 2. Job Listings & Search (`/api/v1/jobs`)

- **`GET /jobs`**
  - Query parameters:
    - `q`: keyword search
    - `role`: e.g., `software-developer`, `data-analyst`, `marketing`
    - `city`: e.g., `Bengaluru`, `Hyderabad`, `Pune`, `Delhi-NCR`, `Remote`
    - `workplace`: `ON_SITE`, `REMOTE`, `HYBRID`
    - `exp_min`: default `0`, `exp_max`: default `2`
    - `degree`: e.g., `B.Tech`, `BCA`, `B.Sc`
    - `branch`: e.g., `Computer Science`, `IT`, `Electronics`
    - `passing_year`: e.g., `2024`, `2025`
    - `min_cgpa`: e.g., `7.0` or `65` (%)
    - `salary_min`: minimum annual compensation in INR
    - `verified_only`: `true` | `false`
    - `sort`: `relevance` | `newest` | `salary_desc` | `rating_desc`
    - `page`, `limit`: pagination (default 10, max 50)
- **`GET /jobs/:slug`**
  - Full job details with verified badges, recruiter info, company overview, and eligibility breakdown.
- **`GET /jobs/role/:role_slug`**
  - Specialized role landing page data: active jobs, fresher salary brackets, required skill matrix, career progression path, top hiring companies, and interview prep questions.
- **`POST /jobs/:id/save`** & **`DELETE /jobs/:id/save`**
  - Save/bookmark job for logged-in user.
- **`POST /jobs/:id/report`**
  - Submit fraud/scam report with reason (`ASKS_FOR_MONEY`, `WHATSAPP_ONLY`, `UNREALISTIC_SALARY`, etc.) and optional proof file.

---

## 3. Skill Match & Gap Analysis (`/api/v1/skills`)

- **`POST /skills/parse-resume`**
  - Uploads PDF/DOCX resume (max 5MB). Checks magic bytes, scans with ClamAV, parses text and extracts skills, degree, passing year, and CGPA.
- **`GET /skills/match/:job_id`**
  - Calculates real-time Match Score (%) between candidate profile and target job.
  - Returns:
    - `match_score`: integer percentage (e.g. `85%`)
    - `matched_skills`: `["React", "TypeScript", "Node.js"]`
    - `missing_skills`: `["Docker", "PostgreSQL"]`
    - `eligibility`: `{ is_eligible: boolean, reasons: string[] }`
    - `recommended_roadmap`: list of missing skill modules with estimated hours, free learning links, and practice projects.

---

## 4. Controlled Auto-Apply Engine (`/api/v1/auto-apply`)

- **`GET /auto-apply/settings`**
  - Returns current user auto-apply configuration, daily quotas, and remaining applications.
- **`PUT /auto-apply/settings`**
  - Updates preferences: `min_match_score` (50–100%), `preferred_roles`, `preferred_locations`, `min_salary_inr`, `daily_application_limit` (1–15), `excluded_company_ids`.
- **`POST /auto-apply/toggle`**
  - Activates or pauses auto-apply.
- **`GET /auto-apply/history`**
  - Lists jobs applied through auto-apply with timestamp, match score, and undo/withdraw window.

---

## 5. Recruiter Portal & ATS (`/api/v1/recruiter`)

- **`POST /recruiter/verify-domain`**
  - Submits official corporate email domain and company website for validation. Rejects personal domains.
- **`POST /recruiter/submit-registration`**
  - Submits GST/CIN, company registration details, and phone OTP verification.
- **`POST /recruiter/jobs`**
  - Posts a new job opening. Automatically runs anti-fraud validation checks. Mandatory salary range.
- **`GET /recruiter/jobs`**
  - Lists active, draft, and expired jobs posted by the recruiter.
- **`GET /recruiter/jobs/:id/applicants`**
  - Lists candidate applicants ranked by skill match score (%), eligibility badge, and application date.
- **`PATCH /recruiter/applications/:id/status`**
  - Updates candidate application status: `APPLIED` ➔ `VIEWED` ➔ `SHORTLISTED` ➔ `INTERVIEW` ➔ `OFFER` / `REJECTED`.

---

## 6. Admin Panel (Hidden Route, High Security) (`/api/v1/admin`)

- **`GET /admin/dashboard-stats`**
  - Active jobs, total applicants, fraud caught, pending recruiter verifications, active sessions.
- **`GET /admin/moderation-queue`**
  - Jobs flagged by automated spam heuristic or user fraud reports.
- **`POST /admin/jobs/:id/action`**
  - Actions: `APPROVE`, `FLAG`, `FORCE_EXPIRE`, `BAN_COMPANY`.
- **`GET /admin/recruiter-verifications`**
  - Review recruiter corporate email proofs, GST/CIN details, and approve/reject.
- **`POST /admin/blacklist`**
  - Add malicious domain, phone number, or recruiter identifier to permanent blacklist.
- **`GET /admin/audit-logs`**
  - Query immutable audit trail with filtering by action, admin, and date.
