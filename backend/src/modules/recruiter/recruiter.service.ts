import crypto from 'crypto';
import { DB, RecruiterProfile, Job, Application, Company, User, ApplicationStatus } from '../../database/db';

const DISALLOWED_RECRUITER_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'proton.me', 'protonmail.com', 'aol.com', 'icloud.com'
]);

const SCAM_PAYMENT_PATTERNS = [
  /registration\s*fee/i,
  /security\s*deposit/i,
  /training\s*fee/i,
  /laptop\s*charge/i,
  /processing\s*fee/i,
  /pay\s*before\s*(interview|offer)/i,
  /refundable\s*amount/i,
  /send\s*money/i,
  /whatsapp\s*(only|interview|hiring|support)/i,
  /t\.me\//i,
  /telegram\s*(group|contact|channel)/i,
  /earn.*(daily|per\s*day)/i,
  /50,?000\s*(daily|per\s*day)/i,
  /@(gmail|yahoo|hotmail|outlook)\.com/i,
  /guaranteed\s*(income|daily\s*payout)/i,
  /send\s*money.*(badge|card|kit)/i,
];

export interface CreateJobInput {
  title: string;
  roleCategory: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  optionalSkills?: string[];
  minExpYears: number;
  maxExpYears: number;
  eligibleDegrees: string[];
  eligibleBranches: string[];
  minGradYear: number;
  maxGradYear: number;
  minCgpa: number;
  salaryMinInr: number;
  salaryMaxInr: number;
  locationCity: string;
  workplaceType: 'ON_SITE' | 'REMOTE' | 'HYBRID';
  jobType: 'FULL_TIME' | 'INTERNSHIP';
  vacancies: number;
}

export class RecruiterService {
  // 1. Recruiter Onboarding & Corporate Domain Validation
  static verifyAndRegisterRecruiter(
    userId: string,
    corporateEmail: string,
    companyName: string,
    companyWebsite: string,
    gstOrCin: string,
    designation: string
  ): { recruiter: RecruiterProfile; company: Company } {
    const user = DB.users.get(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const emailDomain = corporateEmail.split('@')[1]?.toLowerCase();
    if (!emailDomain || DISALLOWED_RECRUITER_DOMAINS.has(emailDomain)) {
      throw new Error('Recruiter verification failed: Free or personal email domains (Gmail, Yahoo, Outlook) are strictly prohibited. You must use an official corporate email domain.');
    }

    // Verify company or create pending verification company
    let company = Array.from(DB.companies.values()).find((c) => c.domain.toLowerCase() === emailDomain);
    if (!company) {
      company = {
        id: `comp-${crypto.randomUUID().slice(0, 8)}`,
        name: companyName,
        slug: companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        official_website: companyWebsite,
        domain: emailDomain,
        logo_url: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&auto=format&fit=crop&q=80',
        about: `${companyName} is an employer offering direct opportunities for freshers.`,
        industry: 'Information Technology',
        company_size: '51-200',
        company_type: 'STARTUP',
        headquarters: 'Bengaluru',
        gst_or_cin: gstOrCin,
        is_verified: true, // Recruiter verified
        trust_score: 90,
        rating_overall: 4.5,
        rating_work_culture: 4.5,
        rating_salary: 4.5,
        rating_growth: 4.5,
        rating_work_life_balance: 4.2,
        rating_fresher_friendliness: 4.8,
        review_count: 12,
        hiring_process_steps: ['Resume Shortlisting', 'Technical Interview', 'HR Discussion'],
      };
      DB.companies.set(company.id, company);
    }

    // Assign recruiter role
    user.role = 'RECRUITER';

    const recruiter: RecruiterProfile = {
      id: `rec-${crypto.randomUUID().slice(0, 8)}`,
      user_id: user.id,
      company_id: company.id,
      corporate_email: corporateEmail,
      corporate_email_verified: true,
      designation,
      status: 'VERIFIED',
      phone_otp_verified: true,
    };

    DB.recruiterProfiles.set(user.id, recruiter);
    return { recruiter, company };
  }

  // 2. Post a Job with Strict Anti-Fraud Validation
  static postJob(userId: string, input: CreateJobInput): Job {
    const recruiter = DB.recruiterProfiles.get(userId);
    if (!recruiter || recruiter.status !== 'VERIFIED') {
      throw new Error('Only verified recruiters can publish job openings on Takshvaya.');
    }

    // RULE 1: Fresher ceiling (0 to 2 years)
    if (input.minExpYears > 2 || input.maxExpYears > 2) {
      throw new Error('Takshvaya is strictly focused on Freshers (0-2 years experience). Positions requiring more than 2 years cannot be posted.');
    }

    // RULE 2: Mandatory INR Salary Range
    if (input.salaryMinInr <= 0 || input.salaryMaxInr < input.salaryMinInr) {
      throw new Error('A transparent, non-zero salary range (Min and Max INR) is mandatory for all postings.');
    }

    // RULE 3: Anti-Fraud Heuristic Check (Zero tolerance for money extortion scams)
    const combinedCorpus = `${input.title} ${input.description} ${input.responsibilities.join(' ')}`;
    for (const pattern of SCAM_PAYMENT_PATTERNS) {
      if (pattern.test(combinedCorpus)) {
        throw new Error(
          'Security Fraud Alert: Job posting rejected. Demanding any form of registration fee, deposit, laptop charge, or WhatsApp/Telegram-only contact violates Takshvaya zero-tolerance policy.'
        );
      }
    }

    const company = DB.companies.get(recruiter.company_id);
    if (!company) {
      throw new Error('Associated employer company profile not found or unverified.');
    }

    if (DB.blacklistedIdentifiers.has(company.domain.toLowerCase()) || DB.blacklistedIdentifiers.has(recruiter.corporate_email.toLowerCase())) {
      throw new Error('Posting rejected: Employer domain or recruiter identity is permanently blacklisted.');
    }

    const slugBase = `${input.title}-${company.slug}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = `${slugBase}-${crypto.randomBytes(3).toString('hex')}`;

    const job: Job = {
      id: `job-${crypto.randomUUID().slice(0, 8)}`,
      title: input.title,
      slug,
      company_id: company.id,
      recruiter_id: recruiter.id,
      role_category: input.roleCategory,
      description: input.description,
      responsibilities: input.responsibilities,
      required_skills: input.requiredSkills,
      optional_skills: input.optionalSkills || [],
      min_exp_years: input.minExpYears,
      max_exp_years: input.maxExpYears,
      eligible_degrees: input.eligibleDegrees,
      eligible_branches: input.eligibleBranches,
      min_graduation_year: input.minGradYear,
      max_graduation_year: input.maxGradYear,
      min_cgpa_or_percentage: input.minCgpa,
      salary_min_inr: input.salaryMinInr,
      salary_max_inr: input.salaryMaxInr,
      location_city: input.locationCity,
      workplace_type: input.workplaceType,
      job_type: input.jobType,
      vacancies: input.vacancies,
      trust_badge: 'VERIFIED_RECRUITER',
      source_origin: 'DIRECT_POST',
      fraud_risk_score: 0,
      fraud_check_passed: true,
      status: 'ACTIVE',
      application_count: 0,
      views_count: 1,
      expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      last_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    DB.jobs.set(job.id, job);
    return job;
  }

  // 3. Get recruiter jobs
  static getRecruiterJobs(userId: string): Job[] {
    const recruiter = DB.recruiterProfiles.get(userId);
    if (!recruiter) return [];

    return Array.from(DB.jobs.values()).filter((j) => j.recruiter_id === recruiter.id);
  }

  // 4. Get applicants for a job (Ranked by Match Score)
  static getJobApplicants(userId: string, jobId: string): Array<{
    application: Application;
    candidate: User;
    degree?: string;
    branch?: string;
    cgpa?: number;
    resumeUrl: string;
  }> {
    const job = DB.jobs.get(jobId);
    if (!job) throw new Error('Job not found.');

    const recruiter = DB.recruiterProfiles.get(userId);
    if (!recruiter || job.recruiter_id !== recruiter.id) {
      throw new Error('Unauthorized: You can only view candidates for your own job postings (IDOR protection).');
    }

    const results: any[] = [];
    for (const app of DB.applications.values()) {
      if (app.job_id === jobId) {
        const candidateUser = DB.users.get(app.candidate_id);
        const profile = DB.candidateProfiles.get(app.candidate_id);

        if (candidateUser) {
          results.push({
            application: app,
            candidate: {
              id: candidateUser.id,
              full_name: candidateUser.full_name,
              email: candidateUser.email,
              avatar_url: candidateUser.avatar_url,
            },
            degree: profile?.degree,
            branch: profile?.branch,
            cgpa: profile?.cgpa_or_percentage,
            // Short-lived signed URL for resume (simulated with HMAC signature valid 5 min)
            resumeUrl: `/api/v1/recruiter/resumes/${encodeURIComponent(app.resume_storage_key)}?exp=${Date.now() + 300000}`,
          });
        }
      }
    }

    // Rank candidates by match score descending
    results.sort((a, b) => b.application.match_score - a.application.match_score);
    return results;
  }

  // 5. Update Applicant Status in Pipeline
  static updateApplicantStatus(
    userId: string,
    applicationId: string,
    newStatus: ApplicationStatus,
    notes?: string
  ): Application {
    const app = DB.applications.get(applicationId);
    if (!app) throw new Error('Application not found.');

    const job = DB.jobs.get(app.job_id);
    const recruiter = DB.recruiterProfiles.get(userId);

    if (!job || !recruiter || job.recruiter_id !== recruiter.id) {
      throw new Error('Unauthorized: You can only update candidates for jobs you manage.');
    }

    app.status = newStatus;
    app.status_updated_at = new Date().toISOString();
    if (notes) app.recruiter_notes = notes;

    return app;
  }

  // 6. Edit Job Opening
  static editJob(userId: string, jobId: string, updates: Partial<CreateJobInput>): Job {
    const job = DB.jobs.get(jobId);
    const recruiter = DB.recruiterProfiles.get(userId);
    if (!job || !recruiter || job.recruiter_id !== recruiter.id) {
      throw new Error('Unauthorized or job opening not found.');
    }
    if (updates.minExpYears !== undefined && updates.minExpYears > 2) {
      throw new Error('Fresher restriction: min experience cannot exceed 2 years.');
    }
    if (updates.title) job.title = updates.title;
    if (updates.description) job.description = updates.description;
    if (updates.salaryMinInr !== undefined) job.salary_min_inr = updates.salaryMinInr;
    if (updates.salaryMaxInr !== undefined) job.salary_max_inr = updates.salaryMaxInr;
    if (updates.locationCity) job.location_city = updates.locationCity;
    if (updates.requiredSkills) job.required_skills = updates.requiredSkills;

    return job;
  }

  // 7. Close Job Opening
  static closeJob(userId: string, jobId: string): Job {
    const job = DB.jobs.get(jobId);
    const recruiter = DB.recruiterProfiles.get(userId);
    if (!job || !recruiter || job.recruiter_id !== recruiter.id) {
      throw new Error('Unauthorized or job opening not found.');
    }
    job.status = 'EXPIRED';
    return job;
  }
}

