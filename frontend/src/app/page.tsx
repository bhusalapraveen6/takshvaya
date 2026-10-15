import React from 'react';
import Link from 'next/link';
import { Sparkles, Search, MapPin, Briefcase, ShieldCheck, ArrowRight, CheckCircle2, TrendingUp, BookOpen, Lock, Users, Zap, Compass, Building } from 'lucide-react';
import { TrustBadge } from '../components/TrustBadge';

export default function HomePage() {
  const featuredJobs = [
    {
      id: 'job-1',
      title: 'Associate Software Engineer - Frontend (React / TypeScript)',
      company: 'Razorpay',
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
      location: 'Bengaluru (Hybrid)',
      salary: '₹8,00,000 - ₹14,00,000',
      skills: ['React', 'TypeScript', 'JavaScript', 'Git'],
      badge: 'VERIFIED_COMPANY' as const,
      postedTime: '2 hours ago',
      matchScore: 88,
      slug: 'associate-software-engineer-frontend-razorpay',
    },
    {
      id: 'job-2',
      title: 'Graduate Data Analyst (Python / SQL / Tableau)',
      company: 'Tata Digital',
      companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&auto=format&fit=crop&q=80',
      location: 'Mumbai (Hybrid)',
      salary: '₹6,50,000 - ₹10,00,000',
      skills: ['SQL', 'Python', 'Excel', 'Tableau'],
      badge: 'VERIFIED_COMPANY' as const,
      postedTime: '5 hours ago',
      matchScore: 78,
      slug: 'graduate-data-analyst-tata-digital',
    },
    {
      id: 'job-3',
      title: 'Scientist / Engineer ‘SC’ Trainee (ISRO Fresher Drive)',
      company: 'ISRO (Govt of India)',
      companyLogo: 'https://images.unsplash.com/photo-1517976487588-4c32144360e2?w=128&auto=format&fit=crop&q=80',
      location: 'Bengaluru (On-site)',
      salary: '₹7,20,000 - ₹11,00,000',
      skills: ['C/C++', 'Embedded Systems', 'Digital Electronics'],
      badge: 'SOURCE_VERIFIED' as const,
      postedTime: '1 day ago',
      matchScore: 70,
      slug: 'scientist-engineer-sc-trainee-isro',
    },
    {
      id: 'job-4',
      title: 'Graduate Engineer Trainee - Mechanical / Robotics',
      company: 'Tata Motors',
      companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&auto=format&fit=crop&q=80',
      location: 'Pune (On-site)',
      salary: '₹6,00,000 - ₹9,50,000',
      skills: ['AutoCAD', 'SolidWorks', 'Thermodynamics'],
      badge: 'VERIFIED_COMPANY' as const,
      postedTime: '1 day ago',
      matchScore: 65,
      slug: 'graduate-engineer-trainee-mechanical-pune',
    },
  ];

  const popularRoles = [
    { title: 'Software Engineer', path: '/jobs/role/software-engineer', count: 42, icon: Briefcase, color: 'text-teal-600 bg-teal-50' },
    { title: 'Data Analyst', path: '/jobs/role/data-analyst', count: 28, icon: TrendingUp, color: 'text-sky-600 bg-sky-50' },
    { title: 'Core Engineering', path: '/jobs/role/core-engineering', count: 19, icon: Zap, color: 'text-amber-600 bg-amber-50' },
    { title: 'UI/UX Design', path: '/jobs/role/ui-ux-design', count: 14, icon: Compass, color: 'text-purple-600 bg-purple-50' },
    { title: 'Finance & Banking', path: '/jobs/role/finance-banking', count: 21, icon: Building, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Growth Marketing', path: '/jobs/role/digital-marketing', count: 16, icon: Sparkles, color: 'text-coral-500 bg-coral-50' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 gradient-hero border-b border-teal-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/70 border border-teal-200/80 text-teal-900 text-xs font-bold mb-6">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Zero Ads • Zero Fake Postings • Exclusively for 0-2 Years Experience</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Your Verified Career Launchpad.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-coral-500">
              Zero Scams. Real Roles.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Takshvaya protects early-career talent from pay-to-apply fraud, spam rankings, and ghost postings. Get real match scores, personalized learning roadmaps, and direct verified recruiter applications.
          </p>

          {/* Fresher Search Card */}
          <div className="mt-10 max-w-4xl mx-auto bg-white p-3 sm:p-4 rounded-2xl shadow-card border border-teal-900/10 text-left">
            <form action="/jobs" method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-5 relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  name="q"
                  placeholder="Role, skill (e.g. React, Python), or company..."
                  className="w-full pl-11 pr-3 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4 relative flex items-center">
                <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5" />
                <select
                  name="location"
                  className="w-full pl-11 pr-3 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:outline-none text-slate-700 appearance-none"
                >
                  <option value="">All Locations & Remote</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi-NCR">Delhi-NCR</option>
                  <option value="Remote">Remote (Work From Home)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl text-sm font-bold bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                >
                  Find Jobs
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Popular Searches:</span>
              <Link href="/jobs?q=React" className="hover:text-teal-700 hover:underline">React Frontend</Link>
              <span>•</span>
              <Link href="/jobs?q=Data+Analyst" className="hover:text-teal-700 hover:underline">Data Analyst</Link>
              <span>•</span>
              <Link href="/jobs?q=Mechanical" className="hover:text-teal-700 hover:underline">Mechanical GET</Link>
              <span>•</span>
              <Link href="/jobs?workplace=REMOTE" className="text-coral-600 font-semibold hover:underline">Work From Home (WFH)</Link>
            </div>
          </div>

          {/* Trust Metric Strip */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-3.5 rounded-xl bg-white/80 border border-teal-900/10">
              <p className="text-xl sm:text-2xl font-black text-teal-800">100% Free</p>
              <p className="text-xs text-slate-500 font-medium">No fees, zero ads, no paywalls</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/80 border border-teal-900/10">
              <p className="text-xl sm:text-2xl font-black text-teal-800">0 - 2 Yrs</p>
              <p className="text-xs text-slate-500 font-medium">Strict fresher experience cap</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/80 border border-teal-900/10">
              <p className="text-xl sm:text-2xl font-black text-coral-600">Zero Scams</p>
              <p className="text-xs text-slate-500 font-medium">Automated fraud quarantine</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/80 border border-teal-900/10">
              <p className="text-xl sm:text-2xl font-black text-teal-800">10+ Tracks</p>
              <p className="text-xs text-slate-500 font-medium">IT, Core, Finance, Design & Govt</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-coral-500">Early-Career Paths</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Explore by Role Category</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Each role includes salary data, free roadmaps, and interview questions.</p>
          </div>
          <Link href="/jobs" className="mt-2 sm:mt-0 text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1">
            Browse all categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularRoles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <Link
                key={idx}
                href={role.path}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-400 hover:shadow-card transition-all flex flex-col items-center text-center group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${role.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 group-hover:text-teal-700">{role.title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{role.count} open jobs</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Verified Jobs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Verified Fresher Openings</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">Every job is vetted with corporate email, GST/CIN verification, and transparent salary ranges.</p>
          </div>
          <Link href="/jobs" className="mt-2 sm:mt-0 text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1">
            View all 120+ active jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featuredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-teal-500 hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img src={job.companyLogo} alt={job.company} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-snug">{job.company}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {job.location}
                      </p>
                    </div>
                  </div>
                  <TrustBadge badge={job.badge} />
                </div>

                <Link href={`/jobs/${job.slug}`}>
                  <h3 className="font-extrabold text-slate-900 text-base hover:text-teal-700 transition-colors mb-2">
                    {job.title}
                  </h3>
                </Link>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-800">
                    {job.salary}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                    Fresher (0-1 yr)
                  </span>
                  <span className="text-xs text-slate-400 ml-auto">{job.postedTime}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 border border-slate-200 text-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{job.matchScore}% Skill Match</span>
                </div>
                <Link
                  href={`/jobs/${job.slug}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5"
                >
                  View & Skill Check
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Takshvaya Section */}
      <section className="bg-teal-900 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-coral-400">Anti-Exploitation Mission</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">Why Freshers Choose Takshvaya</h2>
          <p className="text-sm text-teal-200 mt-2">
            Most job portals mix freshers with senior engineers, allow paid fake placements, and monetize with disruptive popups. We built Takshvaya to change that permanently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-teal-800/60 p-6 rounded-2xl border border-teal-700/60">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-coral-300 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Automated Scam Detection</h3>
            <p className="text-xs text-teal-200 leading-relaxed">
              Any posting asking for registration fees, deposits, or directing only to Telegram is auto-quarantined instantly. Recruiters must verify official corporate domains and GST credentials.
            </p>
          </div>

          <div className="bg-teal-800/60 p-6 rounded-2xl border border-teal-700/60">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-coral-300 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Skill Gap Analysis & Roadmaps</h3>
            <p className="text-xs text-teal-200 leading-relaxed">
              Don&apos;t just get rejected. We show you exactly what skills you&apos;re missing, estimated learning time, and curate 100% free courses (React.dev, Harvard CS50, freeCodeCamp) to help you qualify.
            </p>
          </div>

          <div className="bg-teal-800/60 p-6 rounded-2xl border border-teal-700/60">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-coral-300 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Controlled Auto-Apply</h3>
            <p className="text-xs text-teal-200 leading-relaxed">
              You stay in full control. Define your minimum match score (e.g. 80%), preferred salary floor, and daily limits. We submit your application only to verified jobs where you are strictly eligible.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
