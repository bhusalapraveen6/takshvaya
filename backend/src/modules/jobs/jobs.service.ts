import { DB, Job, Company } from '../../database/db';

export interface SearchJobFilters {
  q?: string;
  role?: string;
  location?: string;
  workplace?: string; // 'ON_SITE' | 'REMOTE' | 'HYBRID'
  jobType?: string; // 'FULL_TIME' | 'INTERNSHIP'
  expMin?: number;
  expMax?: number;
  degree?: string;
  branch?: string;
  passingYear?: number;
  minCgpa?: number;
  salaryMin?: number;
  companyType?: string;
  verifiedOnly?: boolean;
  sort?: 'relevance' | 'newest' | 'highest_salary' | 'best_rated_company';
  page?: number;
  limit?: number;
}

export interface EnrichedJob extends Job {
  company: Company;
  postedTimeAgo: string;
  lastVerifiedAgo: string;
  isSaved?: boolean;
}

export class JobsService {
  // Calculate human-friendly time elapsed
  private static formatTimeAgo(isoString: string): string {
    const elapsedSeconds = Math.max(1, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
    if (elapsedSeconds < 60) return `${elapsedSeconds} seconds ago`;
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  // Typo tolerance: Levenshtein distance helper
  private static levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // Autocomplete Suggestions
  static getAutocompleteSuggestions(query: string): string[] {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    const suggestions = new Set<string>();

    for (const job of DB.jobs.values()) {
      if (job.status !== 'ACTIVE') continue;
      if (job.title.toLowerCase().includes(q)) suggestions.add(job.title);
      if (job.role_category.toLowerCase().includes(q)) suggestions.add(job.role_category);
      for (const skill of job.required_skills) {
        if (skill.toLowerCase().includes(q)) suggestions.add(skill);
      }
    }

    for (const comp of DB.companies.values()) {
      if (comp.name.toLowerCase().includes(q)) suggestions.add(comp.name);
    }

    return Array.from(suggestions).slice(0, 8);
  }

  // Search & Filter
  static searchJobs(filters: SearchJobFilters, userId?: string): {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    jobs: EnrichedJob[];
    availableRoles: { role: string; count: number }[];
    availableCities: { city: string; count: number }[];
  } {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 10));

    let matchedJobs: Job[] = Array.from(DB.jobs.values()).filter((j) => j.status === 'ACTIVE');

    // Role counts & city counts before filtering
    const roleMap = new Map<string, number>();
    const cityMap = new Map<string, number>();
    for (const j of matchedJobs) {
      roleMap.set(j.role_category, (roleMap.get(j.role_category) || 0) + 1);
      cityMap.set(j.location_city, (cityMap.get(j.location_city) || 0) + 1);
    }

    // Keyword Search with typo tolerance
    if (filters.q && filters.q.trim()) {
      const q = filters.q.toLowerCase().trim();
      const terms = q.split(/\s+/);

      matchedJobs = matchedJobs.filter((job) => {
        const company = DB.companies.get(job.company_id);
        const corpus = `${job.title} ${job.role_category} ${company?.name || ''} ${job.required_skills.join(' ')} ${job.location_city} ${job.description}`.toLowerCase();

        // Direct containment check
        const directMatch = terms.every((term) => corpus.includes(term));
        if (directMatch) return true;

        // Fuzzy match for short keywords
        return terms.some((term) => {
          if (term.length < 4) return corpus.includes(term);
          // Check words in title and skills
          const words = job.title.toLowerCase().split(/\s+/).concat(job.required_skills.map((s) => s.toLowerCase()));
          return words.some((word) => this.levenshtein(word, term) <= 1);
        });
      });
    }

    // Role filter
    if (filters.role) {
      const r = filters.role.toLowerCase();
      matchedJobs = matchedJobs.filter((j) => j.role_category.toLowerCase() === r);
    }

    // Location / City
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      matchedJobs = matchedJobs.filter((j) => j.location_city.toLowerCase().includes(loc) || (loc === 'remote' && j.workplace_type === 'REMOTE'));
    }

    // Workplace Mode
    if (filters.workplace) {
      matchedJobs = matchedJobs.filter((j) => j.workplace_type === filters.workplace);
    }

    // Job Type
    if (filters.jobType) {
      matchedJobs = matchedJobs.filter((j) => j.job_type === filters.jobType);
    }

    // Experience filters (Focus: 0 to 2 years)
    if (filters.expMin !== undefined) {
      matchedJobs = matchedJobs.filter((j) => j.max_exp_years >= filters.expMin!);
    }
    if (filters.expMax !== undefined) {
      matchedJobs = matchedJobs.filter((j) => j.min_exp_years <= filters.expMax!);
    }

    // Degree Eligibility Filter
    if (filters.degree) {
      const d = filters.degree.toLowerCase();
      matchedJobs = matchedJobs.filter(
        (j) =>
          j.eligible_degrees.some((ed) => ed.toLowerCase().includes(d) || ed.toLowerCase().includes('any graduate'))
      );
    }

    // Branch Eligibility Filter
    if (filters.branch) {
      const b = filters.branch.toLowerCase();
      matchedJobs = matchedJobs.filter(
        (j) =>
          j.eligible_branches.some(
            (eb) => eb.toLowerCase() === 'all' || eb.toLowerCase() === 'all engineering' || eb.toLowerCase().includes(b)
          )
      );
    }

    // Passing Year Filter
    if (filters.passingYear) {
      const py = Number(filters.passingYear);
      matchedJobs = matchedJobs.filter((j) => py >= j.min_graduation_year && py <= j.max_graduation_year);
    }

    // Min CGPA / Percentage
    if (filters.minCgpa !== undefined) {
      const cg = Number(filters.minCgpa);
      matchedJobs = matchedJobs.filter((j) => cg >= j.min_cgpa_or_percentage);
    }

    // Minimum Salary Filter
    if (filters.salaryMin) {
      const minSal = Number(filters.salaryMin);
      matchedJobs = matchedJobs.filter((j) => j.salary_max_inr >= minSal);
    }

    // Verified Companies Only
    if (filters.verifiedOnly) {
      matchedJobs = matchedJobs.filter((j) => {
        const comp = DB.companies.get(j.company_id);
        return comp && comp.is_verified && comp.trust_score >= 80;
      });
    }

    // Sorting
    const sort = filters.sort || 'newest';
    if (sort === 'newest') {
      matchedJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'highest_salary') {
      matchedJobs.sort((a, b) => b.salary_max_inr - a.salary_max_inr);
    } else if (sort === 'best_rated_company') {
      matchedJobs.sort((a, b) => {
        const compA = DB.companies.get(a.company_id)?.rating_overall || 0;
        const compB = DB.companies.get(b.company_id)?.rating_overall || 0;
        return compB - compA;
      });
    } else if (sort === 'relevance' && filters.q) {
      // Prioritize title matches
      matchedJobs.sort((a, b) => {
        const q = filters.q!.toLowerCase();
        const aTitleMatch = a.title.toLowerCase().includes(q) ? 1 : 0;
        const bTitleMatch = b.title.toLowerCase().includes(q) ? 1 : 0;
        return bTitleMatch - aTitleMatch;
      });
    }

    const total = matchedJobs.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paged = matchedJobs.slice((page - 1) * limit, page * limit);

    const enriched: EnrichedJob[] = paged.map((job) => {
      const company = DB.companies.get(job.company_id)!;
      const isSaved = userId ? DB.savedJobs.has(`${userId}:${job.id}`) : false;
      return {
        ...job,
        company,
        postedTimeAgo: this.formatTimeAgo(job.created_at),
        lastVerifiedAgo: this.formatTimeAgo(job.last_verified_at),
        isSaved,
      };
    });

    return {
      total,
      page,
      limit,
      totalPages,
      jobs: enriched,
      availableRoles: Array.from(roleMap.entries()).map(([role, count]) => ({ role, count })),
      availableCities: Array.from(cityMap.entries()).map(([city, count]) => ({ city, count })),
    };
  }

  // Get Single Job By Slug
  static getJobBySlug(slug: string, userId?: string): EnrichedJob | null {
    const job = Array.from(DB.jobs.values()).find((j) => j.slug === slug || j.id === slug);
    if (!job) return null;

    job.views_count += 1;
    const company = DB.companies.get(job.company_id)!;
    const isSaved = userId ? DB.savedJobs.has(`${userId}:${job.id}`) : false;

    return {
      ...job,
      company,
      postedTimeAgo: this.formatTimeAgo(job.created_at),
      lastVerifiedAgo: this.formatTimeAgo(job.last_verified_at),
      isSaved,
    };
  }

  // Toggle Save Job
  static toggleSaveJob(userId: string, jobId: string): { isSaved: boolean } {
    const key = `${userId}:${jobId}`;
    if (DB.savedJobs.has(key)) {
      DB.savedJobs.delete(key);
      return { isSaved: false };
    } else {
      DB.savedJobs.add(key);
      return { isSaved: true };
    }
  }

  // Get Saved Jobs for User
  static getSavedJobs(userId: string): EnrichedJob[] {
    const saved: EnrichedJob[] = [];
    for (const key of DB.savedJobs) {
      if (key.startsWith(`${userId}:`)) {
        const jobId = key.split(':')[1];
        const job = DB.jobs.get(jobId);
        if (job) {
          const company = DB.companies.get(job.company_id)!;
          saved.push({
            ...job,
            company,
            postedTimeAgo: this.formatTimeAgo(job.created_at),
            lastVerifiedAgo: this.formatTimeAgo(job.last_verified_at),
            isSaved: true,
          });
        }
      }
    }
    return saved;
  }
}
