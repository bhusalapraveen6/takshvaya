export type TrustBadge = 'VERIFIED_COMPANY' | 'VERIFIED_RECRUITER' | 'SOURCE_VERIFIED';
export type JobStatus = 'ACTIVE' | 'FLAGGED' | 'EXPIRED' | 'REJECTED';
export type WorkplaceType = 'ON_SITE' | 'REMOTE' | 'HYBRID';
export type ApplicationStatus = 'APPLIED' | 'VIEWED' | 'SHORTLISTED' | 'INTERVIEW' | 'REJECTED' | 'OFFER';

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
  openJobsCount?: number;
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  company_id: string;
  company?: Company;
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
  workplace_type: WorkplaceType;
  job_type: 'FULL_TIME' | 'INTERNSHIP';
  vacancies: number;
  trust_badge: TrustBadge;
  source_origin: string;
  original_apply_url?: string;
  status: JobStatus;
  application_count: number;
  views_count: number;
  postedTimeAgo?: string;
  lastVerifiedAgo?: string;
  isSaved?: boolean;
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
  preferred_locations: string[];
  preferred_roles: string[];
  min_expected_salary: number;
  resume_storage_key?: string;
  resume_original_name?: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  is_auto_applied: boolean;
  recruiter_notes?: string;
  status: ApplicationStatus;
  status_updated_at: string;
  created_at: string;
  job?: Job;
  company?: Company;
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
}

export interface SkillRoadmapItem {
  skillName: string;
  category: string;
  estimatedHours: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  overview: string;
  learningSteps: string[];
  freeResources: Array<{
    title: string;
    provider: string;
    url: string;
    isFree: boolean;
    type: string;
  }>;
  practiceProject: {
    title: string;
    description: string;
  };
}

export interface SkillMatchAnalysis {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  optionalMatchedSkills: string[];
  eligibility: {
    isEligible: boolean;
    reasons: string[];
  };
  missingSkillRoadmaps: SkillRoadmapItem[];
  totalEstimatedLearningHours: number;
  readinessVerdict: 'HIGHLY_RECOMMENDED' | 'COMPETITIVE_WITH_GAP' | 'SIGNIFICANT_UPSKILL_REQUIRED';
}
