'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Filter, Bookmark, ShieldCheck, CheckCircle2, SlidersHorizontal, ArrowUpDown, Clock } from 'lucide-react';
import { TrustBadge } from '../../components/TrustBadge';

export default function JobsDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedDegree, setSelectedDegree] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [minSalary, setMinSalary] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'salary' | 'rating'>('newest');
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set(['job-1']));

  // Complete Fresher Jobs Data
  const jobsData = [
    {
      id: 'job-1',
      title: 'Associate Software Engineer - Frontend (React / TypeScript)',
      company: 'Razorpay',
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
      roleCategory: 'Software Engineer',
      location: 'Bengaluru',
      workplace: 'HYBRID',
      salaryMin: 800000,
      salaryMax: 1400000,
      salaryText: '₹8,00,000 - ₹14,00,000',
      minExp: 0,
      maxExp: 1,
      degrees: ['B.Tech', 'B.E', 'BCA', 'MCA'],
      graduationYears: [2023, 2024, 2025, 2026],
      minCgpa: 6.5,
      skills: ['React', 'TypeScript', 'JavaScript', 'Git'],
      badge: 'VERIFIED_COMPANY' as const,
      postedTime: '2 hours ago',
      matchScore: 88,
      isVerifiedCompany: true,
      slug: 'associate-software-engineer-frontend-razorpay',
    },
    {
      id: 'job-2',
      title: 'Graduate Data Analyst (Python / SQL / Tableau)',
      company: 'Tata Digital',
      companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&auto=format&fit=crop&q=80',
      roleCategory: 'Data Analyst',
      location: 'Mumbai',
      workplace: 'HYBRID',
      salaryMin: 650000,
      salaryMax: 1000000,
      salaryText: '₹6,50,000 - ₹10,00,000',
      minExp: 0,
      maxExp: 1,
      degrees: ['B.Tech', 'B.Sc', 'BCA', 'B.Com'],
      graduationYears: [2022, 2023, 2024, 2025, 2026],
      minCgpa: 6.0,
      skills: ['SQL', 'Python', 'Excel', 'Tableau'],
      badge: 'VERIFIED_COMPANY' as const,
      postedTime: '5 hours ago',
      matchScore: 78,
      isVerifiedCompany: true,
      slug: 'graduate-data-analyst-tata-digital',
    },
    {
      id: 'job-3',
      title: 'Scientist / Engineer ‘SC’ Trainee (ISRO Fresher Drive)',
      company: 'ISRO (Govt of India)',
      companyLogo: 'https://images.unsplash.com/photo-1517976487588-4c32144360e2?w=128&auto=format&fit=crop&q=80',
      roleCategory: 'Government & Public Sector',
      location: 'Bengaluru',
      workplace: 'ON_SITE',
      salaryMin: 720000,
      salaryMax: 1100000,
      salaryText: '₹7,20,000 - ₹11,00,000',
      minExp: 0,
      maxExp: 1,
      degrees: ['B.Tech', 'B.E', 'B.Sc Engineering'],
      graduationYears: [2022, 2023, 2024, 2025, 2026],
      minCgpa: 6.84,
      skills: ['C/C++', 'Embedded Systems', 'Digital Electronics'],
      badge: 'SOURCE_VERIFIED' as const,
      postedTime: '1 day ago',
      matchScore: 70,
      isVerifiedCompany: true,
      slug: 'scientist-engineer-sc-trainee-isro',
    },
    {
      id: 'job-4',
      title: 'Graduate Engineer Trainee - Mechanical / Robotics',
      company: 'Tata Motors',
      companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&auto=format&fit=crop&q=80',
      roleCategory: 'Core Engineering',
      location: 'Pune',
      workplace: 'ON_SITE',
      salaryMin: 600000,
      salaryMax: 950000,
      salaryText: '₹6,00,000 - ₹9,50,000',
      minExp: 0,
      maxExp: 1,
      degrees: ['B.Tech', 'B.E', 'Mechanical'],
      graduationYears: [2023, 2024, 2025, 2026],
      minCgpa: 6.5,
      skills: ['AutoCAD', 'SolidWorks', 'Thermodynamics'],
      badge: 'VERIFIED_COMPANY' as const,
      postedTime: '1 day ago',
      matchScore: 65,
      isVerifiedCompany: true,
      slug: 'graduate-engineer-trainee-mechanical-pune',
    },
    {
      id: 'job-5',
      title: 'Junior Product Designer (UI/UX - Web & Mobile)',
      company: 'Swiggy',
      companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&auto=format&fit=crop&q=80',
      roleCategory: 'Design',
      location: 'Bengaluru',
      workplace: 'HYBRID',
      salaryMin: 750000,
      salaryMax: 1200000,
      salaryText: '₹7,50,000 - ₹12,00,000',
      minExp: 0,
      maxExp: 1,
      degrees: ['B.Des', 'M.Des', 'Any Graduate'],
      graduationYears: [2022, 2023, 2024, 2025, 2026],
      minCgpa: 6.0,
      skills: ['Figma', 'UI Design', 'Wireframing', 'Prototyping'],
      badge: 'VERIFIED_COMPANY' as const,
      postedTime: '2 days ago',
      matchScore: 82,
      isVerifiedCompany: true,
      slug: 'junior-product-designer-swiggy',
    },
    {
      id: 'job-6',
      title: 'Digital Marketing & Growth Specialist (Fresher)',
      company: 'Zomato',
      companyLogo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=128&auto=format&fit=crop&q=80',
      roleCategory: 'Marketing',
      location: 'Gurugram',
      workplace: 'HYBRID',
      salaryMin: 500000,
      salaryMax: 800000,
      salaryText: '₹5,00,000 - ₹8,00,000',
      minExp: 0,
      maxExp: 1,
      degrees: ['Any Graduate', 'BBA', 'BMM'],
      graduationYears: [2022, 2023, 2024, 2025, 2026],
      minCgpa: 5.5,
      skills: ['SEO', 'Content Writing', 'Social Media', 'Canva'],
      badge: 'VERIFIED_COMPANY' as const,
      postedTime: '3 days ago',
      matchScore: 60,
      isVerifiedCompany: true,
      slug: 'digital-marketing-growth-specialist-zomato',
    },
  ];

  const toggleSave = (id: string) => {
    const updated = new Set(savedJobIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSavedJobIds(updated);
  };

  // Filter Logic
  const filteredJobs = jobsData.filter((job) => {
    // Search keyword
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Role
    if (selectedRole !== 'All' && job.roleCategory !== selectedRole) return false;

    // Location
    if (selectedLocation !== 'All') {
      if (selectedLocation === 'Remote' && job.workplace !== 'REMOTE') return false;
      if (selectedLocation !== 'Remote' && !job.location.includes(selectedLocation)) return false;
    }

    // Degree
    if (selectedDegree !== 'All' && !job.degrees.includes(selectedDegree) && !job.degrees.includes('Any Graduate')) {
      return false;
    }

    // Year
    if (selectedYear !== 'All' && !job.graduationYears.includes(parseInt(selectedYear, 10))) {
      return false;
    }

    // Min Salary
    if (minSalary > 0 && job.salaryMax < minSalary) return false;

    // Verified only
    if (verifiedOnly && !job.isVerifiedCompany) return false;

    return true;
  });

  // Sorting
  if (sortBy === 'salary') {
    filteredJobs.sort((a, b) => b.salaryMax - a.salaryMax);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Search */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Verified Fresher Job Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Showing authentic openings for 0–2 years experience. No pay-to-work scams, zero sponsored clutter.
        </p>

        {/* Live Search Bar */}
        <div className="mt-5 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by role, skills (e.g. React, Python), or company name..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-300 focus:border-teal-600 focus:outline-none text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-700" />
              Fresher Filters
            </h3>
            <button
              onClick={() => {
                setSelectedRole('All');
                setSelectedLocation('All');
                setSelectedDegree('All');
                setSelectedYear('All');
                setMinSalary(0);
                setVerifiedOnly(false);
                setSearchTerm('');
              }}
              className="text-[11px] font-semibold text-coral-600 hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Role Category</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Core Engineering">Core Engineering</option>
              <option value="Design">UI/UX Design</option>
              <option value="Marketing">Growth Marketing</option>
              <option value="Government & Public Sector">Government (ISRO)</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Location & Mode</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="All">All Locations</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Gurugram">Gurugram</option>
              <option value="Remote">Work From Home (Remote)</option>
            </select>
          </div>

          {/* Degree Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Degree / Qualification</label>
            <select
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="All">Any Qualification</option>
              <option value="B.Tech">B.Tech / B.E</option>
              <option value="BCA">BCA / MCA</option>
              <option value="B.Sc">B.Sc</option>
              <option value="B.Des">B.Des (Design)</option>
              <option value="Any Graduate">Any Graduate</option>
            </select>
          </div>

          {/* Batch Year Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Graduation Batch Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="All">All Batches (2022 - 2026)</option>
              <option value="2026">Class of 2026 (Upcoming)</option>
              <option value="2025">Class of 2025</option>
              <option value="2024">Class of 2024</option>
              <option value="2023">Class of 2023</option>
              <option value="2022">Class of 2022</option>
            </select>
          </div>

          {/* Salary Filter */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Min Salary Floor</span>
              <span className="text-teal-700">{minSalary === 0 ? 'Any' : `₹${minSalary / 100000} LPA+`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1200000"
              step="100000"
              value={minSalary}
              onChange={(e) => setMinSalary(parseInt(e.target.value, 10))}
              className="w-full accent-teal-700"
            />
          </div>

          {/* Verified Only Toggle */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Verified Companies Only</span>
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="w-4 h-4 accent-teal-700 rounded"
            />
          </div>
        </aside>

        {/* Results Area */}
        <main className="lg:col-span-3 space-y-4">
          {/* Results Bar */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs">
            <p className="font-semibold text-slate-600">
              Showing <strong className="text-slate-900">{filteredJobs.length}</strong> verified opportunities
            </p>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold text-slate-700 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="salary">Highest Salary</option>
              </select>
            </div>
          </div>

          {/* Jobs List */}
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-teal-500 hover:shadow-card transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <img src={job.companyLogo} alt={job.company} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{job.company}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {job.location} ({job.workplace})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrustBadge badge={job.badge} />
                    <button
                      onClick={() => toggleSave(job.id)}
                      className={`p-1.5 rounded-lg border ${savedJobIds.has(job.id) ? 'bg-coral-50 border-coral-200 text-coral-600' : 'border-slate-200 text-slate-400 hover:text-slate-600'}`}
                      title="Bookmark job"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

                <Link href={`/jobs/${job.slug}`}>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg hover:text-teal-700 transition-colors mb-2">
                    {job.title}
                  </h3>
                </Link>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-800">
                    {job.salaryText}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                    Fresher ({job.minExp}-{job.maxExp} yr)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                    {job.degrees.slice(0, 2).join(', ')}
                  </span>
                  <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {job.postedTime}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 border border-slate-200 text-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {job.matchScore}% Skill Match
                  </span>
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white"
                  >
                    View Details & Match Roadmap
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <p className="text-base font-bold text-slate-800 mb-1">No jobs match your filter criteria.</p>
              <p className="text-xs text-slate-500 mb-4">Try clearing some filters or searching with a different term.</p>
              <button
                onClick={() => {
                  setSelectedRole('All');
                  setSelectedLocation('All');
                  setSelectedDegree('All');
                  setSelectedYear('All');
                  setMinSalary(0);
                  setVerifiedOnly(false);
                  setSearchTerm('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
