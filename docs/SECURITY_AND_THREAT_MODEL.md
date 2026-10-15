# Takshvaya (तक्ष्वया) - Security Specifications & Threat Model (STRIDE)
*Zero-Trust, High-Security Fresher Career Platform*

---

## 1. Security Baseline & Philosophy
Takshvaya treats security as a tier-1 requirement. As early-career freshers are frequently targeted by employment scams, fake recruitment drives, and payment extortion schemes, our security architecture guarantees:
1. **Zero Trust Perimeter**: Never trust the frontend. Enforce authentication, authorization, and input validation on every server endpoint.
2. **Deny-by-Default RBAC & OLAC**: Prevent Insecure Direct Object References (IDOR/BOLA). Candidate profiles and applications are strictly restricted to the account owner or verified recruiters assigned to that specific job.
3. **Dual-Factor Admin Isolation**: Admin portal is decoupled from public login surfaces and protected by an out-of-band Email + Phone OTP mechanism strictly limited to allowlisted identities.
4. **OWASP ASVS Level 2 Verification**: All 14 control domains implemented and validated.

---

## 2. Threat Modeling (STRIDE Matrix)

### Flow 1: Candidate & Recruiter Google OAuth 2.0
- **Threat (Spoofing)**: Attacker crafts a fake OAuth callback or intercepts auth code.
  - *Defense*: Enforce PKCE (Proof Key for Code Exchange) with `code_challenge` / `code_verifier`, cryptographic `state` and `nonce` parameters verified against server-side session cookies.
- **Threat (Tampering)**: Tampering with JWT claims to elevate roles from `JOB_SEEKER` to `RECRUITER` or `ADMIN`.
  - *Defense*: JWTs are signed with RS256 / HS512 using private secrets. User roles are validated on every sensitive request against the database session cache.
- **Threat (Information Disclosure)**: Access tokens intercepted via XSS attacks.
  - *Defense*: Access tokens and refresh tokens are stored strictly in `HttpOnly`, `Secure`, `SameSite=Strict` cookies. Web scripts (JavaScript) have zero programmatic access to tokens. Strict CSP blocks inline scripts.

### Flow 2: Recruiter Verification & Job Posting
- **Threat (Spoofing & Fraud)**: Scammer poses as a legitimate company recruiter (e.g. Google or Infosys) using a free gmail address.
  - *Defense*: Corporate domain verification is mandatory. Personal domains (`gmail.com`, `yahoo.com`, `outlook.com`) are rejected for recruiter registration. Corporate email domain must match the company's verified website domain. Recruiter must submit GST/CIN and pass phone OTP verification.
- **Threat (Tampering)**: Fraudulent job posting asking candidates for "security deposit", "laptop fee", or "training charges".
  - *Defense*: Automated Real-Time Fraud Classifier checks title and description against an active heuristics regex and keyword database (`registration fee`, `deposit`, `payment required`, `pay before interview`, `whatsapp only`, `telegram link`). Flagged postings are quarantined and auto-blocked before publication.

### Flow 3: Resume PDF Upload & Parsing
- **Threat (Tampering / Remote Code Execution)**: Malicious PDF file containing binary exploits or macro payloads aimed at the backend parser.
  - *Defense*: 
    1. Maximum file size capped at 5MB.
    2. Real file validation via magic byte sniffing (`%PDF-1.` or `PK\x03\x04` for docx) rather than MIME extension.
    3. File renamed to an unguessable UUIDv4.
    4. Anti-malware scanner (ClamAV) checks the stream prior to storage.
    5. Files stored in a private, non-public bucket and served exclusively via short-lived (5-minute) presigned URLs.

### Flow 4: Admin Portal (Strict Dual-Factor OTP)
- **Threat (Elevation of Privilege / Brute Force)**: Attacker tries to locate and force access into admin dashboard.
  - *Defense*:
    1. Admin route is obscured and not linked in client bundles or public navigation.
    2. Strict Allowlist: Only `ADMIN_EMAIL = bhusalapraveen6@gmail.com` and `ADMIN_PHONE = 9640742659` can request OTPs.
    3. Generic timing-equalized response returned for any unauthorized input ("If registered, an OTP has been dispatched").
    4. Dual verification: Requires **both** Email OTP + Phone OTP (SMS/WhatsApp).
    5. Rate limiting: Max 3 OTP generation requests per hour per IP and account; max 3 failed verification attempts before 15-minute lockout.
    6. All admin operations emit an immutable record into `admin_audit_logs`.

---

## 3. OWASP Top 10 Compliance Matrix

| OWASP Vulnerability | Risk Scenario | Implementation in Takshvaya |
| :--- | :--- | :--- |
| **A01: Broken Access Control** | User changes URL ID to view another candidate's resume or applications | Strict server-side middleware `verifyOwnership` checks `req.user.id === target.user_id`. Deny-by-default on all routes. |
| **A02: Cryptographic Failures** | Plaintext tokens or passwords in database | Argon2id used for hashing sensitive secrets; AES-256 for sensitive PII at rest. TLS 1.3 enforced in transit. |
| **A03: Injection** | SQL Injection via search filters or job queries | Parameterized queries with PostgreSQL and TypeORM/Prisma query builders. Zero string concatenation. Input sanitized with Zod schemas. |
| **A04: Insecure Design** | Unlimited auto-apply spamming or fake reviews | Hard daily limit (max 15 auto-applies/day). Reviews permitted only by verified candidates with authenticated accounts. |
| **A05: Security Misconfiguration** | Debug stack traces or default credentials exposed | `NODE_ENV=production` suppresses stack traces; standardized error responses. CSP, HSTS, X-Frame-Options headers pre-configured. |
| **A06: Vulnerable & Outdated Components** | Vulnerable npm dependencies | Locked `package-lock.json`, daily Dependabot/npm audit, minimal base Docker images (Node Alpine). |
| **A07: Identification & Auth Failures** | Session hijacking or credential stuffing | Google OAuth 2.0 PKCE only + Dual-Factor OTP for Admins. Refresh token family rotation with automatic session family revocation upon reuse. |
| **A08: Software & Data Integrity Failures** | Untrusted external job RSS feeds executing arbitrary HTML | Strict DOMPurify sanitization of job descriptions; domain allowlisting on external feed crawlers. |
| **A09: Security Logging & Monitoring Failures** | Admin modifies jobs or unbans recruiters without trace | Write-only `admin_audit_logs` table tracking admin email, IP address, user-agent, action type, and diff payload. |
| **A10: Server-Side Request Forgery (SSRF)** | Aggregator crawler accesses internal AWS metadata or localhost | Aggregator requests validated through private IP blocking (`127.0.0.1`, `169.254.169.254`, `10.0.0.0/8`, `192.168.0.0/16`) and domain allowlists. |

---

## 4. Pre-Launch Penetration Testing Checklist
- [ ] **Auth Tests**: Attempt token replay attack on refresh token; verify that the entire session family is revoked immediately.
- [ ] **IDOR Tests**: Attempt to access `/api/v1/applications/:id` with user A's token for user B's application ID; verify HTTP 403 Forbidden.
- [ ] **File Upload Tests**: Upload a `.php` or `.sh` script disguised as `resume.pdf`; verify rejection via magic byte verification.
- [ ] **Admin OTP Tests**: Attempt to submit admin login with non-allowlisted email/phone; verify rate-limiting and generic response.
- [ ] **XSS Tests**: Inject `<script>alert(1)</script>` and `<img src=x onerror=alert(1)>` in job description and company review; verify complete sanitization.
- [ ] **CSRF Tests**: Attempt cross-origin POST request without CSRF token; verify HTTP 403.
- [ ] **Rate Limiting Tests**: Send 100 rapid requests to `/api/v1/jobs/search`; verify HTTP 429 Too Many Requests response.
