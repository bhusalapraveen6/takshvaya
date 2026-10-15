import { DB, CandidateProfile, Job } from '../../database/db';
import { getRoadmapForSkill, SkillRoadmapItem } from './roadmaps.data';

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  criteriaBreakdown: {
    degree: { required: string[]; candidate: string; passed: boolean };
    branch: { required: string[]; candidate: string; passed: boolean };
    graduationYear: { min: number; max: number; candidate: number; passed: boolean };
    cgpa: { min: number; candidate: number; passed: boolean };
  };
}

export interface SkillMatchAnalysis {
  matchScore: number; // 0 to 100%
  matchedSkills: string[];
  missingSkills: string[];
  optionalMatchedSkills: string[];
  eligibility: EligibilityResult;
  missingSkillRoadmaps: SkillRoadmapItem[];
  totalEstimatedLearningHours: number;
  readinessVerdict: 'HIGHLY_RECOMMENDED' | 'COMPETITIVE_WITH_GAP' | 'SIGNIFICANT_UPSKILL_REQUIRED';
}

export class SkillsService {
  // Check strict fresher eligibility
  static evaluateEligibility(candidate: CandidateProfile, job: Job): EligibilityResult {
    const reasons: string[] = [];

    // 1. Degree Check
    const degPassed = job.eligible_degrees.some(
      (d) =>
        d.toLowerCase() === 'any graduate' ||
        candidate.degree.toLowerCase().includes(d.toLowerCase()) ||
        d.toLowerCase().includes(candidate.degree.toLowerCase())
    );
    if (!degPassed) {
      reasons.push(
        `Your degree (${candidate.degree}) does not match the job's eligible degrees: [${job.eligible_degrees.join(', ')}].`
      );
    }

    // 2. Branch Check
    const branchPassed = job.eligible_branches.some(
      (b) =>
        b.toLowerCase() === 'all' ||
        b.toLowerCase() === 'all engineering' ||
        b.toLowerCase() === 'all branches' ||
        candidate.branch.toLowerCase().includes(b.toLowerCase()) ||
        b.toLowerCase().includes(candidate.branch.toLowerCase())
    );
    if (!branchPassed) {
      reasons.push(
        `Your branch (${candidate.branch}) is not listed in eligible branches: [${job.eligible_branches.join(', ')}].`
      );
    }

    // 3. Passing Year Check
    const yearPassed =
      candidate.graduation_year >= job.min_graduation_year &&
      candidate.graduation_year <= job.max_graduation_year;
    if (!yearPassed) {
      reasons.push(
        `Graduation year ${candidate.graduation_year} is outside the allowed batch window (${job.min_graduation_year} - ${job.max_graduation_year}).`
      );
    }

    // 4. CGPA / Percentage Check
    const cgpaPassed = candidate.cgpa_or_percentage >= job.min_cgpa_or_percentage;
    if (!cgpaPassed) {
      reasons.push(
        `Your academic score (${candidate.cgpa_or_percentage}) is below the minimum cut-off (${job.min_cgpa_or_percentage}).`
      );
    }

    const isEligible = degPassed && branchPassed && yearPassed && cgpaPassed;

    return {
      isEligible,
      reasons: isEligible ? ['You satisfy all academic and batch eligibility requirements!'] : reasons,
      criteriaBreakdown: {
        degree: { required: job.eligible_degrees, candidate: candidate.degree, passed: degPassed },
        branch: { required: job.eligible_branches, candidate: candidate.branch, passed: branchPassed },
        graduationYear: {
          min: job.min_graduation_year,
          max: job.max_graduation_year,
          candidate: candidate.graduation_year,
          passed: yearPassed,
        },
        cgpa: { min: job.min_cgpa_or_percentage, candidate: candidate.cgpa_or_percentage, passed: cgpaPassed },
      },
    };
  }

  // Calculate Match Score, Gap Analysis & Free Learning Roadmap
  static analyzeCandidateForJob(candidateUserId: string, jobId: string): SkillMatchAnalysis {
    const candidate = DB.candidateProfiles.get(candidateUserId);
    const job = DB.jobs.get(jobId);

    if (!candidate || !job) {
      throw new Error('Candidate profile or Job opening not found.');
    }

    const candidateSkillSet = new Set(candidate.skills.map((s) => s.toLowerCase().trim()));
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    // Evaluate Required Skills
    for (const reqSkill of job.required_skills) {
      if (candidateSkillSet.has(reqSkill.toLowerCase().trim())) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    }

    // Evaluate Optional Skills
    const optionalMatchedSkills: string[] = [];
    for (const optSkill of job.optional_skills) {
      if (candidateSkillSet.has(optSkill.toLowerCase().trim())) {
        optionalMatchedSkills.push(optSkill);
      }
    }

    // Compute Weighted Match Score (%)
    // Required skills carry 75% weight; optional skills carry 25% weight
    const reqRatio = job.required_skills.length > 0 ? matchedSkills.length / job.required_skills.length : 1;
    const optRatio = job.optional_skills.length > 0 ? optionalMatchedSkills.length / job.optional_skills.length : 1;

    let computedScore = Math.round(reqRatio * 75 + optRatio * 25);
    // Academic eligibility penalty: if ineligible, cap score at 50%
    const eligibility = this.evaluateEligibility(candidate, job);
    if (!eligibility.isEligible && computedScore > 50) {
      computedScore = 50;
    }

    // Build Learning Roadmaps for all missing skills
    const missingSkillRoadmaps: SkillRoadmapItem[] = missingSkills.map((skill) => getRoadmapForSkill(skill));
    const totalEstimatedLearningHours = missingSkillRoadmaps.reduce((acc, curr) => acc + curr.estimatedHours, 0);

    let readinessVerdict: 'HIGHLY_RECOMMENDED' | 'COMPETITIVE_WITH_GAP' | 'SIGNIFICANT_UPSKILL_REQUIRED';
    if (computedScore >= 80 && eligibility.isEligible) {
      readinessVerdict = 'HIGHLY_RECOMMENDED';
    } else if (computedScore >= 55) {
      readinessVerdict = 'COMPETITIVE_WITH_GAP';
    } else {
      readinessVerdict = 'SIGNIFICANT_UPSKILL_REQUIRED';
    }

    return {
      matchScore: computedScore,
      matchedSkills,
      missingSkills,
      optionalMatchedSkills,
      eligibility,
      missingSkillRoadmaps,
      totalEstimatedLearningHours,
      readinessVerdict,
    };
  }

  // Update candidate profile
  static updateCandidateProfile(userId: string, updates: Partial<CandidateProfile>): CandidateProfile {
    let profile = DB.candidateProfiles.get(userId);
    if (!profile) {
      profile = {
        id: `prof-${userId}`,
        user_id: userId,
        degree: 'B.Tech',
        branch: 'Computer Science',
        institution_name: '',
        graduation_year: 2024,
        cgpa_or_percentage: 7.5,
        experience_months: 0,
        skills: [],
        certifications: [],
        projects: [],
        preferred_locations: ['Remote'],
        preferred_roles: ['Software Engineer'],
        min_expected_salary: 400000,
      };
      DB.candidateProfiles.set(userId, profile);
    }

    Object.assign(profile, updates);
    return profile;
  }
}
