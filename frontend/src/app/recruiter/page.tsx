'use client';

import React, { useState } from 'react';
import { Building2, Award, Briefcase, Plus, Users, ShieldCheck, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { TrustBadge } from '../../components/TrustBadge';

export default function RecruiterPortalPage() {
  const [activeTab, setActiveTab] = useState<'POST_JOB' | 'APPLICANTS'>('POST_JOB');
  const [jobTitle, setJobTitle] = useState('Junior Fullstack Engineer (Next.js / Python)');
  const [roleCategory, setRoleCategory] = useState('Software Engineer');
  const [description, setDescription] = useState('We are seeking early-career graduates with good problem-solving fundamentals to work on cloud services and frontend user interfaces.');
  const [salaryMin, setSalaryMin] = useState(700000);
  const [salaryMax, setSalaryMax] = useState(1200000);
  const [postError, setPostError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState(false);

  const [applicants, setApplicants] = useState([
    {
      id: 'app-1',
      name: 'Aditya Sharma',
      email: 'fresher.demo@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&auto=format&fit=crop&q=80',
      degree: 'B.Tech CS (2024)',
      cgpa: '8.4 CGPA',
      matchScore: 88,
      status: 'SHORTLISTED',
      appliedAt: 'Yesterday',
    },
    {
      id: 'app-2',
      name: 'Pooja Nair',
      email: 'pooja.nair@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&auto=format&fit=crop&q=80',
      degree: 'B.Tech IT (2024)',
      cgpa: '8.1 CGPA',
      matchScore: 82,
      status: 'APPLIED',
      appliedAt: '2 days ago',
    },
    {
      id: 'app-3',
      name: 'Rohan Gupta',
      email: 'rohan.gupta@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&auto=format&fit=crop&q=80',
      degree: 'BCA (2023)',
      cgpa: '7.8 CGPA',
      matchScore: 74,
      status: 'APPLIED',
      appliedAt: '3 days ago',
    },
  ]);

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    setPostError(null);
    setPostSuccess(false);

    // Client-side anti-fraud check for demo
    const scamRegex = /registration\s*fee|security\s*deposit|pay\s*before|whatsapp\s*only/i;
    if (scamRegex.test(description)) {
      setPostError('Anti-Fraud Alert: Jobs demanding registration fees or deposits are strictly rejected.');
      return;
    }

    if (salaryMax < salaryMin || salaryMin <= 0) {
      setPostError('Mandatory Salary Range Error: A valid minimum and maximum INR salary bracket is required.');
      return;
    }

    setPostSuccess(true);
  };

  const advanceApplicant = (id: string, nextStatus: string) => {
    setApplicants(
      applicants.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Recruiter Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-900/10 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center">
            <Building2 className="w-7 h-7 text-coral-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-slate-900">CRED Recruiter Portal</h1>
              <TrustBadge badge="VERIFIED_RECRUITER" />
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              Official Corporate Domain: <strong className="text-teal-800">kunal@cred.club</strong> • GSTIN29AAACR1234F1Z5
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('POST_JOB')}
            className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'POST_JOB' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Post a Job
          </button>
          <button
            onClick={() => setActiveTab('APPLICANTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'APPLICANTS' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Applicant Pipeline ({applicants.length})
          </button>
        </div>
      </div>

      {activeTab === 'POST_JOB' ? (
        /* Post a Job Form */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-900/10 shadow-card space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900">Post a Verified Fresher Position</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Positions must be 0–2 years experience only. Real INR compensation brackets are strictly required.
            </p>
          </div>

          {postError && (
            <div className="p-4 rounded-xl bg-coral-50 border border-coral-200 text-xs text-coral-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-coral-600 mt-0.5 flex-shrink-0" />
              <span>{postError}</span>
            </div>
          )}

          {postSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Job opening published successfully with Verified Recruiter trust badge!</span>
            </div>
          )}

          <form onSubmit={handlePostJob} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Category *</label>
                <select
                  value={roleCategory}
                  onChange={(e) => setRoleCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700"
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Core Engineering">Core Engineering</option>
                  <option value="Design">UI/UX Design</option>
                  <option value="Marketing">Growth Marketing</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fresher Experience Limit *</label>
                <input
                  type="text"
                  value="0 - 1 Year (Fresher)"
                  disabled
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Mandatory Salary Range */}
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-3">
              <p className="font-bold text-teal-950">Mandatory Annual Compensation Range (INR) *</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1">Minimum Base Salary (₹)</label>
                  <input
                    type="number"
                    value={salaryMin}
                    step="50000"
                    onChange={(e) => setSalaryMin(parseInt(e.target.value, 10))}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Maximum Base Salary (₹)</label>
                  <input
                    type="number"
                    value={salaryMax}
                    step="50000"
                    onChange={(e) => setSalaryMax(parseInt(e.target.value, 10))}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Job Description & Responsibilities *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-sm"
            >
              Publish Verified Job Opening
            </button>
          </form>
        </div>
      ) : (
        /* Applicant Pipeline ATS */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-900/10 shadow-card space-y-4">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Applicant ATS Pipeline</h2>
              <p className="text-xs text-slate-500">Candidates are automatically ranked by their skill match score (%).</p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl">
              {applicants.length} Candidates Screened
            </span>
          </div>

          <div className="space-y-3">
            {applicants.map((cand) => (
              <div
                key={cand.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img src={cand.avatar} alt={cand.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm">{cand.name}</h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {cand.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">{cand.degree} • {cand.cgpa} • Applied {cand.appliedAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg font-bold bg-white border border-slate-200 text-slate-700">
                    Stage: {cand.status}
                  </span>
                  {cand.status === 'APPLIED' && (
                    <button
                      onClick={() => advanceApplicant(cand.id, 'SHORTLISTED')}
                      className="px-3 py-1.5 rounded-lg bg-teal-700 text-white font-bold hover:bg-teal-800"
                    >
                      Shortlist
                    </button>
                  )}
                  {cand.status === 'SHORTLISTED' && (
                    <button
                      onClick={() => advanceApplicant(cand.id, 'INTERVIEW')}
                      className="px-3 py-1.5 rounded-lg bg-purple-700 text-white font-bold hover:bg-purple-800"
                    >
                      Schedule Interview
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
