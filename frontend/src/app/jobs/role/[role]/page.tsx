'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Compass, TrendingUp, HelpCircle, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { TrustBadge } from '../../../../components/TrustBadge';

interface RoleProfile {
  title: string;
  category: string;
  fresherSalary: string;
  overview: string;
  careerProgression: Array<{ level: string; salary: string }>;
  requiredSkills: Array<{ name: string; hours: number }>;
  topHiringCompanies: Array<{ name: string; logo: string; openJobs: number }>;
  interviewQuestions: Array<{ q: string; a: string }>;
  activeJobs: Array<{
    title: string;
    company: string;
    slug: string;
    salary: string;
    location: string;
    badge: 'VERIFIED_COMPANY' | 'VERIFIED_RECRUITER' | 'SOURCE_VERIFIED';
  }>;
}

const ROLES_DIRECTORY: Record<string, RoleProfile> = {
  'software-engineer': {
    title: 'Software Engineer (Frontend / Fullstack)',
    category: 'Information Technology',
    fresherSalary: '₹6,00,000 - ₹16,00,000 / year',
    overview: 'As an entry-level Software Engineer, you build user-facing applications, write robust code, learn system architecture, and collaborate with experienced mentors.',
    careerProgression: [
      { level: 'Associate Software Engineer (0-2 Yrs)', salary: '₹6L - ₹14L' },
      { level: 'Software Engineer II (2-4 Yrs)', salary: '₹14L - ₹24L' },
      { level: 'Senior Software Engineer (4-7 Yrs)', salary: '₹24L - ₹42L' },
      { level: 'Staff Engineer / Tech Lead (7+ Yrs)', salary: '₹45L+' },
    ],
    requiredSkills: [
      { name: 'JavaScript & TypeScript', hours: 25 },
      { name: 'React / Next.js', hours: 30 },
      { name: 'Git & Version Control', hours: 10 },
      { name: 'REST APIs & Asynchronous JS', hours: 15 },
      { name: 'Data Structures & Algorithms Basics', hours: 40 },
    ],
    topHiringCompanies: [
      { name: 'Razorpay', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&auto=format&fit=crop&q=80', openJobs: 4 },
      { name: 'CRED', logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=64&auto=format&fit=crop&q=80', openJobs: 6 },
      { name: 'Google India', logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=64&auto=format&fit=crop&q=80', openJobs: 3 },
    ],
    interviewQuestions: [
      {
        q: 'What is the difference between Virtual DOM and Real DOM in React?',
        a: 'The Virtual DOM is a lightweight JavaScript representation of the actual DOM. React uses it to calculate differences (reconciliation) and update only modified nodes, minimizing costly browser reflows.',
      },
      {
        q: 'How does the JavaScript Event Loop handle asynchronous callbacks?',
        a: 'The Call Stack executes synchronous code. Asynchronous callbacks (Promises, setTimeout) are placed in the Microtask and Macrotask queues, which the Event Loop pushes to the stack once empty.',
      },
    ],
    activeJobs: [
      {
        title: 'Associate Software Engineer - Frontend (React / TypeScript)',
        company: 'Razorpay',
        slug: 'associate-software-engineer-frontend-razorpay',
        salary: '₹8,00,000 - ₹14,00,000',
        location: 'Bengaluru (Hybrid)',
        badge: 'VERIFIED_COMPANY',
      },
      {
        title: 'Junior Fullstack Engineer (Next.js / Node.js)',
        company: 'CRED',
        slug: 'junior-fullstack-engineer-cred',
        salary: '₹10,00,000 - ₹16,00,000',
        location: 'Bengaluru (On-site)',
        badge: 'VERIFIED_RECRUITER',
      },
    ],
  },
  'data-analyst': {
    title: 'Data Analyst & BI Specialist',
    category: 'Analytics & Data Science',
    fresherSalary: '₹5,50,000 - ₹12,00,000 / year',
    overview: 'Data Analysts translate complex operational data into actionable dashboards, write SQL queries, build business reporting models, and spot customer behavior trends.',
    careerProgression: [
      { level: 'Junior Data Analyst (0-2 Yrs)', salary: '₹5.5L - ₹10L' },
      { level: 'Senior Data Analyst (2-5 Yrs)', salary: '₹10L - ₹18L' },
      { level: 'Analytics Lead / BI Manager (5+ Yrs)', salary: '₹20L - ₹35L' },
    ],
    requiredSkills: [
      { name: 'SQL Querying & Joins', hours: 25 },
      { name: 'Python (Pandas, NumPy)', hours: 35 },
      { name: 'Tableau / Power BI', hours: 20 },
      { name: 'Advanced Excel', hours: 15 },
    ],
    topHiringCompanies: [
      { name: 'Tata Digital', logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=64&auto=format&fit=crop&q=80', openJobs: 5 },
      { name: 'Flipkart', logo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=64&auto=format&fit=crop&q=80', openJobs: 8 },
    ],
    interviewQuestions: [
      {
        q: 'What is the difference between WHERE and HAVING clauses in SQL?',
        a: 'WHERE filters rows before any groupings are applied. HAVING filters grouped records after GROUP BY aggregate calculations.',
      },
      {
        q: 'How do you handle missing or NULL values in a dataset?',
        a: 'Depending on distribution and business context: imputation with mean/median/mode, indicator flagging, forward/backward fill for time-series, or domain-validated exclusion.',
      },
    ],
    activeJobs: [
      {
        title: 'Graduate Data Analyst (Python / SQL / Tableau)',
        company: 'Tata Digital',
        slug: 'graduate-data-analyst-tata-digital',
        salary: '₹6,50,000 - ₹10,00,000',
        location: 'Mumbai (Hybrid)',
        badge: 'VERIFIED_COMPANY',
      },
    ],
  },
  'core-engineering': {
    title: 'Core Mechanical & Robotics Trainee',
    category: 'Core Engineering',
    fresherSalary: '₹5,00,000 - ₹10,00,000 / year',
    overview: 'Design mechanical components, analyze thermodynamics, automate industrial assembly lines, and validate CAD models for automotive and aerospace products.',
    careerProgression: [
      { level: 'Graduate Engineer Trainee (0-1 Yr)', salary: '₹5L - ₹8.5L' },
      { level: 'Design / Production Engineer (1-4 Yrs)', salary: '₹8.5L - ₹15L' },
      { level: 'Senior Engineering Manager (4+ Yrs)', salary: '₹16L - ₹28L' },
    ],
    requiredSkills: [
      { name: 'AutoCAD & SolidWorks', hours: 40 },
      { name: 'Thermodynamics & Fluid Mechanics', hours: 30 },
      { name: 'Finite Element Analysis (FEA)', hours: 25 },
    ],
    topHiringCompanies: [
      { name: 'Tata Motors', logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=64&auto=format&fit=crop&q=80', openJobs: 4 },
      { name: 'L&T Technology', logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=64&auto=format&fit=crop&q=80', openJobs: 7 },
    ],
    interviewQuestions: [
      {
        q: 'What is the difference between stress and strain?',
        a: 'Stress is the internal restoring force per unit area in a material under load (N/m²). Strain is the relative deformation or fractional dimensional change caused by applied stress.',
      },
    ],
    activeJobs: [
      {
        title: 'Graduate Engineer Trainee - Mechanical / Robotics',
        company: 'Tata Motors',
        slug: 'graduate-engineer-trainee-mechanical-robotics',
        salary: '₹6,00,000 - ₹9,50,000',
        location: 'Pune (On-site)',
        badge: 'VERIFIED_COMPANY',
      },
    ],
  },
  'design': {
    title: 'UI/UX & Product Designer',
    category: 'Design & Creative',
    fresherSalary: '₹6,00,000 - ₹14,00,000 / year',
    overview: 'Craft intuitive user interfaces, design interactive wireframes, conduct usability user tests, and maintain unified design component libraries.',
    careerProgression: [
      { level: 'Associate Product Designer (0-2 Yrs)', salary: '₹6L - ₹12L' },
      { level: 'Product Designer (2-5 Yrs)', salary: '₹12L - ₹22L' },
      { level: 'Design Lead (5+ Yrs)', salary: '₹24L - ₹40L' },
    ],
    requiredSkills: [
      { name: 'Figma & Design Systems', hours: 35 },
      { name: 'Wireframing & Prototyping', hours: 20 },
      { name: 'User Research & Usability Testing', hours: 15 },
    ],
    topHiringCompanies: [
      { name: 'Swiggy', logo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=64&auto=format&fit=crop&q=80', openJobs: 3 },
      { name: 'Zomato', logo: 'https://images.unsplash.com/photo-1517976487588-4c32144360e2?w=64&auto=format&fit=crop&q=80', openJobs: 2 },
    ],
    interviewQuestions: [
      {
        q: 'How do you balance aesthetic design with accessibility (WCAG) requirements?',
        a: 'By integrating high-contrast color ratios, scalable typography scales, clear focus states for keyboard users, and semantic hierarchy into foundational design tokens from day one.',
      },
    ],
    activeJobs: [
      {
        title: 'Junior Product Designer (UI/UX - Mobile & Web)',
        company: 'Swiggy',
        slug: 'junior-product-designer-ui-ux-mobile-web',
        salary: '₹7,50,000 - ₹12,00,000',
        location: 'Bengaluru (Hybrid)',
        badge: 'VERIFIED_COMPANY',
      },
    ],
  },
};

export default function RoleDetailPage() {
  const params = useParams();
  const rawRoleSlug = (params?.role as string) || '';
  const roleSlug = rawRoleSlug.toLowerCase().trim();

  const roleDetails = ROLES_DIRECTORY[roleSlug];

  // 404 Handler for Unknown Roles
  if (!roleDetails) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-coral-100 text-coral-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">Career Track Not Found</h1>
        <p className="text-slate-600 max-w-md mx-auto text-sm">
          We couldn&apos;t find a curated career roadmap for &quot;{rawRoleSlug}&quot;. Browse all verified fresher role tracks on Takshvaya.
        </p>
        <div className="pt-4 flex items-center justify-center gap-4">
          <Link
            href="/jobs"
            className="px-6 py-3 rounded-xl bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 shadow-soft"
          >
            Explore All Fresher Jobs
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Back Link */}
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800">
        <ArrowLeft className="w-4 h-4" /> Back to job directory
      </Link>

      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-teal-900/10 shadow-card">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-coral-500 mb-2">
          <Compass className="w-4 h-4" />
          <span>Fresher Career Path Guide • {roleDetails.category}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">{roleDetails.title}</h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">{roleDetails.overview}</p>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-bold text-teal-800">
          <span className="p-3 rounded-xl bg-teal-50 border border-teal-200">
            Fresher Salary Range: {roleDetails.fresherSalary}
          </span>
          <span className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            Target Batch: 2022-2026 Graduates
          </span>
        </div>
      </div>

      {/* Grid: Career Progression + Skills Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Career Progression */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft">
          <h3 className="font-extrabold text-slate-900 text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            Fresher Career Progression & Compensation
          </h3>
          <div className="space-y-3">
            {roleDetails.careerProgression.map((step, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{step.level}</span>
                <span className="font-extrabold text-teal-700">{step.salary}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Essential Skills Roadmap */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft">
          <h3 className="font-extrabold text-slate-900 text-lg mb-4 flex items-center gap-2">
            <Compass className="w-5 h-5 text-coral-500" />
            Must-Have Skills & Learning Hours
          </h3>
          <div className="space-y-2.5">
            {roleDetails.requiredSkills.map((sk, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{sk.name}</span>
                <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold">~{sk.hours} hrs</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Common Interview Questions */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-soft">
        <h3 className="font-extrabold text-slate-900 text-lg mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-coral-500" />
          Frequently Asked Fresher Interview Questions
        </h3>
        <div className="space-y-4">
          {roleDetails.interviewQuestions.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <p className="font-extrabold text-slate-900 mb-1.5">Q: {item.q}</p>
              <p className="text-slate-600 leading-relaxed">A: {item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Jobs for this Role */}
      <div>
        <h3 className="font-extrabold text-slate-900 text-xl mb-4">
          Open Positions for {roleDetails.title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roleDetails.activeJobs.map((job, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-600">{job.company}</span>
                  <TrustBadge badge={job.badge} />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">{job.title}</h4>
                <p className="text-xs text-teal-700 font-bold mt-1">{job.salary} • {job.location}</p>
              </div>
              <Link href={`/jobs/${job.slug}`} className="p-2.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
