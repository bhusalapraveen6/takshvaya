'use client';

import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, User, Mail, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';
import { useUser } from '../lib/user-store';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login } = useUser();
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [role, setRole] = useState<'JOB_SEEKER' | 'RECRUITER'>('JOB_SEEKER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (authMode === 'SIGNUP' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const userName = name.trim() || email.split('@')[0];
    login({
      name: userName,
      email: email.trim(),
      role: role,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`,
    });

    closeAuthModal();
  };

  const handleGoogleAuth = () => {
    // Open prompt or create verified Google session for the user
    const inputName = prompt('Enter your name for Google sign-in (or leave blank to use your Google Account):');
    const inputEmail = prompt('Enter your Google email:');
    
    const userName = inputName?.trim() || 'Verified Candidate';
    const userEmail = inputEmail?.trim() || 'candidate.verified@gmail.com';

    login({
      name: userName,
      email: userEmail,
      role: role,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`,
    });

    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-teal-900/10 overflow-hidden relative">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-600 p-6 text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-coral-300" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">Takshvaya</span>
          </div>
          <h2 className="text-xl font-bold">
            {authMode === 'LOGIN' ? 'Welcome Back!' : 'Create Your Free Account'}
          </h2>
          <p className="text-xs text-teal-100 mt-1">
            0-2 years verified fresher platform with zero spam and direct hiring.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-coral-50 border border-coral-200 text-xs text-coral-800 font-medium">
              {error}
            </div>
          )}

          {/* Google 1-Click Login */}
          <button
            onClick={handleGoogleAuth}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-3 shadow-sm transition-all hover:border-slate-400"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-4 h-4"
            />
            Continue with Google
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider relative">
              Or with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4 text-xs">
            {/* Role Selector */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">I am a:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('JOB_SEEKER')}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                    role === 'JOB_SEEKER'
                      ? 'border-teal-700 bg-teal-50 text-teal-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Fresher / Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setRole('RECRUITER')}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                    role === 'RECRUITER'
                      ? 'border-teal-700 bg-teal-50 text-teal-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Recruiter / HR
                </button>
              </div>
            </div>

            {authMode === 'SIGNUP' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Patel"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {role === 'RECRUITER' ? 'Official Corporate Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'RECRUITER' ? 'name@company.com' : 'you@example.com'}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-soft flex items-center justify-center gap-2 transition-all mt-2"
            >
              <span>{authMode === 'LOGIN' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle between login and signup */}
          <div className="text-center pt-2 border-t border-slate-100">
            {authMode === 'LOGIN' ? (
              <p className="text-xs text-slate-500">
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('SIGNUP')}
                  className="text-teal-700 font-bold hover:underline"
                >
                  Sign up free
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('LOGIN')}
                  className="text-teal-700 font-bold hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
