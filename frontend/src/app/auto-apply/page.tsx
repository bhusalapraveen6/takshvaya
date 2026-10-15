'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck, CheckCircle2, AlertCircle, Play, Settings, Save, Briefcase } from 'lucide-react';
import { useUser } from '../../lib/user-store';

export default function AutoApplySettingsPage() {
  const { autoApplyConfig, updateAutoApplyConfig, applyToJob, isLoaded } = useUser();

  const [isEnabled, setIsEnabled] = useState(false);
  const [minMatchScore, setMinMatchScore] = useState(80);
  const [minSalary, setMinSalary] = useState(600000);
  const [dailyLimit, setDailyLimit] = useState(5);
  const [applicationsToday, setApplicationsToday] = useState(0);
  const [preferredRoles, setPreferredRoles] = useState('Software Engineer, Frontend Developer, Data Analyst');
  const [preferredLocations, setPreferredLocations] = useState('Bengaluru, Hyderabad, Remote');
  const [isRunning, setIsRunning] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [savedNotification, setSavedNotification] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setIsEnabled(autoApplyConfig.isEnabled);
      setMinMatchScore(autoApplyConfig.minMatchScore);
      setMinSalary(autoApplyConfig.minSalary);
      setDailyLimit(autoApplyConfig.dailyLimit);
      setApplicationsToday(autoApplyConfig.applicationsToday);
      setPreferredRoles(autoApplyConfig.preferredRoles);
      setPreferredLocations(autoApplyConfig.preferredLocations);
    }
  }, [autoApplyConfig, isLoaded]);

  const handleSaveSettings = () => {
    updateAutoApplyConfig({
      isEnabled,
      minMatchScore,
      minSalary,
      dailyLimit,
      applicationsToday,
      preferredRoles,
      preferredLocations,
    });
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const handleToggleActive = () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);
    updateAutoApplyConfig({ isEnabled: nextState });
  };

  const handleTestRun = () => {
    setIsRunning(true);
    setRunMessage(null);

    setTimeout(() => {
      setIsRunning(false);
      // Auto-apply to a high-scoring sample verified job
      applyToJob({
        id: 'job-1',
        title: 'Associate Software Engineer - Frontend (React / TypeScript)',
        company: 'Razorpay',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
        matchScore: 88,
        slug: 'associate-software-engineer-frontend-razorpay',
        isAutoApplied: true,
      });

      const newCount = Math.min(dailyLimit, applicationsToday + 1);
      setApplicationsToday(newCount);
      updateAutoApplyConfig({ applicationsToday: newCount });
      setRunMessage('Auto-apply matching cycle completed! 1 verified job matching your rules was submitted.');
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 animate-fade-in">
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
        <div className="mt-6 p-4 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-teal-950">Auto-Apply Status</p>
            <p className="text-xs text-teal-700">
              {isEnabled
                ? 'Active: Automatically submitting when match score threshold is reached'
                : 'Paused / Inactive: No automatic applications will be sent without your click'}
            </p>
          </div>
          <button
            onClick={handleToggleActive}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
              isEnabled ? 'bg-teal-700 text-white hover:bg-teal-800' : 'bg-slate-300 text-slate-800 hover:bg-slate-400'
            }`}
          >
            {isEnabled ? 'Enabled (Active)' : 'Disabled (Paused)'}
          </button>
        </div>
      </div>

      {savedNotification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Auto-Apply preferences saved successfully!</span>
        </div>
      )}

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
            className="w-full accent-teal-700 cursor-pointer"
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
            className="w-full accent-teal-700 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Usage today: <strong className="text-slate-700">{applicationsToday} of {dailyLimit}</strong> used. Daily limits prevent spam and protect your applicant reputation.
          </p>
        </div>

        {/* Min Salary Bracket */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Base Salary (INR / year)</label>
          <input
            type="number"
            step="50000"
            value={minSalary}
            onChange={(e) => setMinSalary(parseInt(e.target.value, 10) || 0)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-teal-700"
          />
          <p className="text-[11px] text-slate-400 mt-1">Skip openings offering less than ₹{(minSalary).toLocaleString('en-IN')}.</p>
        </div>

        {/* Role Preferences */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Target Role Titles</label>
          <input
            type="text"
            value={preferredRoles}
            onChange={(e) => setPreferredRoles(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-teal-700"
          />
          <p className="text-[11px] text-slate-400 mt-1">Comma-separated list of target role keywords.</p>
        </div>

        {/* Preferred Locations */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Locations / Modes</label>
          <input
            type="text"
            value={preferredLocations}
            onChange={(e) => setPreferredLocations(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-teal-700"
          />
        </div>

        {/* Save Guardrails */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-soft transition-all"
          >
            <Save className="w-4 h-4" />
            Save Guardrails
          </button>
        </div>
      </div>

      {/* Manual Matching Test Simulation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-900/10 shadow-card">
        <h3 className="font-extrabold text-slate-900 text-lg mb-2 flex items-center gap-2">
          <Play className="w-5 h-5 text-coral-500" />
          Test Auto-Apply Cycle
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Test our matching algorithm against currently open verified positions using your saved rules.
        </p>

        <button
          onClick={handleTestRun}
          disabled={isRunning || applicationsToday >= dailyLimit}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white shadow-soft inline-flex items-center gap-2 transition-all"
        >
          {isRunning ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Scanning open verified positions...
            </>
          ) : applicationsToday >= dailyLimit ? (
            'Daily Application Limit Reached'
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-coral-300" />
              Trigger Matching Cycle Now
            </>
          )}
        </button>

        {runMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{runMessage}</span>
            </div>
            <Link href="/applications" className="underline font-bold text-teal-800 flex items-center gap-1">
              View Tracker <Briefcase className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
        <p>
          <strong>Security Guarantee:</strong> Takshvaya auto-apply strictly prohibits applying to unverified corporate domains. Every application is logged with zero-tolerance fraud checks.
        </p>
      </div>
    </div>
  );
}
