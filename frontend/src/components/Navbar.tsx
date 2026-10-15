'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Briefcase, Compass, Building2, UserCheck, Shield, ChevronDown, LogIn, Menu, X, CheckCircle2 } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Demo candidate logged in by default
  const [userRole, setUserRole] = useState<'JOB_SEEKER' | 'RECRUITER'>('JOB_SEEKER');

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-teal-900/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-coral-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-teal-800">
                  Takshvaya
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-coral-100 text-coral-700 uppercase tracking-wider">
                  0-2 Yrs Only
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                The Verified Fresher Career Portal
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/jobs"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50 flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4 text-teal-600" />
              Fresher Jobs
            </Link>
            <Link
              href="/jobs/role/software-engineer"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50 flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-coral-500" />
              Role Roadmaps
            </Link>
            <Link
              href="/companies/razorpay"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50 flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4 text-teal-600" />
              Verified Companies
            </Link>
            <Link
              href="/profile"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50 flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Skill Match
            </Link>
            <Link
              href="/applications"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50"
            >
              Application Tracker
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Recruiter Switch */}
            <Link
              href="/recruiter"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/60"
            >
              For Recruiters
            </Link>

            {/* Google Login Simulation */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100"
                  title="Signed in via Google"
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&auto=format&fit=crop&q=80"
                    alt="Aditya Sharma"
                    className="w-8 h-8 rounded-full object-cover border-2 border-teal-600"
                  />
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight">Aditya Sharma</p>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Google Verified
                    </p>
                  </div>
                </Link>
              </div>
            ) : (
              <button
                onClick={() => setIsLoggedIn(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 flex items-center gap-2 shadow-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                Sign In with Google
              </button>
            )}

            {/* Hidden Admin Gateway Link (Dual OTP) */}
            <Link
              href="/admin/gateway"
              className="p-2 rounded-lg text-slate-400 hover:text-coral-500 hover:bg-coral-50"
              title="Admin Dual-OTP Gateway"
            >
              <Shield className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/admin/gateway"
              className="p-1.5 text-slate-400 hover:text-coral-500"
              title="Admin Gateway"
            >
              <Shield className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 py-3 space-y-1">
            <Link
              href="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-slate-700 hover:bg-teal-50"
            >
              Fresher Jobs (0-2 Yrs)
            </Link>
            <Link
              href="/jobs/role/software-engineer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-slate-700 hover:bg-teal-50"
            >
              Role Career Roadmaps
            </Link>
            <Link
              href="/companies/razorpay"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-slate-700 hover:bg-teal-50"
            >
              Verified Companies
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-slate-700 hover:bg-teal-50"
            >
              Skill Match & Resume
            </Link>
            <Link
              href="/applications"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-slate-700 hover:bg-teal-50"
            >
              Application Tracker
            </Link>
            <Link
              href="/recruiter"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-teal-800 bg-teal-50"
            >
              Recruiter & HR Portal
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
