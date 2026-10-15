import { Job, Company, CandidateProfile, Application, AutoApplySettings, SkillMatchAnalysis, SkillRoadmapItem } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function fetchJobs(params?: Record<string, any>): Promise<{
  jobs: Job[];
  total: number;
  availableRoles: { role: string; count: number }[];
  availableCities: { city: string; count: number }[];
}> {
  try {
    const url = new URL(`${API_BASE}/jobs`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') url.searchParams.append(k, String(v));
      });
    }

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Backend API connection fallback:', err);
  }

  // Graceful fallback for local development or disconnected mode
  return {
    jobs: [],
    total: 0,
    availableRoles: [],
    availableCities: [],
  };
}

export async function fetchJobBySlug(slug: string): Promise<Job | null> {
  try {
    const res = await fetch(`${API_BASE}/jobs/${slug}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return data.job;
    }
  } catch (err) {
    console.warn('API error:', err);
  }
  return null;
}

export async function fetchCompanies(): Promise<Company[]> {
  try {
    const res = await fetch(`${API_BASE}/companies`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return data.companies;
    }
  } catch (err) {
    console.warn('API error:', err);
  }
  return [];
}

export async function fetchCompanyBySlug(slug: string): Promise<{ company: Company; openJobs: Job[] } | null> {
  try {
    const res = await fetch(`${API_BASE}/companies/${slug}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return data.company;
    }
  } catch (err) {
    console.warn('API error:', err);
  }
  return null;
}

export async function fetchSkillMatch(jobId: string): Promise<SkillMatchAnalysis | null> {
  try {
    const res = await fetch(`${API_BASE}/skills/match/${jobId}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return data.analysis;
    }
  } catch (err) {
    console.warn('API error:', err);
  }
  return null;
}
