# Takshvaya (तक्ष्वया) - The Verified Fresher Career Portal

> **"Zero Ads. Zero Fake Jobs. 100% Verified Opportunities for Freshers (0-2 Yrs)."**

Takshvaya is a production-grade career platform engineered specifically for early-career job seekers (0–2 years experience), featuring automated fraud prevention, strict corporate recruiter verification, dual-factor OTP admin authorization, and an intelligent skill-gap analyzer.

---

## Brand & Aesthetics System
- **Deep Teal** (`#0B4F4A` / `hsl(175, 76%, 18%)`): Trust, prestige, stability.
- **Warm Coral** (`#FF6F59` / `hsl(9, 100%, 67%)`): Energy, action, fresher growth spark.
- **Soft Cream** (`#FDFBF7` / `hsl(40, 50%, 98%)`): Calming, paper-like background for readability.
- **Dark Mode Slate** (`#0D1B1E` / `hsl(190, 40%, 8%)`): Sleek, eye-friendly contrast.
- **Accessible Typography**: Outfit / Inter modern geometric sans-serif (WCAG AA compliant contrast ratios).

---

## Key Modules & Capabilities

1. **Mandatory Google OAuth 2.0 (Candidates & Recruiters)**
   - PKCE, strict nonce/state verification, short-lived tokens in `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
   - Rotation-based refresh token family tracker (auto-invalidates entire session family on token replay).

2. **Dual-Factor OTP-Only Admin Gateway (High-Security Rule)**
   - Hidden administration route. Zero password login, zero Google login.
   - Strictly bound to environment allowlist:
     
   - Requires simultaneous dual verification: Email OTP + SMS/WhatsApp OTP.
   - Immutable write-only audit logs.

3. **Anti-Fraud & Trust Engine**
   - Automated NLP scam detection: Flags any job demanding fees/deposits/training costs.
   - Blocks personal domains (gmail, yahoo), WhatsApp/Telegram hiring redirects, and duplicate scam descriptions.
   - Recruiter identity verified via official company domain, GST/CIN, and phone OTP.
   - Visual Trust Badges: `Verified Company`, `Verified Recruiter`, `Source Verified`.

4. **Skill Match & Gap Analysis**
   - Deep eligibility filter: Passing Year (2022-2026), Degrees, Branch, Min CGPA/Percentage.
   - Resume PDF parser extracts candidate skills and generates a dynamic Match Score (%).
   - Missing skills roadmap with estimated learning hours and curated free learning resources.

5. **User-Controlled Auto-Apply**
   - Candidate sets rules: minimum match score (e.g. 80%), preferred locations, salary floors, and daily caps (max 15).
   - Only verified jobs matching strict eligibility criteria are submitted.
   - Real-time application tracker: `Applied` ➔ `Viewed` ➔ `Shortlisted` ➔ `Interview` ➔ `Offer`.

6. **Zero-Ad Policy & Privacy**
   - Zero third-party ad networks, no sponsored spam rankings, no data brokerage.
   - GDPR & IT Act compliance: "Delete My Account & Data" one-click purge.

---

## Directory Layout
```
takshvaya/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & Zod validation
│   │   ├── database/        # PostgreSQL schema, migrations & seeders
│   │   ├── modules/
│   │   │   ├── auth/        # Google OAuth, Session Family & Dual-Factor Admin OTP
│   │   │   ├── jobs/        # Fresher job search, filters & aggregator
│   │   │   ├── companies/   # Company pages, reviews & ratings
│   │   │   ├── skills/      # Resume parsing, skill gap analysis & roadmaps
│   │   │   ├── auto-apply/  # User-controlled auto-apply runner
│   │   │   ├── anti-fraud/  # Scam detector, trust scoring & report queue
│   │   │   ├── recruiter/   # Recruiter verification & ATS pipeline
│   │   │   └── admin/       # Hidden route controller & audit logs
│   │   ├── security/        # CSRF, rate-limiting, CSP, input sanitizers
│   │   └── server.ts        # Express/Node entrypoint
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js 14/15 App Router pages
│   │   ├── components/      # UI component library (WCAG AA, Tailwind)
│   │   ├── lib/             # API client, auth context, hooks
│   │   └── styles/          # Tailwind custom palette & animations
│   ├── package.json
│   └── tailwind.config.js
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
└── docs/
    ├── ARCHITECTURE_AND_DESIGN.md
    ├── SECURITY_AND_THREAT_MODEL.md
    └── API_SPECIFICATION.md
```
