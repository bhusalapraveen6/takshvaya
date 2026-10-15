'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck, CheckCircle2, AlertCircle, Play, Settings } from 'lucide-react';

export default function AutoApplySettingsPage() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [minMatchScore, setMinMatchScore] = useState(80);
  const [minSalary, setMinSalary] = useState(700000);
  const [dailyLimit, setDailyLimit] = useState(5);
  const [applicationsToday, setApplicationsToday] = useState(1);
  const [preferredRoles, setPreferredRoles] = useState('Software Engineer, Frontend Developer, Data Analyst');
  const [preferredLocations, setPreferredLocations] = useState('Bengaluru, Hyderabad, Remote');
  const [isRunning, setIsRunning] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);

  const handleTestRun = () => {
    setIsRunning(true);
    setRunMessage(null);

    setTimeout(() => {
      setIsRunning(false);
      setApplicationsToday((prev) => Math.min(dailyLimit, prev + 1));
      setRunMessage('Auto-apply matching cycle completed! 1 verified job matching all rules submitted.');
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-900/10 shadow-card">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-coral-500 text-white flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">User-Controlled Auto-Apply</h1>
            <p className="text-xs text-slate-500">You set the rules. We apply only to verified jobs where you match.</p>
          </div>
        </div>

        {/* Master Opt-In Toggle */}
        <div className="mt-6 p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold text-teal-950">Auto-Apply Status</p>
            <p className="text-xs text-teal-700">
              {isEnabled ? 'Active: Automatically submitting when match score threshold is reached' : 'Paused: No applications will be sent'}
            </p>
          </div>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors ${isEnabled ? 'bg-teal-700 text-white hover:bg-teal-800' : 'bg-slate-300 text-slate-700 hover:bg-slate-400'}`}
          >
            {isEnabled ? 'Enabled (Active)' : 'Disabled (Paused)'}
          </button>
        </div>
      </div>

      {/* Rules Configuration */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-900/10 shadow-card space-y-6">
        <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
          <Settings className="w-5 h-5 text-teal-700" />
          Matching Guardrails & Filters
        </h3>

        {/* Min Match Score */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span>Minimum Skill Match Score Threshold</span>
            <span className="text-teal-700 text-sm font-extrabold">{minMatchScore}% Match</span>
          </div>
          <input
            type="range"
            min="60"
            max="95"
            step="5"
            value={minMatchScore}
            onChange={(e) => setMinMatchScore(parseInt(e.target.value, 10))}
            className="w-full accent-teal-700"
          />
          <p className="text-[11px] text-slate-400 mt-1">We will only apply to jobs where your verified skills score at least {minMatchScore}%.</p>
        </div>

        {/* Daily Application Limit */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span>Daily Application Quota Limit</span>
            <span className="text-teal-700 text-sm font-extrabold">{dailyLimit} Applications / Day</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(parseInt(e.target.value, 10))}
            className="w-full accent-teal-700"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Usage today: <strong className="text-slate-700">{applicationsToday} of {dailyLimit}</strong> used. Daily limits prevent spam and protect your applicant reputation.
          </p>
        </div>

        {/* Min Salary Floor */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Compensation Floor (INR / Year)</label>
          <input
            type="number"
            value={minSalary}
            step="50000"
            onChange={(e) => setMinSalary(parseInt(e.target.value, 10))}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700"
          />
          <p className="text-[11px] text-slate-400 mt-1">Jobs below ₹{minSalary.toLocaleString()} will be automatically skipped.</p>
        </div>

        {/* Preferred Roles */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Target Role Titles (Comma separated)</label>
          <input
            type="text"
            value={preferredRoles}
            onChange={(e) => setPreferredRoles(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700"
          />
        </div>

        {/* Preferred Locations */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Target Locations & Modes</label>
          <input
            type="text"
            value={preferredLocations}
            onChange={(e) => setPreferredLocations(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700"
          />
        </div>

        {/* Test Run & Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleTestRun}
            disabled={isRunning || !isEnabled}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-coral-600 hover:bg-coral-700 text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {isRunning ? 'Scanning Opportunities...' : 'Trigger Auto-Apply Scan Now'}
          </button>
          <Link href="/applications" className="text-xs font-bold text-teal-700 hover:underline">
            View Application History Tracker →
          </Link>
        </div>

        {runMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{runMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
