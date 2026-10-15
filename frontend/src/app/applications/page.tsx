'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Briefcase, CheckCircle2, Clock, Sparkles, AlertCircle, ArrowRight, Trash2 } from 'lucide-react';

export default function ApplicationsTrackerPage() {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [applications, setApplications] = useState([
    {
      id: 'app-1',
      title: 'Associate Software Engineer - Frontend (React / TypeScript)',
      company: 'Razorpay',
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&auto=format&fit=crop&q=80',
      appliedAt: 'Yesterday, 4:15 PM',
      matchScore: 88,
      isAutoApplied: true,
      status: 'SHORTLISTED',
      recruiterNotes: 'Strong frontend portfolio. Machine coding invitation sent to registered Google email.',
      slug: 'associate-software-engineer-frontend-razorpay',
    },
    {
      id: 'app-2',
      title: 'Graduate Data Analyst (Python / SQL / Tableau)',
      company: 'Tata Digital',
      companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=64&auto=format&fit=crop&q=80',
      appliedAt: '3 days ago',
      matchScore: 78,
      isAutoApplied: false,
      status: 'VIEWED',
      recruiterNotes: 'Application viewed by Campus Recruitment Team.',
      slug: 'graduate-data-analyst-tata-digital',
    },
    {
      id: 'app-3',
      title: 'Junior Cloud & DevOps Trainee',
      company: 'Google India',
      companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=64&auto=format&fit=crop&q=80',
      appliedAt: '1 week ago',
      matchScore: 75,
      isAutoApplied: false,
      status: 'INTERVIEW',
      recruiterNotes: 'Technical round 1 scheduled via Google Meet.',
      slug: 'junior-cloud-devops-trainee-google',
    },
  ]);

  const handleWithdraw = (id: string) => {
    if (confirm('Are you sure you want to withdraw this application?')) {
      setApplications(applications.filter((a) => a.id !== id));
    }
  };

  const filtered = applications.filter((app) => {
    if (filterStatus === 'ALL') return true;
    return app.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SHORTLISTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Shortlisted</span>;
      case 'INTERVIEW':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Interview Scheduled</span>;
      case 'VIEWED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">Viewed by Recruiter</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Applied</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Application Pipeline Tracker</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track real-time progress for all your manual and user-controlled auto-applications.
          </p>
        </div>
        <Link
          href="/auto-apply"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 self-start sm:self-auto"
        >
          Configure Auto-Apply Rules
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold border-b border-slate-200">
        {['ALL', 'APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap ${filterStatus === st ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {st === 'ALL' ? 'All Applications' : st}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft hover:border-teal-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <img src={app.companyLogo} alt={app.company} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-slate-700 text-xs">{app.company}</span>
                    {app.isAutoApplied && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-coral-100 text-coral-700 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Auto-Applied
                      </span>
                    )}
                    {getStatusBadge(app.status)}
                  </div>

                  <Link href={`/jobs/${app.slug}`} className="font-extrabold text-slate-900 text-sm sm:text-base hover:text-teal-700">
                    {app.title}
                  </Link>

                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Applied {app.appliedAt}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{app.matchScore}% Skill Match</span>
                  </p>

                  {app.recruiterNotes && (
                    <p className="text-xs text-teal-800 bg-teal-50 p-2 rounded-lg mt-2 font-medium max-w-xl">
                      <strong>Recruiter Update:</strong> {app.recruiterNotes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleWithdraw(app.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-coral-600 hover:bg-coral-50"
                  title="Withdraw application"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link
                  href={`/jobs/${app.slug}`}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800"
                >
                  View Job
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-sm font-bold text-slate-800 mb-1">No applications in this category.</p>
            <p className="text-xs text-slate-500 mb-4">Explore verified openings or enable user-controlled auto-apply.</p>
            <Link href="/jobs" className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white">
              Browse Fresher Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
