'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  role: 'JOB_SEEKER' | 'RECRUITER';
  headline?: string;
  degree?: string;
  branch?: string;
  institution?: string;
  graduationYear?: number;
  cgpa?: number;
  skills: string[];
  resumeFileName?: string;
  resumeFileSize?: string;
  resumeUploadedAt?: string;
}

export interface UserApplication {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  appliedAt: string;
  matchScore: number;
  isAutoApplied?: boolean;
  status: 'APPLIED' | 'VIEWED' | 'SHORTLISTED' | 'INTERVIEW';
  slug: string;
  recruiterNotes?: string;
}

export interface AutoApplyConfig {
  isEnabled: boolean;
  minMatchScore: number;
  minSalary: number;
  dailyLimit: number;
  applicationsToday: number;
  preferredRoles: string;
  preferredLocations: string;
}

interface UserContextType {
  user: UserProfile | null;
  isLoaded: boolean;
  login: (profile: Partial<UserProfile>) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  applications: UserApplication[];
  applyToJob: (job: {
    id: string;
    title: string;
    company: string;
    companyLogo: string;
    matchScore: number;
    slug: string;
    isAutoApplied?: boolean;
  }) => boolean;
  withdrawApplication: (id: string) => void;
  isApplied: (slug: string) => boolean;
  autoApplyConfig: AutoApplyConfig;
  updateAutoApplyConfig: (config: Partial<AutoApplyConfig>) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const DEFAULT_AUTO_APPLY: AutoApplyConfig = {
  isEnabled: false,
  minMatchScore: 80,
  minSalary: 600000,
  dailyLimit: 5,
  applicationsToday: 0,
  preferredRoles: 'Software Engineer, Frontend Developer, Data Analyst',
  preferredLocations: 'Bengaluru, Hyderabad, Remote, Pune, Delhi NCR',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'takshvaya_user_profile';
const APPS_STORAGE_KEY = 'takshvaya_user_applications';
const AUTO_APPLY_STORAGE_KEY = 'takshvaya_auto_apply_config';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [autoApplyConfig, setAutoApplyConfig] = useState<AutoApplyConfig>(DEFAULT_AUTO_APPLY);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load state from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const storedApps = localStorage.getItem(APPS_STORAGE_KEY);
      if (storedApps) {
        setApplications(JSON.parse(storedApps));
      }

      const storedAutoApply = localStorage.getItem(AUTO_APPLY_STORAGE_KEY);
      if (storedAutoApply) {
        setAutoApplyConfig({ ...DEFAULT_AUTO_APPLY, ...JSON.parse(storedAutoApply) });
      }
    } catch (e) {
      console.warn('Failed to load session from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const login = (data: Partial<UserProfile>) => {
    const newUser: UserProfile = {
      name: data.name?.trim() || 'New Fresher Candidate',
      email: data.email?.trim() || 'fresher@example.com',
      avatar: data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || 'User')}`,
      role: data.role || 'JOB_SEEKER',
      headline: data.headline || 'Fresher Graduate | Eager to Learn & Build',
      degree: data.degree || 'B.Tech',
      branch: data.branch || 'Computer Science',
      institution: data.institution || '',
      graduationYear: data.graduationYear || 2024,
      cgpa: data.cgpa || 7.5,
      skills: data.skills && data.skills.length > 0 ? data.skills : ['JavaScript', 'HTML/CSS', 'Git', 'Problem Solving'],
      resumeFileName: data.resumeFileName,
      resumeFileSize: data.resumeFileSize,
      resumeUploadedAt: data.resumeUploadedAt,
    };
    setUser(newUser);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.error(e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) {
      // If user wasn't formally logged in, create the profile
      login(data);
      return;
    }
    const updated: UserProfile = { ...user, ...data };
    setUser(updated);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const applyToJob = (job: {
    id: string;
    title: string;
    company: string;
    companyLogo: string;
    matchScore: number;
    slug: string;
    isAutoApplied?: boolean;
  }): boolean => {
    if (applications.some((a) => a.slug === job.slug || a.id === job.id)) {
      return false; // Already applied
    }

    const newApp: UserApplication = {
      id: `app-${Date.now()}`,
      title: job.title,
      company: job.company,
      companyLogo: job.companyLogo,
      appliedAt: 'Just now',
      matchScore: job.matchScore,
      isAutoApplied: job.isAutoApplied || false,
      status: 'APPLIED',
      slug: job.slug,
      recruiterNotes: 'Application submitted directly to hiring team.',
    };

    const updated = [newApp, ...applications];
    setApplications(updated);
    try {
      localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return true;
  };

  const withdrawApplication = (id: string) => {
    const updated = applications.filter((a) => a.id !== id);
    setApplications(updated);
    try {
      localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const isApplied = (slug: string) => {
    return applications.some((a) => a.slug === slug);
  };

  const updateAutoApplyConfig = (config: Partial<AutoApplyConfig>) => {
    const updated = { ...autoApplyConfig, ...config };
    setAutoApplyConfig(updated);
    try {
      localStorage.setItem(AUTO_APPLY_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoaded,
        login,
        logout,
        updateProfile,
        applications,
        applyToJob,
        withdrawApplication,
        isApplied,
        autoApplyConfig,
        updateAutoApplyConfig,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
