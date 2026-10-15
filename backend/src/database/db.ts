import crypto from 'crypto';

export type UserRole = 'JOB_SEEKER' | 'RECRUITER' | 'ADMIN';
export type JobStatus = 'ACTIVE' | 'FLAGGED' | 'EXPIRED' | 'REJECTED';
export type TrustBadge = 'VERIFIED_COMPANY' | 'VERIFIED_RECRUITER' | 'SOURCE_VERIFIED';
export type ApplicationStatus = 'APPLIED' | 'VIEWED' | 'SHORTLISTED' | 'INTERVIEW' | 'REJECTED' | 'OFFER';

export interface User {
  id: string;
  email: string;
  google_id?: string;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  phone_verified: boolean;
  role: UserRole;
  is_active: boolean;
  is_banned: boolean;
  ban_reason?: string;
  created_at: string;
  last_login_at?: string;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  session_family: string;
  is_revoked: boolean;
  expires_at: string;
  created_at: string;
  ip_address: string;
  user_agent: string;
}

export interface CandidateProfile {
  id: string;
  user_id: string;
  headline?: string;
  degree: string;
  branch: string;
  institution_name: string;
  graduation_year: number;
  cgpa_or_percentage: number;
  experience_months: number;
  skills: string[];
  certifications: string[];
  projects: Array<{ title: string; description: string; tech: string[]; link?: string }>;
  resume_storage_key?: string;
  resume_original_name?: string;
  resume_parsed_text?: string;
  preferred_locations: string[];
  preferred_roles: string[];
  min_expected_salary: number;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  official_website: string;
  domain: string;
  logo_url: string;
  about: string;
  industry: string;
  company_size: string;
  company_type: 'STARTUP' | 'MNC' | 'PRODUCT' | 'GOVERNMENT';
  headquarters: string;
  gst_or_cin: string;
  is_verified: boolean;
  trust_score: number;
  rating_overall: number;
  rating_work_culture: number;
  rating_salary: number;
  rating_growth: number;
  rating_work_life_balance: number;
  rating_fresher_friendliness: number;
  review_count: number;
  hiring_process_steps: string[];
}

export interface RecruiterProfile {
  id: string;
  user_id: string;
  company_id: string;
  corporate_email: string;
  corporate_email_verified: boolean;
  designation: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  phone_otp_verified: boolean;
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  company_id: string;
  recruiter_id?: string;
  role_category: string;
  description: string;
  responsibilities: string[];
  required_skills: string[];
  optional_skills: string[];
  min_exp_years: number;
  max_exp_years: number;
  eligible_degrees: string[];
  eligible_branches: string[];
  min_graduation_year: number;
  max_graduation_year: number;
  min_cgpa_or_percentage: number;
  salary_min_inr: number;
  salary_max_inr: number;
  location_city: string;
  workplace_type: 'ON_SITE' | 'REMOTE' | 'HYBRID';
  job_type: 'FULL_TIME' | 'INTERNSHIP';
  vacancies: number;
  trust_badge: TrustBadge;
  source_origin: string;
  original_apply_url?: string;
  fraud_risk_score: number;
  fraud_check_passed: boolean;
  fraud_check_notes?: string;
  status: JobStatus;
  application_count: number;
  views_count: number;
  expires_at: string;
  last_verified_at: string;
  created_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  resume_storage_key: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  is_auto_applied: boolean;
  recruiter_notes?: string;
  status: ApplicationStatus;
  status_updated_at: string;
  created_at: string;
}

export interface AutoApplySettings {
  id: string;
  user_id: string;
  is_enabled: boolean;
  min_match_score: number;
  preferred_roles: string[];
  preferred_locations: string[];
  min_salary_inr: number;
  daily_application_limit: number;
  applications_today: number;
  excluded_company_ids: string[];
  last_reset_date: string;
}

export interface AdminOTPSession {
  id: string;
  admin_email: string;
  admin_phone: string;
  email_otp_hash: string;
  phone_otp_hash: string;
  attempts: number;
  max_attempts: number;
  is_consumed: boolean;
  expires_at: number;
  ip_address: string;
  user_agent: string;
  created_at: number;
}

export interface AdminAuditLog {
  id: string;
  admin_email: string;
  action: string;
  target_entity: string;
  target_id: string;
  ip_address: string;
  user_agent: string;
  changes_diff: any;
  created_at: string;
}

// In-Memory Database Store (with Seed Data for immediate testing & demonstration)
class DatabaseStore {
  users: Map<string, User> = new Map();
  refreshTokens: Map<string, RefreshToken> = new Map();
  candidateProfiles: Map<string, CandidateProfile> = new Map();
  companies: Map<string, Company> = new Map();
  recruiterProfiles: Map<string, RecruiterProfile> = new Map();
  jobs: Map<string, Job> = new Map();
  applications: Map<string, Application> = new Map();
  autoApplySettings: Map<string, AutoApplySettings> = new Map();
  adminOTPSessions: Map<string, AdminOTPSession> = new Map();
  adminAuditLogs: AdminAuditLog[] = [];
  savedJobs: Set<string> = new Set(); // format: `${userId}:${jobId}`
  fraudReports: any[] = [];
  blacklistedIdentifiers: Set<string> = new Set();
  companyReviews: Array<{
    id: string;
    company_id: string;
    user_id: string;
    author_name: string;
    rating: number;
    fresher_friendliness: number;
    title: string;
    content: string;
    pros?: string;
    cons?: string;
    created_at: string;
  }> = [];
  jobAlerts: Map<string, Array<{ id: string; role: string; location: string; minSalary: number; created_at: string }>> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Verified Companies
    const googleCo: Company = {
      id: 'comp-1',
      name: 'Google India',
      slug: 'google-india',
      official_website: 'https://careers.google.com',
      domain: 'google.com',
      logo_url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&auto=format&fit=crop&q=80',
      about: 'Google is a global technology leader focused on building tools to help people organize and access information.',
      industry: 'Information Technology',
      company_size: '1000+',
      company_type: 'MNC',
      headquarters: 'Bengaluru / Hyderabad',
      gst_or_cin: 'U72900KA2003PTC033028',
      is_verified: true,
      trust_score: 99,
      rating_overall: 4.6,
      rating_work_culture: 4.8,
      rating_salary: 4.9,
      rating_growth: 4.5,
      rating_work_life_balance: 4.4,
      rating_fresher_friendliness: 4.7,
      review_count: 342,
      hiring_process_steps: ['Online Coding Challenge (LeetCode Medium)', 'Technical Rounds (Data Structures, System Fundamentals)', 'Googliness & Leadership Discussion'],
    };

    const razorpayCo: Company = {
      id: 'comp-2',
      name: 'Razorpay',
      slug: 'razorpay',
      official_website: 'https://razorpay.com',
      domain: 'razorpay.com',
      logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
      about: 'Razorpay is India’s leading full-stack financial solutions company powering business payments and banking.',
      industry: 'FinTech',
      company_size: '1000+',
      company_type: 'PRODUCT',
      headquarters: 'Bengaluru, Karnataka',
      gst_or_cin: 'U72200KA2013PTC097389',
      is_verified: true,
      trust_score: 98,
      rating_overall: 4.4,
      rating_work_culture: 4.5,
      rating_salary: 4.7,
      rating_growth: 4.6,
      rating_work_life_balance: 4.1,
      rating_fresher_friendliness: 4.8,
      review_count: 189,
      hiring_process_steps: ['Machine Coding Round (Clean Architecture)', 'System Design & Problem Solving', 'Culture Fit Conversation'],
    };

    const tataDigital: Company = {
      id: 'comp-3',
      name: 'Tata Digital',
      slug: 'tata-digital',
      official_website: 'https://tatadigital.com',
      domain: 'tatadigital.com',
      logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&auto=format&fit=crop&q=80',
      about: 'Tata Digital is building the Tata Neu super-app ecosystem for seamless omni-channel retail and financial services.',
      industry: 'E-commerce / Consumer Tech',
      company_size: '1000+',
      company_type: 'MNC',
      headquarters: 'Mumbai / Bengaluru',
      gst_or_cin: 'U72900MH2019PLC322301',
      is_verified: true,
      trust_score: 96,
      rating_overall: 4.2,
      rating_work_culture: 4.3,
      rating_salary: 4.4,
      rating_growth: 4.3,
      rating_work_life_balance: 4.0,
      rating_fresher_friendliness: 4.5,
      review_count: 94,
      hiring_process_steps: ['Aptitude & Technical MCQ', 'Live Pair Programming', 'Managerial & HR Interview'],
    };

    this.companies.set(googleCo.id, googleCo);
    this.companies.set(razorpayCo.id, razorpayCo);
    this.companies.set(tataDigital.id, tataDigital);

    // 2. Seed Jobs strictly tailored for Freshers (0-2 Yrs)
    const job1: Job = {
      id: 'job-1',
      title: 'Associate Software Engineer - Frontend (React / TypeScript)',
      slug: 'associate-software-engineer-frontend-razorpay',
      company_id: razorpayCo.id,
      role_category: 'Software Engineer',
      description: 'Join the Razorpay Checkout team building high-performance, accessible checkout experiences used by millions. You will build resilient UI components, write tests, and collaborate with product designers.',
      responsibilities: [
        'Develop responsive web interfaces using React, Next.js, and TypeScript',
        'Optimize client-side performance, core web vitals, and asset loading',
        'Participate in peer code reviews and contribute to design systems',
        'Write automated unit and integration tests (Jest, Playwright)'
      ],
      required_skills: ['React', 'JavaScript', 'TypeScript', 'HTML/CSS', 'Git'],
      optional_skills: ['Next.js', 'Tailwind CSS', 'Redux', 'Jest'],
      min_exp_years: 0,
      max_exp_years: 1,
      eligible_degrees: ['B.Tech', 'B.E', 'BCA', 'MCA', 'B.Sc Computer Science'],
      eligible_branches: ['Computer Science', 'Information Technology', 'ECE', 'All Engineering'],
      min_graduation_year: 2023,
      max_graduation_year: 2026,
      min_cgpa_or_percentage: 6.5,
      salary_min_inr: 800000,
      salary_max_inr: 1400000,
      location_city: 'Bengaluru',
      workplace_type: 'HYBRID',
      job_type: 'FULL_TIME',
      vacancies: 4,
      trust_badge: 'VERIFIED_COMPANY',
      source_origin: 'DIRECT_POST',
      fraud_risk_score: 0,
      fraud_check_passed: true,
      status: 'ACTIVE',
      application_count: 38,
      views_count: 512,
      expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      last_verified_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    };

    const job2: Job = {
      id: 'job-2',
      title: 'Graduate Data Analyst (Python / SQL / Tableau)',
      slug: 'graduate-data-analyst-tata-digital',
      company_id: tataDigital.id,
      role_category: 'Data Analyst',
      description: 'Tata Digital is seeking enthusiastic freshers who love finding patterns in massive datasets. You will write SQL queries, build executive dashboards in Tableau, and automate reporting pipelines using Python.',
      responsibilities: [
        'Extract, clean, and validate data from PostgreSQL and Snowflake warehouses',
        'Create interactive dashboards and visual KPI scorecards for product managers',
        'Perform exploratory data analysis to identify user retention drivers',
        'Collaborate with engineering teams on data instrumentation'
      ],
      required_skills: ['SQL', 'Python', 'Excel', 'Data Analysis'],
      optional_skills: ['Tableau', 'Power BI', 'Pandas', 'Statistics'],
      min_exp_years: 0,
      max_exp_years: 1,
      eligible_degrees: ['B.Tech', 'B.E', 'B.Sc', 'BCA', 'MCA', 'B.Com with Analytics'],
      eligible_branches: ['All Branches'],
      min_graduation_year: 2022,
      max_graduation_year: 2026,
      min_cgpa_or_percentage: 6.0,
      salary_min_inr: 650000,
      salary_max_inr: 1000000,
      location_city: 'Mumbai',
      workplace_type: 'HYBRID',
      job_type: 'FULL_TIME',
      vacancies: 6,
      trust_badge: 'VERIFIED_COMPANY',
      source_origin: 'CAREER_API',
      original_apply_url: 'https://tatadigital.com/careers/analyst-fresher',
      fraud_risk_score: 0,
      fraud_check_passed: true,
      status: 'ACTIVE',
      application_count: 52,
      views_count: 730,
      expires_at: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString(),
      last_verified_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    };

    const job3: Job = {
      id: 'job-3',
      title: 'Junior Cloud & DevOps Trainee',
      slug: 'junior-cloud-devops-trainee-google',
      company_id: googleCo.id,
      role_category: 'DevOps / Cloud',
      description: 'Google Cloud engineering team is welcoming enthusiastic freshers to join our Cloud Reliability and Infrastructure team. You will learn modern Kubernetes, CI/CD pipelines, Linux internals, and infrastructure monitoring.',
      responsibilities: [
        'Assist in provisioning and managing Linux servers and container clusters',
        'Implement automated CI/CD workflows using GitHub Actions and ArgoCD',
        'Monitor platform health, telemetry alerts, and latency anomalies',
        'Document incident post-mortems and infrastructure runbooks'
      ],
      required_skills: ['Linux', 'Git', 'Networking Basics', 'Python / Bash'],
      optional_skills: ['Docker', 'Kubernetes', 'AWS/GCP Basics', 'Terraform'],
      min_exp_years: 0,
      max_exp_years: 2,
      eligible_degrees: ['B.Tech', 'B.E', 'MCA', 'M.Tech'],
      eligible_branches: ['Computer Science', 'IT', 'ECE', 'EE'],
      min_graduation_year: 2023,
      max_graduation_year: 2026,
      min_cgpa_or_percentage: 7.0,
      salary_min_inr: 1200000,
      salary_max_inr: 1800000,
      location_city: 'Hyderabad',
      workplace_type: 'ON_SITE',
      job_type: 'FULL_TIME',
      vacancies: 3,
      trust_badge: 'SOURCE_VERIFIED',
      source_origin: 'OFFICIAL_CAREERS_PAGE',
      original_apply_url: 'https://careers.google.com/jobs/results/devops-fresher',
      fraud_risk_score: 0,
      fraud_check_passed: true,
      status: 'ACTIVE',
      application_count: 85,
      views_count: 1420,
      expires_at: new Date(Date.now() + 40 * 24 * 3600 * 1000).toISOString(),
      last_verified_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    };

    this.jobs.set(job1.id, job1);
    this.jobs.set(job2.id, job2);
    this.jobs.set(job3.id, job3);

    // 3. Seed Demo Candidate User for immediate review
    const demoCandidate: User = {
      id: 'usr-candidate-1',
      email: 'fresher.demo@gmail.com',
      google_id: 'google-oauth2|1092837465928374',
      full_name: 'Aditya Sharma',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      phone_number: '9876543210',
      phone_verified: true,
      role: 'JOB_SEEKER',
      is_active: true,
      is_banned: false,
      created_at: new Date().toISOString(),
    };
    this.users.set(demoCandidate.id, demoCandidate);

    const demoProfile: CandidateProfile = {
      id: 'prof-candidate-1',
      user_id: demoCandidate.id,
      headline: 'Aspiring Frontend Engineer | React & TypeScript Enthusiast',
      degree: 'B.Tech',
      branch: 'Computer Science',
      institution_name: 'National Institute of Technology',
      graduation_year: 2024,
      cgpa_or_percentage: 8.4,
      experience_months: 6,
      skills: ['React', 'JavaScript', 'TypeScript', 'HTML/CSS', 'Git', 'Tailwind CSS'],
      certifications: ['Meta Frontend Developer Professional Certificate', 'HackerRank Problem Solving (Gold)'],
      projects: [
        {
          title: 'Campus Food Delivery PWA',
          description: 'A responsive progressive web app built with React & Firebase with live order tracking.',
          tech: ['React', 'Firebase', 'Tailwind CSS'],
          link: 'https://github.com/demo/campus-delivery'
        }
      ],
      preferred_locations: ['Bengaluru', 'Hyderabad', 'Remote'],
      preferred_roles: ['Software Engineer', 'Frontend Developer'],
      min_expected_salary: 700000
    };
    this.candidateProfiles.set(demoCandidate.id, demoProfile);

    const demoAutoApply: AutoApplySettings = {
      id: 'auto-1',
      user_id: demoCandidate.id,
      is_enabled: true,
      min_match_score: 80,
      preferred_roles: ['Software Engineer', 'Frontend Developer'],
      preferred_locations: ['Bengaluru', 'Remote'],
      min_salary_inr: 700000,
      daily_application_limit: 5,
      applications_today: 1,
      excluded_company_ids: [],
      last_reset_date: new Date().toISOString().split('T')[0],
    };
    this.autoApplySettings.set(demoCandidate.id, demoAutoApply);

    // Initial application
    const app1: Application = {
      id: 'app-1',
      job_id: job1.id,
      candidate_id: demoCandidate.id,
      resume_storage_key: 'resumes/demo-resume-aditya.pdf',
      match_score: 88,
      matched_skills: ['React', 'JavaScript', 'TypeScript', 'HTML/CSS', 'Git'],
      missing_skills: ['Next.js', 'Jest'],
      is_auto_applied: true,
      status: 'SHORTLISTED',
      status_updated_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    };
    this.applications.set(app1.id, app1);
  }
}

export const DB = new DatabaseStore();
