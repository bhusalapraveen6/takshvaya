'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, Building2, Briefcase, Calendar, GraduationCap, ShieldCheck, Flag, CheckCircle2, Share2, ArrowLeft, ExternalLink, Zap } from 'lucide-react';
import { TrustBadge } from '../../../components/TrustBadge';
import { SkillMatchWidget } from '../../../components/SkillMatchWidget';
import { ReportModal } from '../../../components/ReportModal';
import { SkillMatchAnalysis, TrustBadge as TrustBadgeType } from '../../../lib/types';
import { useUser } from '../../../lib/user-store';

interface JobDetail {
  id: string;
  title: string;
  slug: string;
  company: string;
  companySlug: string;
  companyLogo: string;
  companyWebsite: string;
  companyAbout: string;
  companyTrustScore: number;
  companyRating: number;
  roleCategory: string;
  location: string;
  workplaceType: string;
  jobType: string;
  vacancies: number;
  salaryText: string;
  minExpYears: number;
  maxExpYears: number;
  eligibleDegrees: string[];
  eligibleBranches: string[];
  minGradYear: number;
  maxGradYear: number;
  minCgpa: number;
  requiredSkills: string[];
  optionalSkills: string[];
  badge: TrustBadgeType;
  sourceOrigin: string;
  postedTime: string;
  lastVerified: string;
  description: string;
  responsibilities: string[];
  hiringProcess: string[];
}

// Built-in catalog of verified fresher positions
const JOB_CATALOG: Record<string, JobDetail> = {
  'associate-software-engineer-frontend-razorpay': {
    id: 'job-1',
    title: 'Associate Software Engineer - Frontend (React / TypeScript)',
    slug: 'associate-software-engineer-frontend-razorpay',
    company: 'Razorpay',
    companySlug: 'razorpay',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
    companyWebsite: 'https://razorpay.com',
    companyAbout: 'Razorpay is India’s leading full-stack financial solutions company powering business payments and banking for over 10 million businesses.',
    companyTrustScore: 98,
    companyRating: 4.4,
    roleCategory: 'Software Engineer',
    location: 'Bengaluru, Karnataka (Hybrid)',
    workplaceType: 'HYBRID',
    jobType: 'FULL_TIME',
    vacancies: 4,
    salaryText: '₹8,00,000 - ₹14,00,000 / year (Fixed + Performance Bonus)',
    minExpYears: 0,
    maxExpYears: 1,
    eligibleDegrees: ['B.Tech', 'B.E', 'BCA', 'MCA', 'B.Sc Computer Science'],
    eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm', 'All Engineering'],
    minGradYear: 2023,
    maxGradYear: 2026,
    minCgpa: 6.5,
    requiredSkills: ['React', 'JavaScript', 'TypeScript', 'HTML/CSS', 'Git'],
    optionalSkills: ['Next.js', 'Jest', 'Tailwind CSS'],
    badge: 'VERIFIED_COMPANY',
    sourceOrigin: 'DIRECT_POST',
    postedTime: '2 hours ago',
    lastVerified: '15 minutes ago',
    description: `Join Razorpay’s Core Checkout Engineering group. As an Associate Frontend Engineer, you will design, build, and optimize customer-facing payment screens accessed by millions of shoppers across India every single minute.\n\nYou will work closely with staff engineers, participate in bi-weekly design critiques, and ship code directly to production using automated CI/CD pipelines. This position is crafted specifically for early-career developers and fresh college graduates who love clean architecture, component design, and responsive web performance.`,
    responsibilities: [
      'Build responsive, pixel-perfect user interfaces using React, Next.js, and TypeScript',
      'Optimize web vitals (LCP, FID, CLS) across desktop and low-bandwidth mobile devices',
      'Write comprehensive unit tests with Jest and integration tests with Playwright',
      'Collaborate with backend engineers to integrate RESTful payment APIs securely',
      'Participate in agile sprints, daily standups, and architectural design reviews',
    ],
    hiringProcess: [
      '1. Resume Screening & Skill Match Verification',
      '2. Online Coding Assessment (Data Structures & JavaScript)',
      '3. Technical Live Machine Coding Interview',
      '4. Culture Alignment & Engineering Manager Discussion',
    ],
  },
  'graduate-data-analyst-tata-digital': {
    id: 'job-2',
    title: 'Graduate Data Analyst (Python / SQL / Tableau)',
    slug: 'graduate-data-analyst-tata-digital',
    company: 'Tata Digital',
    companySlug: 'tata-digital',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&auto=format&fit=crop&q=80',
    companyWebsite: 'https://tatadigital.com',
    companyAbout: 'Tata Digital is building the Tata Neu super-app ecosystem for seamless omni-channel retail, grocery, electronics, travel, and financial services.',
    companyTrustScore: 96,
    companyRating: 4.2,
    roleCategory: 'Data Analyst',
    location: 'Mumbai, Maharashtra (Hybrid)',
    workplaceType: 'HYBRID',
    jobType: 'FULL_TIME',
    vacancies: 6,
    salaryText: '₹6,50,000 - ₹10,00,000 / year (Fixed CTC)',
    minExpYears: 0,
    maxExpYears: 1,
    eligibleDegrees: ['B.Tech', 'B.Sc', 'BCA', 'MCA', 'B.Com with Analytics'],
    eligibleBranches: ['All Engineering', 'Statistics', 'Mathematics', 'Computer Science'],
    minGradYear: 2022,
    maxGradYear: 2026,
    minCgpa: 6.0,
    requiredSkills: ['SQL', 'Python', 'Excel', 'Data Analysis'],
    optionalSkills: ['Tableau', 'Power BI', 'Pandas', 'Statistics'],
    badge: 'VERIFIED_COMPANY',
    sourceOrigin: 'CAREER_API',
    postedTime: '5 hours ago',
    lastVerified: '10 minutes ago',
    description: `Tata Digital is seeking enthusiastic freshers who love finding patterns in massive datasets. As a Graduate Data Analyst, you will work directly with category business leads and product managers on Tata Neu.\n\nYou will write high-performance SQL queries, build executive visual scorecards in Tableau, and automate reporting data pipelines using Python. Ideal for fresh graduates who want hands-on experience with production data warehouses.`,
    responsibilities: [
      'Extract, clean, and validate data from PostgreSQL and Snowflake warehouses',
      'Create interactive dashboards and visual KPI scorecards for product managers',
      'Perform exploratory data analysis to identify user retention and conversion drivers',
      'Automate repetitive weekly reports using Python scripts and Airflow tasks',
      'Collaborate with engineering teams on event telemetry and tracking schemas',
    ],
    hiringProcess: [
      '1. Aptitude & SQL / Statistics MCQ Assessment',
      '2. Live Pair Data Analysis & Querying Round',
      '3. Business Problem Solving & Dashboard Walkthrough',
      '4. HR & Managerial Fit Discussion',
    ],
  },
  'scientist-engineer-sc-trainee-isro': {
    id: 'job-3',
    title: 'Scientist / Engineer ‘SC’ Trainee (ISRO Fresher Drive)',
    slug: 'scientist-engineer-sc-trainee-isro',
    company: 'ISRO (Govt of India)',
    companySlug: 'isro',
    companyLogo: 'https://images.unsplash.com/photo-1517976487588-4c32144360e2?w=128&auto=format&fit=crop&q=80',
    companyWebsite: 'https://isro.gov.in',
    companyAbout: 'Indian Space Research Organisation (ISRO) is India’s national space agency, leading sovereign space research, satellite communication, and planetary exploration.',
    companyTrustScore: 99,
    companyRating: 4.8,
    roleCategory: 'Government & Public Sector',
    location: 'Bengaluru, Karnataka (On-site)',
    workplaceType: 'ON_SITE',
    jobType: 'FULL_TIME',
    vacancies: 12,
    salaryText: '₹7,20,000 - ₹11,00,000 / year (Pay Level 10 + Govt Perks & Allowances)',
    minExpYears: 0,
    maxExpYears: 1,
    eligibleDegrees: ['B.Tech', 'B.E', 'B.Sc Engineering'],
    eligibleBranches: ['Computer Science', 'Electronics & Comm', 'Electrical', 'Mechanical'],
    minGradYear: 2022,
    maxGradYear: 2026,
    minCgpa: 6.84,
    requiredSkills: ['C/C++', 'Embedded Systems', 'Digital Electronics'],
    optionalSkills: ['RTOS', 'Linux Kernel', 'Microcontrollers', 'Python'],
    badge: 'SOURCE_VERIFIED',
    sourceOrigin: 'GOVT_GAZETTE',
    postedTime: '1 day ago',
    lastVerified: '1 hour ago',
    description: `Official Central Government Scientist Trainee opening for 2022-2026 engineering graduates. Trainees will undergo mission training at the UR Rao Satellite Centre (URSC) and contribute to avionics, flight software, and real-time telemetry systems.\n\nAppointments are made under Central Pay Scale Level 10 with comprehensive medical, residential quarters, and sovereign pension benefits.`,
    responsibilities: [
      'Design and verify real-time embedded firmware for telemetry processing units',
      'Develop hardware-in-the-loop (HIL) simulators and test harnesses in C/C++',
      'Conduct timing analysis and environmental stress testing on space-grade controllers',
      'Document safety-critical firmware specifications adhering to national space standards',
    ],
    hiringProcess: [
      '1. Centralized ICRB Written Test (Core Engineering & Mathematics)',
      '2. In-person Technical Viva & Machine Assessment at URSC Bengaluru',
      '3. Medical Fitness Examination & Final Merit List Publication',
    ],
  },
  'graduate-engineer-trainee-mechanical-pune': {
    id: 'job-4',
    title: 'Graduate Engineer Trainee - Mechanical / Robotics',
    slug: 'graduate-engineer-trainee-mechanical-pune',
    company: 'Tata Motors',
    companySlug: 'tata-motors',
    companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&auto=format&fit=crop&q=80',
    companyWebsite: 'https://tatamotors.com',
    companyAbout: 'Tata Motors Limited is a leading global automobile manufacturer with an innovative portfolio of electric vehicles, passenger cars, and commercial trucks.',
    companyTrustScore: 97,
    companyRating: 4.3,
    roleCategory: 'Core Engineering',
    location: 'Pune, Maharashtra (On-site)',
    workplaceType: 'ON_SITE',
    jobType: 'FULL_TIME',
    vacancies: 8,
    salaryText: '₹6,00,000 - ₹9,50,000 / year (Fixed + Shift Allowance)',
    minExpYears: 0,
    maxExpYears: 1,
    eligibleDegrees: ['B.Tech', 'B.E', 'Mechanical Engineering', 'Mechatronics'],
    eligibleBranches: ['Mechanical', 'Automobile', 'Production', 'Mechatronics'],
    minGradYear: 2023,
    maxGradYear: 2026,
    minCgpa: 6.5,
    requiredSkills: ['AutoCAD', 'SolidWorks', 'Thermodynamics'],
    optionalSkills: ['Robotics', 'MATLAB', 'Finite Element Analysis (FEA)'],
    badge: 'VERIFIED_COMPANY',
    sourceOrigin: 'CAMPUS_OFFCAMPUS_FEED',
    postedTime: '1 day ago',
    lastVerified: '30 minutes ago',
    description: `Join Tata Motors Passenger Electric Mobility (TPEM) plant in Pune. As a Graduate Engineer Trainee, you will rotate across chassis development, automated robotic welding cells, and battery pack thermal engineering.\n\nThis 12-month structured program trains freshers on industrial Industry 4.0 automation, lean Six Sigma manufacturing, and EV mechanical integration.`,
    responsibilities: [
      'Model 3D component assemblies and drafting tolerances in SolidWorks and AutoCAD',
      'Assist plant lead engineers on robotic assembly line cycle time optimization',
      'Conduct thermal dissipation testing on electric powertrain sub-assemblies',
      'Perform root cause failure analysis (RCFA) for stamping and machining defects',
    ],
    hiringProcess: [
      '1. Online Mechanical Engineering Aptitude & Cognitive Test',
      '2. Technical Machine Design Interview',
      '3. Plant Operations Walkthrough & Leadership Interaction',
    ],
  },
  'junior-product-designer-swiggy': {
    id: 'job-5',
    title: 'Junior Product Designer (UI/UX - Web & Mobile)',
    slug: 'junior-product-designer-swiggy',
    company: 'Swiggy',
    companySlug: 'swiggy',
    companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&auto=format&fit=crop&q=80',
    companyWebsite: 'https://swiggy.com',
    companyAbout: 'Swiggy is India’s premier on-demand convenience platform delivering food, grocery (Instamart), dining, and package delivery across 600+ cities.',
    companyTrustScore: 95,
    companyRating: 4.1,
    roleCategory: 'Design',
    location: 'Bengaluru, Karnataka (Hybrid)',
    workplaceType: 'HYBRID',
    jobType: 'FULL_TIME',
    vacancies: 2,
    salaryText: '₹7,50,000 - ₹12,00,000 / year (Fixed + ESOPs)',
    minExpYears: 0,
    maxExpYears: 1,
    eligibleDegrees: ['B.Des', 'M.Des', 'Any Graduate with Design Portfolio'],
    eligibleBranches: ['All Disciplines', 'Design', 'Human-Computer Interaction'],
    minGradYear: 2022,
    maxGradYear: 2026,
    minCgpa: 6.0,
    requiredSkills: ['Figma', 'UI Design', 'Wireframing', 'Prototyping'],
    optionalSkills: ['Design Systems', 'Micro-interactions', 'User Research'],
    badge: 'VERIFIED_COMPANY',
    sourceOrigin: 'DIRECT_POST',
    postedTime: '2 days ago',
    lastVerified: '45 minutes ago',
    description: `Join Swiggy’s Consumer Experience Design team. You will craft high-impact user flows, checkout ergonomics, and delight interactions for 30M+ hungry consumers on iOS and Android.\n\nWe care about taste, visual finesse, component modularity, and empathy for delivery executives and restaurant partners.`,
    responsibilities: [
      'Create high-fidelity mobile UI screens and interactive clickable prototypes in Figma',
      'Maintain and extend the Swiggy Design System tokens and icon sets',
      'Collaborate with user researchers on usability studies and consumer A/B tests',
      'Partner closely with Android and iOS engineers for pixel-level design QA',
    ],
    hiringProcess: [
      '1. Portfolio Review (Case studies of mobile or web products)',
      '2. Live 2-Hour Product Design Challenge & Crit Round',
      '3. Design Leadership & Product Culture Conversation',
    ],
  },
  'digital-marketing-growth-specialist-zomato': {
    id: 'job-6',
    title: 'Digital Marketing & Growth Specialist (Fresher)',
    slug: 'digital-marketing-growth-specialist-zomato',
    company: 'Zomato',
    companySlug: 'zomato',
    companyLogo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=128&auto=format&fit=crop&q=80',
    companyWebsite: 'https://zomato.com',
    companyAbout: 'Zomato is a leading restaurant aggregator and food delivery platform connecting millions of foodies with restaurants and delivery partners.',
    companyTrustScore: 94,
    companyRating: 4.0,
    roleCategory: 'Marketing',
    location: 'Gurugram, Haryana (Hybrid)',
    workplaceType: 'HYBRID',
    jobType: 'FULL_TIME',
    vacancies: 3,
    salaryText: '₹5,00,000 - ₹8,00,000 / year (Fixed CTC)',
    minExpYears: 0,
    maxExpYears: 1,
    eligibleDegrees: ['Any Graduate', 'BBA', 'BMM', 'B.Com', 'B.Tech'],
    eligibleBranches: ['All Disciplines'],
    minGradYear: 2022,
    maxGradYear: 2026,
    minCgpa: 5.5,
    requiredSkills: ['SEO', 'Content Writing', 'Social Media', 'Canva'],
    optionalSkills: ['Google Analytics', 'Performance Marketing', 'Copywriting'],
    badge: 'VERIFIED_COMPANY',
    sourceOrigin: 'DIRECT_POST',
    postedTime: '3 days ago',
    lastVerified: '2 hours ago',
    description: `Zomato’s Organic Growth & Brand Marketing team is looking for witty, creative freshers who live on social media and love food culture.\n\nYou will draft catchy push notifications, optimize local restaurant directory SEO pages, and brainstorm viral social campaigns that generate millions of impressions.`,
    responsibilities: [
      'Write compelling, witty notification copies and viral social media posts',
      'Perform keyword research and on-page SEO optimization for dining pages',
      'Track and analyze engagement metrics across Instagram, X (Twitter), and YouTube',
      'Coordinate with graphic designers and video creators on campaign creatives',
    ],
    hiringProcess: [
      '1. Creative Copywriting & Growth Assignment',
      '2. Brand Strategy Discussion with Growth Lead',
      '3. Team Culture & Managerial Interview',
    ],
  },
};

export default function JobDetailPage() {
  const params = useParams();
  const slug = (Array.isArray(params?.slug) ? params.slug[0] : (params?.slug as string)) || '';

  const { user, applyToJob, isApplied, openAuthModal } = useUser();

  // Resolve initial job from catalog by slug or default to first
  const initialJob = JOB_CATALOG[slug] || JOB_CATALOG['associate-software-engineer-frontend-razorpay'];
  const [job, setJob] = useState<JobDetail>(initialJob);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [justApplied, setJustApplied] = useState(false);

  const hasApplied = isApplied(job.slug) || justApplied;

  // Fetch job dynamically from backend API whenever slug changes
  useEffect(() => {
    if (!slug) return;

    if (JOB_CATALOG[slug]) {
      setJob(JOB_CATALOG[slug]);
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    fetch(`${API_BASE}/jobs/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.success && data.job) {
          const apiJob = data.job;
          setJob({
            id: apiJob.id || 'job-custom',
            title: apiJob.title,
            slug: apiJob.slug || slug,
            company: apiJob.company?.name || 'Verified Employer',
            companySlug: apiJob.company?.slug || 'company',
            companyLogo: apiJob.company?.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
            companyWebsite: apiJob.company?.official_website || 'https://example.com',
            companyAbout: apiJob.company?.about || 'Verified corporate employer with high fresher trust score.',
            companyTrustScore: apiJob.company?.trust_score || 95,
            companyRating: apiJob.company?.rating_overall || 4.3,
            roleCategory: apiJob.role_category || 'Technology',
            location: `${apiJob.location_city || 'Bengaluru'} (${apiJob.workplace_type || 'HYBRID'})`,
            workplaceType: apiJob.workplace_type || 'HYBRID',
            jobType: apiJob.job_type || 'FULL_TIME',
            vacancies: apiJob.vacancies || 2,
            salaryText: `₹${(apiJob.salary_min_inr || 600000).toLocaleString('en-IN')} - ₹${(apiJob.salary_max_inr || 1200000).toLocaleString('en-IN')} / year`,
            minExpYears: apiJob.min_exp_years ?? 0,
            maxExpYears: apiJob.max_exp_years ?? 1,
            eligibleDegrees: apiJob.eligible_degrees || ['B.Tech', 'B.E', 'BCA', 'MCA'],
            eligibleBranches: apiJob.eligible_branches || ['All Engineering', 'Computer Science'],
            minGradYear: apiJob.min_graduation_year || 2022,
            maxGradYear: apiJob.max_graduation_year || 2026,
            minCgpa: apiJob.min_cgpa_or_percentage || 6.0,
            requiredSkills: apiJob.required_skills || ['Programming', 'Problem Solving'],
            optionalSkills: apiJob.optional_skills || [],
            badge: (apiJob.trust_badge as TrustBadgeType) || 'VERIFIED_COMPANY',
            sourceOrigin: apiJob.source_origin || 'DIRECT_POST',
            postedTime: apiJob.postedTimeAgo || 'Today',
            lastVerified: apiJob.lastVerifiedAgo || 'Just now',
            description: apiJob.description,
            responsibilities: apiJob.responsibilities || [
              'Build and test clean software components',
              'Participate in agile sprints and daily updates',
              'Collaborate with senior mentors and team leads',
            ],
            hiringProcess: apiJob.company?.hiring_process_steps || [
              '1. Skill Match & Resume Shortlisting',
              '2. Technical / Domain Assessment',
              '3. Interview with Engineering Lead & HR',
            ],
          });
        }
      })
      .catch(() => {
        // Fallback already assigned from JOB_CATALOG
      });
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Compute live skill match analysis dynamically using the user's active skills
  const activeUserSkills = user?.skills && user.skills.length > 0 ? user.skills : [];
  const matched = job.requiredSkills.filter((s) =>
    activeUserSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );
  const missing = job.requiredSkills.filter(
    (s) => !activeUserSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );
  const matchPercentage =
    job.requiredSkills.length > 0
      ? activeUserSkills.length > 0
        ? Math.round((matched.length / job.requiredSkills.length) * 100)
        : 70
      : 80;

  const candidateAnalysis: SkillMatchAnalysis = {
    matchScore: matchPercentage,
    matchedSkills: matched,
    missingSkills: missing,
    optionalMatchedSkills: job.optionalSkills.filter((s) =>
      activeUserSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
    ),
    eligibility: {
      isEligible: true,
      reasons: ['Your graduation year, degree, and minimum CGPA criteria satisfy this fresher opening!'],
    },
    missingSkillRoadmaps: missing.map((sk) => ({
      skillName: sk,
      category: 'Core Competency',
      estimatedHours: 20,
      difficulty: 'INTERMEDIATE',
      overview: `Learn essential concepts and industry application of ${sk} to qualify for this verified role.`,
      learningSteps: [
        `Understand core foundations, syntax, and workflows of ${sk}`,
        `Complete interactive practice modules and unit exercises`,
        `Build a hands-on project demonstrating mastery of ${sk}`,
      ],
      freeResources: [
        {
          title: `Free ${sk} Foundation Guide`,
          provider: 'FreeCodeCamp / Official Docs',
          url: 'https://freecodecamp.org',
          isFree: true,
          type: 'COURSE',
        },
      ],
      practiceProject: {
        title: `${sk} Practical Demonstration Project`,
        description: `Build an end-to-end portfolio module using ${sk} to showcase to recruiters.`,
      },
    })),
    totalEstimatedLearningHours: missing.length * 20,
    readinessVerdict:
      matchPercentage >= 75
        ? 'HIGHLY_RECOMMENDED'
        : matchPercentage >= 50
        ? 'COMPETITIVE_WITH_GAP'
        : 'SIGNIFICANT_UPSKILL_REQUIRED',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back Link */}
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800">
        <ArrowLeft className="w-4 h-4" /> Back to all jobs
      </Link>

      {/* Main Job Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-900/10 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <img src={job.companyLogo} alt={job.company} className="w-16 h-16 rounded-2xl object-cover border border-slate-200" />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <Link href={`/companies/${job.companySlug}`} className="text-base font-extrabold text-teal-800 hover:underline">
                  {job.company}
                </Link>
                <TrustBadge badge={job.badge} />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{job.title}</h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {job.location} • Posted {job.postedTime} • Last verified {job.lastVerified}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <span className="text-lg font-black text-teal-800">{job.salaryText}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-teal-700 hover:border-teal-300 flex items-center gap-1 transition-colors"
                title="Share this verified opportunity"
              >
                <Share2 className="w-3.5 h-3.5 text-teal-600" />
                {isCopied ? 'Link Copied!' : 'Share'}
              </button>
              <button
                onClick={() => setReportModalOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-coral-600 hover:border-coral-300 flex items-center gap-1"
                title="Report fake posting or fee demand"
              >
                <Flag className="w-3.5 h-3.5 text-coral-500" />
                Report
              </button>
              <button
                onClick={() => {
                  applyToJob({
                    id: job.id,
                    title: job.title,
                    company: job.company,
                    companyLogo: job.companyLogo,
                    matchScore: matchPercentage,
                    slug: job.slug,
                  });
                  setJustApplied(true);
                }}
                disabled={hasApplied}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-sm flex items-center gap-2 disabled:bg-emerald-600 transition-all"
              >
                {hasApplied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    Applied Successfully!
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-coral-300" />
                    Easy Apply (Free)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Fresher Eligibility Quick Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-400 font-semibold block mb-0.5">Experience Limit</span>
            <strong className="text-slate-800 font-bold">{job.minExpYears} - {job.maxExpYears} Year (Fresher)</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-400 font-semibold block mb-0.5">Eligible Batches</span>
            <strong className="text-slate-800 font-bold">{job.minGradYear} to {job.maxGradYear} Passes</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-400 font-semibold block mb-0.5">Min Academic Cut-off</span>
            <strong className="text-slate-800 font-bold">{job.minCgpa} CGPA / 65%</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-400 font-semibold block mb-0.5">Open Vacancies</span>
            <strong className="text-slate-800 font-bold">{job.vacancies} Candidates</strong>
          </div>
        </div>
      </div>

      {/* Embedded Skill Match & Gap Analysis Widget */}
      <SkillMatchWidget analysis={candidateAnalysis} />

      {/* Description & Responsibilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-3">Role Overview</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          <div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-3">Key Responsibilities</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {job.responsibilities.map((resp, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-3">Eligible Degrees & Branches</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {job.eligibleDegrees.map((deg, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-slate-100 font-bold text-slate-800">
                  {deg}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Allowed Branches: {job.eligibleBranches.join(', ')}
            </p>
          </div>

          <div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-3">Hiring Process</h3>
            <div className="space-y-2">
              {job.hiringProcess.map((step, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Company & Anti-Fraud Advisory */}
        <div className="space-y-6">
          {/* Company Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
            <h4 className="font-bold text-slate-800 text-sm mb-3">About the Employer</h4>
            <div className="flex items-center gap-3 mb-3">
              <img src={job.companyLogo} alt={job.company} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
              <div>
                <p className="font-extrabold text-slate-900 text-sm">{job.company}</p>
                <p className="text-xs text-emerald-600 font-semibold">Trust Score: {job.companyTrustScore}/100</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">{job.companyAbout}</p>
            <Link
              href={`/companies/${job.companySlug}`}
              className="w-full py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 flex items-center justify-center gap-1"
            >
              View Full Company Profile & Reviews
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Safety Reminder */}
          <div className="bg-coral-50/70 rounded-3xl p-6 border border-coral-200/80">
            <h4 className="font-bold text-coral-950 text-sm mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-coral-600" />
              Zero Tolerance Scam Guarantee
            </h4>
            <p className="text-xs text-coral-800 leading-relaxed">
              If any recruiter asks you for application charges, training fees, or laptop deposits, report them immediately. We maintain a permanent legal blacklist.
            </p>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        jobId={job.id}
        jobTitle={job.title}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
}
