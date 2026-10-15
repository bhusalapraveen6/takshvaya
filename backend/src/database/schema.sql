-- ============================================================================
-- Takshvaya (तक्ष्वया) - Production PostgreSQL Database Schema
-- Focus: Freshers (0-2 Yrs), High-Security, Anti-Fraud, Zero-Ads
-- ============================================================================

-- Extensions for UUID generation and full-text searching
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enum Definitions
CREATE TYPE user_role AS ENUM ('JOB_SEEKER', 'RECRUITER', 'ADMIN');
CREATE TYPE recruiter_status AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'SUSPENDED');
CREATE TYPE trust_badge_type AS ENUM ('VERIFIED_COMPANY', 'VERIFIED_RECRUITER', 'SOURCE_VERIFIED');
CREATE TYPE job_status AS ENUM ('DRAFT', 'PENDING_MODERATION', 'ACTIVE', 'EXPIRED', 'FLAGGED', 'REJECTED');
CREATE TYPE job_type AS ENUM ('FULL_TIME', 'INTERNSHIP', 'PART_TIME', 'CONTRACT');
CREATE TYPE workplace_type AS ENUM ('ON_SITE', 'REMOTE', 'HYBRID');
CREATE TYPE application_status AS ENUM ('APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'OFFER');
CREATE TYPE fraud_report_reason AS ENUM (
    'ASKS_FOR_MONEY',
    'UNREALISTIC_SALARY',
    'PERSONAL_EMAIL_CONTACT',
    'WHATSAPP_OR_TELEGRAM_ONLY',
    'DUPLICATE_OR_SPAM',
    'MISLEADING_DESCRIPTION',
    'EXPIRED_OR_INACTIVE',
    'OTHER'
);

-- ----------------------------------------------------------------------------
-- 1. USERS & AUTHENTICATION TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    phone_number VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    role user_role NOT NULL DEFAULT 'JOB_SEEKER',
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    two_factor_secret VARCHAR(255),
    is_two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_role ON users(role);

-- ----------------------------------------------------------------------------
-- 2. REFRESH TOKENS & SESSION FAMILY (Detects Token Reuse & Theft)
-- ----------------------------------------------------------------------------
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    session_family UUID NOT NULL DEFAULT uuid_generate_v4(),
    is_revoked BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

CREATE INDEX idx_refresh_tokens_family ON refresh_tokens(session_family);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- ----------------------------------------------------------------------------
-- 3. CANDIDATE PROFILE (Freshers Focus: Education, CGPA, Passing Year, Skills)
-- ----------------------------------------------------------------------------
CREATE TABLE candidate_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(255),
    bio TEXT,
    degree VARCHAR(100),
    branch VARCHAR(100),
    institution_name VARCHAR(255),
    graduation_year INT CHECK (graduation_year >= 2018 AND graduation_year <= 2030),
    cgpa_or_percentage DECIMAL(5, 2) CHECK (cgpa_or_percentage >= 0 AND cgpa_or_percentage <= 100),
    experience_months INT DEFAULT 0 CHECK (experience_months >= 0 AND experience_months <= 36), -- 0-2 yrs focus
    skills TEXT[] DEFAULT '{}',
    certifications JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    resume_storage_key VARCHAR(255),
    resume_original_name VARCHAR(255),
    resume_parsed_text TEXT,
    resume_uploaded_at TIMESTAMP WITH TIME ZONE,
    preferred_locations TEXT[] DEFAULT '{}',
    preferred_roles TEXT[] DEFAULT '{}',
    min_expected_salary INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidate_profiles_user ON candidate_profiles(user_id);
CREATE INDEX idx_candidate_profiles_skills ON candidate_profiles USING GIN(skills);

-- ----------------------------------------------------------------------------
-- 4. COMPANIES & VERIFICATION
-- ----------------------------------------------------------------------------
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    official_website VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    logo_url TEXT,
    about TEXT,
    industry VARCHAR(100) NOT NULL,
    company_size VARCHAR(50), -- e.g. '1-50', '51-200', '201-1000', '1000+'
    company_type VARCHAR(50) DEFAULT 'STARTUP', -- STARTUP, MNC, PRODUCT, SERVICE, GOVT
    founded_year INT,
    headquarters VARCHAR(150),
    gst_or_cin VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    trust_score INT DEFAULT 70 CHECK (trust_score >= 0 AND trust_score <= 100),
    rating_overall DECIMAL(3, 2) DEFAULT 0.0,
    rating_work_culture DECIMAL(3, 2) DEFAULT 0.0,
    rating_salary DECIMAL(3, 2) DEFAULT 0.0,
    rating_growth DECIMAL(3, 2) DEFAULT 0.0,
    rating_work_life_balance DECIMAL(3, 2) DEFAULT 0.0,
    rating_fresher_friendliness DECIMAL(3, 2) DEFAULT 0.0,
    review_count INT DEFAULT 0,
    hiring_process_steps JSONB DEFAULT '["Resume Screening", "Technical Assessment", "Technical Interview", "HR Discussion"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_domain ON companies(domain);
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_is_verified ON companies(is_verified);

-- ----------------------------------------------------------------------------
-- 5. RECRUITER PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE recruiter_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    corporate_email VARCHAR(255) NOT NULL,
    corporate_email_verified BOOLEAN DEFAULT FALSE,
    designation VARCHAR(150) NOT NULL,
    verification_documents JSONB DEFAULT '[]'::jsonb,
    status recruiter_status DEFAULT 'PENDING_VERIFICATION',
    rejection_reason TEXT,
    phone_otp_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recruiter_profiles_company ON recruiter_profiles(company_id);
CREATE INDEX idx_recruiter_profiles_status ON recruiter_profiles(status);

-- ----------------------------------------------------------------------------
-- 6. JOBS TABLE (With Fresher Eligibility & Anti-Fraud Checks)
-- ----------------------------------------------------------------------------
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    recruiter_id UUID REFERENCES recruiter_profiles(id) ON DELETE SET NULL,
    role_category VARCHAR(100) NOT NULL, -- e.g. 'Software Engineer', 'Data Analyst'
    description TEXT NOT NULL,
    responsibilities TEXT[] DEFAULT '{}',
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    optional_skills TEXT[] DEFAULT '{}',
    
    -- Fresher Eligibility Rules
    min_exp_years INT DEFAULT 0,
    max_exp_years INT DEFAULT 2,
    eligible_degrees TEXT[] DEFAULT '{"B.Tech", "B.E", "BCA", "MCA", "B.Sc", "Any Graduate"}',
    eligible_branches TEXT[] DEFAULT '{"All"}',
    min_graduation_year INT DEFAULT 2022,
    max_graduation_year INT DEFAULT 2026,
    min_cgpa_or_percentage DECIMAL(5, 2) DEFAULT 0.0,
    
    -- Compensation (Mandatory range to prevent deceptive postings)
    salary_min_inr INT NOT NULL,
    salary_max_inr INT NOT NULL,
    salary_is_negotiable BOOLEAN DEFAULT FALSE,
    
    -- Location & Work Mode
    location_city VARCHAR(100) NOT NULL,
    workplace_type workplace_type DEFAULT 'ON_SITE',
    job_type job_type DEFAULT 'FULL_TIME',
    vacancies INT DEFAULT 1,
    
    -- Source and Trust
    trust_badge trust_badge_type DEFAULT 'VERIFIED_COMPANY',
    source_origin VARCHAR(100) DEFAULT 'DIRECT_POST', -- 'DIRECT_POST', 'CAREER_API', 'OFFICIAL_RSS'
    original_apply_url TEXT,
    fraud_risk_score INT DEFAULT 0 CHECK (fraud_risk_score >= 0 AND fraud_risk_score <= 100),
    fraud_check_passed BOOLEAN DEFAULT TRUE,
    fraud_check_notes TEXT,
    
    -- State & Metrics
    status job_status DEFAULT 'ACTIVE',
    application_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_status_expiry ON jobs(status, expires_at);
CREATE INDEX idx_jobs_role_category ON jobs(role_category);
CREATE INDEX idx_jobs_location ON jobs(location_city);
CREATE INDEX idx_jobs_skills ON jobs USING GIN(required_skills);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_title_trgm ON jobs USING GIN(title gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- 7. APPLICATIONS & TRACKING
-- ----------------------------------------------------------------------------
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recruiter_notes TEXT,
    resume_storage_key VARCHAR(255) NOT NULL,
    match_score INT NOT NULL DEFAULT 0,
    matched_skills TEXT[] DEFAULT '{}',
    missing_skills TEXT[] DEFAULT '{}',
    is_auto_applied BOOLEAN DEFAULT FALSE,
    status application_status DEFAULT 'APPLIED',
    status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_candidate_job UNIQUE (job_id, candidate_id)
);

CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);

-- ----------------------------------------------------------------------------
-- 8. AUTO APPLY SETTINGS (Opt-In with strict constraints)
-- ----------------------------------------------------------------------------
CREATE TABLE auto_apply_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT FALSE,
    min_match_score INT DEFAULT 80 CHECK (min_match_score >= 50 AND min_match_score <= 100),
    preferred_roles TEXT[] NOT NULL DEFAULT '{}',
    preferred_locations TEXT[] NOT NULL DEFAULT '{}',
    min_salary_inr INT DEFAULT 300000,
    daily_application_limit INT DEFAULT 5 CHECK (daily_application_limit >= 1 AND daily_application_limit <= 15),
    applications_today INT DEFAULT 0,
    excluded_company_ids UUID[] DEFAULT '{}',
    last_reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 9. SAVED JOBS & ALERTS
-- ----------------------------------------------------------------------------
CREATE TABLE saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_saved_user_job UNIQUE (user_id, job_id)
);

CREATE TABLE job_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_category VARCHAR(100),
    location VARCHAR(100),
    min_salary INT,
    frequency VARCHAR(20) DEFAULT 'DAILY', -- 'INSTANT', 'DAILY', 'WEEKLY'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 10. REVIEWS & INTERVIEW EXPERIENCES (Verified Candidates Only)
-- ----------------------------------------------------------------------------
CREATE TABLE company_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating_overall INT CHECK (rating_overall >= 1 AND rating_overall <= 5),
    rating_work_culture INT CHECK (rating_work_culture >= 1 AND rating_work_culture <= 5),
    rating_salary INT CHECK (rating_salary >= 1 AND rating_salary <= 5),
    rating_growth INT CHECK (rating_growth >= 1 AND rating_growth <= 5),
    rating_work_life_balance INT CHECK (rating_work_life_balance >= 1 AND rating_work_life_balance <= 5),
    rating_fresher_friendliness INT CHECK (rating_fresher_friendliness >= 1 AND rating_fresher_friendliness <= 5),
    review_title VARCHAR(255) NOT NULL,
    pros TEXT NOT NULL,
    cons TEXT NOT NULL,
    interview_process_experience TEXT,
    interview_questions TEXT[] DEFAULT '{}',
    is_fresher_review BOOLEAN DEFAULT TRUE,
    is_moderated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 11. ANTI-FRAUD & REPORTING TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE job_fraud_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason fraud_report_reason NOT NULL,
    comments TEXT,
    proof_attachments JSONB DEFAULT '[]'::jsonb,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blacklisted_identifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier_type VARCHAR(50) NOT NULL, -- 'DOMAIN', 'PHONE', 'GST_CIN', 'EMAIL'
    identifier_value VARCHAR(255) UNIQUE NOT NULL,
    reason TEXT NOT NULL,
    added_by VARCHAR(100) DEFAULT 'SYSTEM_FRAUD_ENGINE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 12. ADMIN DUAL-FACTOR OTP STORE & IMMUTABLE AUDIT LOGS
-- ----------------------------------------------------------------------------
-- Stores cryptographically hashed OTPs for the allowlisted admin identity
CREATE TABLE admin_otp_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_email VARCHAR(255) NOT NULL,
    admin_phone VARCHAR(20) NOT NULL,
    email_otp_hash VARCHAR(255) NOT NULL,
    phone_otp_hash VARCHAR(255) NOT NULL,
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_consumed BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL, -- e.g. 'BAN_RECRUITER', 'APPROVE_COMPANY', 'HIDE_JOB'
    target_entity VARCHAR(50) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    changes_diff JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX idx_admin_audit_logs_date ON admin_audit_logs(created_at);
