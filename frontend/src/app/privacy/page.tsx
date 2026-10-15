import React from 'react';
import { ShieldCheck, Lock, Heart, Check, Trash2, Mail } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Policy Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-900/10 shadow-card">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-coral-300" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Zero-Ads & Privacy Manifesto</h1>
            <p className="text-xs text-slate-500">Takshvaya Core Ethical Operating Principles</p>
          </div>
        </div>
      </div>

      {/* Zero Ads Manifesto */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600" />
          1. Zero Advertisements & Zero Sponsored Rankings
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Most legacy employment portals clutter the user interface with third-party ad networks, tracking pixels, and pay-to-promote job listings. Takshvaya enforces an absolute zero-ad policy:
        </p>
        <ul className="space-y-2 text-xs text-slate-700">
          <li className="flex items-center gap-2">✓ No Google AdSense, Meta tracking pixels, or third-party ad networks.</li>
          <li className="flex items-center gap-2">✓ No sponsored employer rankings. Job listings are ordered purely by relevance and match score.</li>
          <li className="flex items-center gap-2">✓ Zero marketing popups, affiliate banners, or click-bait notifications.</li>
        </ul>
      </div>

      {/* Data Protection */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-teal-700" />
          2. Data Ownership & IT Act / GDPR Rights
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          We collect only the minimum personal data required to match you with employers (skills, degree, passing year, and uploaded resume). We never sell, rent, or broker candidate data to marketing aggregators.
        </p>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <Trash2 className="w-4 h-4 text-coral-600" />
            Delete My Data & Account
          </h4>
          <p className="text-slate-600 mb-3">
            You can delete your account, uploaded resumes, and application records at any time. All associated records are permanently purged from primary databases and backup storage within 24 hours.
          </p>
          <button className="px-4 py-2 rounded-xl text-xs font-bold bg-coral-50 text-coral-700 border border-coral-200 hover:bg-coral-100">
            Request Permanent Account Deletion
          </button>
        </div>
      </div>

      {/* Responsible Disclosure */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Mail className="w-5 h-5 text-coral-500" />
          3. Responsible Vulnerability Disclosure
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Security researchers can report potential vulnerabilities to our trust engineering team at <code className="text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded">security@takshvaya.com</code>. We practice responsible disclosure and adhere to OWASP ASVS Level 2 standards.
        </p>
      </div>
    </div>
  );
}
