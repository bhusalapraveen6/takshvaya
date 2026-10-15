import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Sparkles, Check, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      {/* Zero-Ads Manifesto Strip */}
      <div className="bg-teal-950/80 border-b border-teal-800/40 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-800/80 flex items-center justify-center text-teal-300">
              <ShieldCheck className="w-5 h-5 text-coral-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">The Takshvaya Fresher Guarantee</h4>
              <p className="text-xs text-teal-200">100% Free for Job Seekers. Zero Ads. Zero Sponsored Spam. Zero Fee-Demanding Scams.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-teal-300">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-coral-400" /> No Third-Party Trackers</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-coral-400" /> Verified Corporate Domains Only</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-coral-400" /> Real INR Salary Brackets</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-coral-300" />
              </div>
              <span className="font-extrabold text-xl text-white">Takshvaya</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4 max-w-sm">
              Takshvaya (तक्ष्वया) is an early-career employment gateway built to protect young graduates from recruitment extortion, spam postings, and unverified companies.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>OWASP ASVS Level 2 Zero-Trust Protected</span>
            </div>
          </div>

          {/* Role Roadmaps */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Role Roadmaps</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/jobs/role/software-engineer" className="hover:text-coral-400">Software Engineer</Link></li>
              <li><Link href="/jobs/role/data-analyst" className="hover:text-coral-400">Data Analyst</Link></li>
              <li><Link href="/jobs/role/core-engineering" className="hover:text-coral-400">Core Mechanical Trainee</Link></li>
              <li><Link href="/jobs/role/digital-marketing" className="hover:text-coral-400">Growth & Marketing</Link></li>
              <li><Link href="/jobs/role/government" className="hover:text-coral-400">Government (ISRO)</Link></li>
            </ul>
          </div>

          {/* Fresher Tools */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Candidate Tools</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/profile" className="hover:text-coral-400">Resume PDF Parser</Link></li>
              <li><Link href="/jobs" className="hover:text-coral-400">Skill Gap Matcher</Link></li>
              <li><Link href="/applications" className="hover:text-coral-400">Application Tracker</Link></li>
              <li><Link href="/auto-apply" className="hover:text-coral-400">Controlled Auto-Apply</Link></li>
              <li><Link href="/companies/razorpay" className="hover:text-coral-400">Verified Companies</Link></li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Trust & Security</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/privacy" className="hover:text-coral-400">Zero-Ads & Data Policy</Link></li>
              <li><Link href="/privacy" className="hover:text-coral-400">Anti-Scam Defense</Link></li>
              <li><Link href="/recruiter" className="hover:text-coral-400">Recruiter Domain Vetting</Link></li>
              <li><Link href="/admin/gateway" className="hover:text-coral-400">Dual-OTP Admin Gate</Link></li>
              <li><span className="text-slate-500">security.txt (Verified)</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 Takshvaya. Dedicated to empowering India’s young graduates with verified careers.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-coral-500 fill-coral-500" /> for Freshers (0-2 Yrs)
          </p>
        </div>
      </div>
    </footer>
  );
}
