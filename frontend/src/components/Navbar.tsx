'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Briefcase,
  Compass,
  Building2,
  UserCheck,
  Shield,
  ChevronDown,
  LogIn,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  User,
  Zap
} from 'lucide-react';
import { useUser } from '../lib/user-store';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, logout, openAuthModal, isLoaded } = useUser();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-teal-900/10 shadow-sm">
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

            {/* User Auth Section */}
            {!isLoaded ? (
              <div className="w-24 h-8 bg-slate-100 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-teal-600"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {user.role === 'RECRUITER' ? 'Recruiter' : 'Verified'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-900"
                    >
                      <User className="w-4 h-4 text-teal-600" />
                      My Profile & Resume
                    </Link>

                    <Link
                      href="/applications"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-900"
                    >
                      <Briefcase className="w-4 h-4 text-teal-600" />
                      Applications Tracker
                    </Link>

                    <Link
                      href="/auto-apply"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-900"
                    >
                      <Zap className="w-4 h-4 text-coral-500" />
                      Auto-Apply Settings
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-coral-600 hover:bg-coral-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={openAuthModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-teal-700" />
                  Sign In
                </button>
                <button
                  onClick={openAuthModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-sm transition-all"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Admin Gateway Link */}
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
            {!user ? (
              <button
                onClick={openAuthModal}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-700 text-white"
              >
                Sign In
              </button>
            ) : (
              <Link
                href="/profile"
                className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs"
              >
                {user.name.charAt(0).toUpperCase()}
              </Link>
            )}

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
            {user ? (
              <div className="px-3 py-2 bg-teal-50/60 rounded-xl mb-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-coral-600 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="p-2 mb-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full py-2.5 rounded-xl bg-teal-700 text-white text-xs font-bold"
                >
                  Sign In or Create Account
                </button>
              </div>
            )}

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
              href="/auto-apply"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-slate-700 hover:bg-teal-50"
            >
              Auto-Apply Settings
            </Link>
            <Link
              href="/recruiter"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-teal-800 bg-teal-50"
            >
              Recruiter & HR Portal
            </Link>
            <Link
              href="/admin/gateway"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-slate-400 hover:text-coral-600"
            >
              Admin Security Gateway
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
