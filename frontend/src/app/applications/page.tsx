'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Briefcase, CheckCircle2, Clock, Sparkles, AlertCircle, ArrowRight, Trash2, Search, ExternalLink } from 'lucide-react';
import { useUser } from '../../lib/user-store';

export default function ApplicationsTrackerPage() {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const { applications, withdrawApplication, isLoaded } = useUser();

  const handleWithdraw = (id: string, title: string) => {
    if (confirm(`Are you sure you want to withdraw your application for "${title}"?`)) {
      withdrawApplication(id);
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
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">Applied</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Application Pipeline Tracker</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track real-time progress for all your manual and automated fresher applications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/jobs"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-sm"
          >
            Find More Jobs
          </Link>
          <Link
            href="/auto-apply"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200"
          >
            Auto-Apply Rules
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold border-b border-slate-200">
        {['ALL', 'APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors ${
              filterStatus === st ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st === 'ALL' ? `All (${applications.length})` : st}
          </button>
        ))}
      </div>

      {/* Applications List or Clean Empty State */}
      {!isLoaded ? (
        <div className="p-12 text-center text-slate-400">Loading your applications...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-soft text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">No Applications Found</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {filterStatus === 'ALL'
                ? 'You have not submitted any job applications yet. Browse verified jobs curated for 0-2 years experience, check your skill match score, and apply with 1 click.'
                : `No applications currently marked with status "${filterStatus}".`}
            </p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-soft transition-all"
          >
            <Search className="w-4 h-4" />
            Explore Verified Fresher Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-card transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <img
                  src={app.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&auto=format&fit=crop&q=80'}
                  alt={app.company}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Link
                      href={`/jobs/${app.slug}`}
                      className="font-extrabold text-slate-900 text-base hover:text-teal-700 transition-colors flex items-center gap-1.5"
                    >
                      {app.title}
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 inline" />
                    </Link>
                  </div>
                  <p className="text-xs font-bold text-slate-600 mb-2">{app.company}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Applied {app.appliedAt}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-teal-700">{app.matchScore}% Skill Match</span>
                    {app.isAutoApplied && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-coral-100 text-coral-800">
                          Auto-Applied
                        </span>
                      </>
                    )}
                  </div>

                  {app.recruiterNotes && (
                    <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong>Recruiter note:</strong> {app.recruiterNotes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                {getStatusBadge(app.status)}
                <button
                  onClick={() => handleWithdraw(app.id, app.title)}
                  className="text-xs text-slate-400 hover:text-coral-600 flex items-center gap-1 transition-colors"
                  title="Withdraw application"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Withdraw
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
