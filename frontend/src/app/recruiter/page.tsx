'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Award,
  Briefcase,
  Plus,
  Users,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Edit2,
  Save,
  UserCheck
} from 'lucide-react';
import { TrustBadge } from '../../components/TrustBadge';
import { useUser } from '../../lib/user-store';

export default function RecruiterPortalPage() {
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState<'POST_JOB' | 'APPLICANTS'>('POST_JOB');
  const [companyName, setCompanyName] = useState('Acme Technologies');
  const [recruiterEmail, setRecruiterEmail] = useState('recruiter@acme.com');
  const [gstin, setGstin] = useState('29AAACA1234F1Z5');
  const [isEditingOrg, setIsEditingOrg] = useState(false);

  // Job form state
  const [jobTitle, setJobTitle] = useState('');
  const [roleCategory, setRoleCategory] = useState('Software Engineer');
  const [description, setDescription] = useState('');
  const [salaryMin, setSalaryMin] = useState(600000);
  const [salaryMax, setSalaryMax] = useState(1000000);
  const [postError, setPostError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState(false);

  // Dynamic applicants list
  const [applicants, setApplicants] = useState<Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    degree: string;
    cgpa: string;
    matchScore: number;
    status: string;
    appliedAt: string;
  }>>([]);

  // Load from user or localStorage
  useEffect(() => {
    if (user && user.role === 'RECRUITER') {
      setRecruiterEmail(user.email);
      setCompanyName(user.name || 'Acme Technologies');
    }

    try {
      const storedApplicants = localStorage.getItem('takshvaya_recruiter_applicants');
      if (storedApplicants) {
        setApplicants(JSON.parse(storedApplicants));
      }
    } catch (e) {
      console.warn(e);
    }
  }, [user]);

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    setPostError(null);
    setPostSuccess(false);

    if (!jobTitle.trim()) {
      setPostError('Please enter a descriptive job title for the fresher opening.');
      return;
    }

    if (!description.trim() || description.length < 20) {
      setPostError('Please provide a comprehensive role description with learning expectations.');
      return;
    }

    // Anti-fraud check
    const scamRegex = /registration\s*fee|security\s*deposit|pay\s*before|whatsapp\s*only/i;
    if (scamRegex.test(description)) {
      setPostError('Anti-Fraud Alert: Jobs demanding registration fees, deposits, or private WhatsApp numbers are strictly prohibited.');
      return;
    }

    if (salaryMax < salaryMin || salaryMin <= 0) {
      setPostError('Mandatory Salary Range Error: A valid minimum and maximum INR salary bracket is required.');
      return;
    }

    // Save posted job locally
    const newPostedJob = {
      id: `job-${Date.now()}`,
      title: jobTitle.trim(),
      company: companyName,
      roleCategory,
      salaryMin,
      salaryMax,
      salaryText: `₹${salaryMin.toLocaleString('en-IN')} - ₹${salaryMax.toLocaleString('en-IN')}`,
      description,
      postedAt: 'Just now',
    };

    try {
      const existing = JSON.parse(localStorage.getItem('takshvaya_posted_jobs') || '[]');
      localStorage.setItem('takshvaya_posted_jobs', JSON.stringify([newPostedJob, ...existing]));
    } catch (err) {
      console.error(err);
    }

    setPostSuccess(true);
    setJobTitle('');
    setDescription('');
  };

  const advanceApplicant = (id: string, nextStatus: string) => {
    const updated = applicants.map((a) => (a.id === id ? { ...a, status: nextStatus } : a));
    setApplicants(updated);
    try {
      localStorage.setItem('takshvaya_recruiter_applicants', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 animate-fade-in">
      {/* Recruiter Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-900/10 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-soft">
            <Building2 className="w-7 h-7 text-coral-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isEditingOrg ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="p-1.5 border border-slate-300 rounded-lg text-lg font-bold"
                  />
                  <button
                    onClick={() => setIsEditingOrg(false)}
                    className="px-2.5 py-1 rounded-lg bg-teal-700 text-white text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-black text-slate-900">{companyName}</h1>
                  <TrustBadge badge="VERIFIED_RECRUITER" />
                  <button
                    onClick={() => setIsEditingOrg(true)}
                    className="text-slate-400 hover:text-teal-700 p-1"
                    title="Edit employer details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              Official Corporate Domain: <strong className="text-teal-800">{recruiterEmail}</strong> • GSTIN: {gstin}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('POST_JOB')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'POST_JOB' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Post a Job
          </button>
          <button
            onClick={() => setActiveTab('APPLICANTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'APPLICANTS' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
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
              Positions must be 0–2 years experience only. Transparent INR compensation brackets are strictly required.
            </p>
          </div>

          {postError && (
            <div className="p-4 rounded-xl bg-coral-50 border border-coral-200 text-xs text-coral-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-coral-600 mt-0.5 flex-shrink-0" />
              <span>{postError}</span>
            </div>
          )}

          {postSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
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
                placeholder="e.g. Junior Fullstack Engineer (React / Node.js) or Graduate Trainee"
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
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700 bg-white"
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Core Engineering">Core Engineering</option>
                  <option value="Design">UI/UX Design</option>
                  <option value="Marketing">Growth Marketing</option>
                  <option value="Government & Public Sector">Government & Public Sector</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fresher Experience Limit *</label>
                <input
                  type="text"
                  value="0 - 2 Years (Fresher Only)"
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
                  <label className="block text-slate-600 mb-1">Minimum Base Salary (₹ / Year)</label>
                  <input
                    type="number"
                    step="50000"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-teal-700 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Maximum Base Salary (₹ / Year)</label>
                  <input
                    type="number"
                    step="50000"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-teal-700 bg-white"
                    required
                  />
                </div>
              </div>
              <p className="text-[11px] text-teal-800">
                Range: ₹{salaryMin.toLocaleString('en-IN')} – ₹{salaryMax.toLocaleString('en-IN')} per annum.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Role Description & Expectations *</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe project responsibilities, technologies used, mentorship provided, and eligibility criteria..."
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-soft flex items-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              Publish Verified Fresher Job
            </button>
          </form>
        </div>
      ) : (
        /* Applicants Pipeline */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-900/10 shadow-card space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Candidate Pipeline & Magic Byte Verified Resumes</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review verified fresher applications with skill-matching scores and anti-tamper validations.
              </p>
            </div>
          </div>

          {applicants.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Users className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800">No candidate applications received yet</p>
              <p className="text-xs max-w-sm mx-auto">
                Once freshers apply to your posted jobs, their verified match scores and magic-byte safe resumes will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((cand) => (
                <div
                  key={cand.id}
                  className="p-5 rounded-2xl border border-slate-200/80 hover:border-teal-300 bg-white shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
                      {cand.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-sm">{cand.name}</p>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {cand.matchScore}% Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {cand.email} • {cand.degree} • {cand.cgpa}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      {cand.status}
                    </span>
                    <button
                      onClick={() => advanceApplicant(cand.id, 'SHORTLISTED')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => advanceApplicant(cand.id, 'INTERVIEW')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    >
                      Invite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
