import crypto from 'crypto';
import { DB, AutoApplySettings, Application, Job, Company } from '../../database/db';
import { SkillsService } from '../skills/skills.service';

export interface EnrichedApplication extends Application {
  job: Job;
  company: Company;
}

export class AutoApplyService {
  // Reset daily limit if new day
  private static resetDailyCountIfNeeded(settings: AutoApplySettings): void {
    const today = new Date().toISOString().split('T')[0];
    if (settings.last_reset_date !== today) {
      settings.applications_today = 0;
      settings.last_reset_date = today;
    }
  }

  // Get user auto apply settings
  static getSettings(userId: string): AutoApplySettings {
    let settings = DB.autoApplySettings.get(userId);
    if (!settings) {
      settings = {
        id: crypto.randomUUID(),
        user_id: userId,
        is_enabled: false,
        min_match_score: 80,
        preferred_roles: ['Software Engineer'],
        preferred_locations: ['Bengaluru', 'Remote'],
        min_salary_inr: 400000,
        daily_application_limit: 5,
        applications_today: 0,
        excluded_company_ids: [],
        last_reset_date: new Date().toISOString().split('T')[0],
      };
      DB.autoApplySettings.set(userId, settings);
    }

    this.resetDailyCountIfNeeded(settings);
    return settings;
  }

  // Update user auto apply settings
  static updateSettings(userId: string, updates: Partial<AutoApplySettings>): AutoApplySettings {
    const settings = this.getSettings(userId);
    
    if (updates.daily_application_limit !== undefined) {
      // Hard cap between 1 and 15 per day to prevent spam
      settings.daily_application_limit = Math.min(15, Math.max(1, updates.daily_application_limit));
    }
    if (updates.min_match_score !== undefined) {
      settings.min_match_score = Math.min(100, Math.max(50, updates.min_match_score));
    }
    if (updates.is_enabled !== undefined) settings.is_enabled = updates.is_enabled;
    if (updates.preferred_roles !== undefined) settings.preferred_roles = updates.preferred_roles;
    if (updates.preferred_locations !== undefined) settings.preferred_locations = updates.preferred_locations;
    if (updates.min_salary_inr !== undefined) settings.min_salary_inr = updates.min_salary_inr;
    if (updates.excluded_company_ids !== undefined) settings.excluded_company_ids = updates.excluded_company_ids;

    return settings;
  }

  // Execute Auto-Apply matching cycle for candidate
  static runAutoApply(userId: string): {
    appliedCount: number;
    remainingQuota: number;
    appliedJobs: Array<{ jobId: string; title: string; companyName: string; matchScore: number }>;
  } {
    const settings = this.getSettings(userId);

    if (!settings.is_enabled) {
      return { appliedCount: 0, remainingQuota: settings.daily_application_limit - settings.applications_today, appliedJobs: [] };
    }

    let remainingQuota = settings.daily_application_limit - settings.applications_today;
    if (remainingQuota <= 0) {
      return { appliedCount: 0, remainingQuota: 0, appliedJobs: [] };
    }

    // Get candidate profile
    const profile = DB.candidateProfiles.get(userId);
    if (!profile) {
      throw new Error('Candidate profile must be created before enabling auto-apply.');
    }

    // Get jobs candidate has already applied to
    const alreadyAppliedJobIds = new Set<string>();
    for (const app of DB.applications.values()) {
      if (app.candidate_id === userId) {
        alreadyAppliedJobIds.add(app.job_id);
      }
    }

    const appliedJobs: Array<{ jobId: string; title: string; companyName: string; matchScore: number }> = [];

    // Filter candidate jobs
    for (const job of DB.jobs.values()) {
      if (remainingQuota <= 0) break;

      // 1. Must be Active
      if (job.status !== 'ACTIVE') continue;

      // 2. Already applied
      if (alreadyAppliedJobIds.has(job.id)) continue;

      // 3. Excluded company check
      if (settings.excluded_company_ids.includes(job.company_id)) continue;

      // 4. Must be a Verified Opportunity (Trust Badge required)
      const company = DB.companies.get(job.company_id);
      if (!company || !company.is_verified) continue;

      // 5. Salary Floor Check
      if (job.salary_max_inr < settings.min_salary_inr) continue;

      // 6. Role match
      const roleMatches = settings.preferred_roles.some(
        (r) => job.role_category.toLowerCase().includes(r.toLowerCase()) || job.title.toLowerCase().includes(r.toLowerCase())
      );
      if (settings.preferred_roles.length > 0 && !roleMatches) continue;

      // 7. Location match
      const locMatches =
        job.workplace_type === 'REMOTE' ||
        settings.preferred_locations.some(
          (loc) => loc.toLowerCase() === 'remote' || job.location_city.toLowerCase().includes(loc.toLowerCase())
        );
      if (settings.preferred_locations.length > 0 && !locMatches) continue;

      // 8. Skill Match & Strict Fresher Eligibility Evaluation
      const analysis = SkillsService.analyzeCandidateForJob(userId, job.id);

      // Must satisfy academic eligibility (Degree, Branch, CGPA, Passing Year)
      if (!analysis.eligibility.isEligible) continue;

      // Must meet minimum match score threshold
      if (analysis.matchScore < settings.min_match_score) continue;

      // All criteria met -> SUBMIT APPLICATION!
      const newApp: Application = {
        id: `app-${crypto.randomUUID().slice(0, 8)}`,
        job_id: job.id,
        candidate_id: userId,
        resume_storage_key: profile.resume_storage_key || 'resumes/default-fresher.pdf',
        match_score: analysis.matchScore,
        matched_skills: analysis.matchedSkills,
        missing_skills: analysis.missingSkills,
        is_auto_applied: true,
        status: 'APPLIED',
        status_updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      DB.applications.set(newApp.id, newApp);
      alreadyAppliedJobIds.add(job.id);
      job.application_count += 1;

      settings.applications_today += 1;
      remainingQuota -= 1;

      appliedJobs.push({
        jobId: job.id,
        title: job.title,
        companyName: company.name,
        matchScore: analysis.matchScore,
      });
    }

    return {
      appliedCount: appliedJobs.length,
      remainingQuota,
      appliedJobs,
    };
  }

  // Withdraw an application
  static withdrawApplication(userId: string, applicationId: string): boolean {
    const app = DB.applications.get(applicationId);
    if (!app || app.candidate_id !== userId) {
      throw new Error('Application not found or unauthorized.');
    }

    // Only allow withdrawal if not yet in INTERVIEW or OFFER state
    if (app.status === 'INTERVIEW' || app.status === 'OFFER') {
      throw new Error('Cannot withdraw application that has advanced to active interview or offer stage.');
    }

    DB.applications.delete(applicationId);
    const job = DB.jobs.get(app.job_id);
    if (job && job.application_count > 0) {
      job.application_count -= 1;
    }

    return true;
  }

  // Manual Application Submission
  static submitManualApplication(userId: string, jobId: string): Application {
    const job = DB.jobs.get(jobId);
    if (!job || job.status !== 'ACTIVE') {
      throw new Error('Job opening is no longer accepting applications.');
    }

    const profile = DB.candidateProfiles.get(userId);
    if (!profile) {
      throw new Error('Please complete your candidate profile before applying.');
    }

    // Check duplicate
    for (const app of DB.applications.values()) {
      if (app.candidate_id === userId && app.job_id === jobId) {
        throw new Error('You have already submitted an application for this position.');
      }
    }

    const analysis = SkillsService.analyzeCandidateForJob(userId, jobId);

    const app: Application = {
      id: `app-${crypto.randomUUID().slice(0, 8)}`,
      job_id: jobId,
      candidate_id: userId,
      resume_storage_key: profile.resume_storage_key || 'resumes/default-fresher.pdf',
      match_score: analysis.matchScore,
      matched_skills: analysis.matchedSkills,
      missing_skills: analysis.missingSkills,
      is_auto_applied: false,
      status: 'APPLIED',
      status_updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    DB.applications.set(app.id, app);
    job.application_count += 1;
    return app;
  }

  // Get candidate application tracker history
  static getCandidateApplications(userId: string): EnrichedApplication[] {
    const apps: EnrichedApplication[] = [];
    for (const app of DB.applications.values()) {
      if (app.candidate_id === userId) {
        const job = DB.jobs.get(app.job_id);
        if (job) {
          const company = DB.companies.get(job.company_id)!;
          apps.push({
            ...app,
            job,
            company,
          });
        }
      }
    }

    // Sort newest applications first
    apps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return apps;
  }
}
