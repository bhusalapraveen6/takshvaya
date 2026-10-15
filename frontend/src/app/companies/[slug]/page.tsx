'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Building2, Globe, MapPin, Users, Award, Star, CheckCircle, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { TrustBadge } from '../../../components/TrustBadge';

export default function CompanyDetailPage() {
  const params = useParams();

  const company = {
    name: 'Razorpay',
    slug: 'razorpay',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
    website: 'https://razorpay.com',
    industry: 'FinTech / Payments Infrastructure',
    companySize: '1000+ Employees',
    founded: 2014,
    headquarters: 'Bengaluru, Karnataka',
    gstOrCin: 'U72200KA2013PTC097389 (Verified)',
    trustScore: 98,
    isVerified: true,
    ratingOverall: 4.4,
    reviewCount: 189,
    categoryRatings: {
      workCulture: 4.5,
      salary: 4.7,
      growth: 4.6,
      workLifeBalance: 4.1,
      fresherFriendliness: 4.8,
    },
    about: 'Razorpay is India’s leading full-stack financial solutions company powering business payments, payroll, and neo-banking for over 10 million merchants. Known for its developer-first culture and high-velocity engineering teams.',
    hiringProcess: [
      'Resume Shortlist & Skill Verification',
      'Online Coding Challenge (LeetCode Medium)',
      'Live Machine Coding Round (Clean Architecture)',
      'System Fundamentals & Problem Solving',
      'HR & Culture Fit Discussion',
    ],
    reviews: [
      {
        author: 'Junior Software Engineer (Joined 2024)',
        rating: 5,
        fresherFriendly: 'Extremely supportive for freshers',
        pros: 'Strong engineering mentorship, high-impact payment projects, competitive fresher compensation.',
        cons: 'Fast-paced environment during Diwali peak transaction periods.',
        interviewTip: 'Focus on clean modular code and SOLID principles during the machine coding round.',
      },
    ],
    openJobs: [
      {
        id: 'job-1',
        title: 'Associate Software Engineer - Frontend (React / TypeScript)',
        slug: 'associate-software-engineer-frontend-razorpay',
        salary: '₹8,00,000 - ₹14,00,000',
        location: 'Bengaluru (Hybrid)',
        badge: 'VERIFIED_COMPANY' as const,
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Company Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-900/10 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <img src={company.logo} alt={company.name} className="w-20 h-20 rounded-2xl object-cover border border-slate-200" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{company.name}</h1>
                <TrustBadge badge="VERIFIED_COMPANY" />
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {company.headquarters}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> {company.companySize}</span>
                <span>•</span>
                <span className="text-teal-700 font-bold">{company.industry}</span>
              </p>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" /> Official Careers Website
                </a>
                <span className="text-xs font-semibold text-slate-400">GST/CIN: {company.gstOrCin}</span>
              </div>
            </div>
          </div>

          {/* Rating Badge */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-center sm:text-right flex-shrink-0">
            <div className="flex items-center justify-center sm:justify-end gap-1.5 text-amber-500 mb-0.5">
              <Star className="w-5 h-5 fill-current" />
              <span className="text-2xl font-black text-slate-900">{company.ratingOverall}</span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <p className="text-xs text-slate-500 font-semibold">{company.reviewCount} Verified Fresher Reviews</p>
            <p className="text-[11px] text-teal-800 font-bold mt-1">Trust Score: {company.trustScore}%</p>
          </div>
        </div>

        {/* Category Ratings Breakdown */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold mb-1">Work Culture</p>
            <strong className="text-sm font-black text-slate-800">{company.categoryRatings.workCulture} ★</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold mb-1">Salary & Perks</p>
            <strong className="text-sm font-black text-slate-800">{company.categoryRatings.salary} ★</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold mb-1">Career Growth</p>
            <strong className="text-sm font-black text-slate-800">{company.categoryRatings.growth} ★</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold mb-1">Work-Life Balance</p>
            <strong className="text-sm font-black text-slate-800">{company.categoryRatings.workLifeBalance} ★</strong>
          </div>
          <div className="p-3 rounded-xl bg-coral-50 border border-coral-200 col-span-2 sm:col-span-1">
            <p className="text-xs text-coral-800 font-semibold mb-1">Fresher Friendliness</p>
            <strong className="text-sm font-black text-coral-600">{company.categoryRatings.fresherFriendliness} ★</strong>
          </div>
        </div>
      </div>

      {/* About & Hiring Process */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-3">About {company.name}</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{company.about}</p>
          </div>

          <div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-3">Fresher Hiring Process Steps</h3>
            <div className="space-y-2">
              {company.hiringProcess.map((step, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-3">Verified Fresher Employee Reviews</h3>
            {company.reviews.map((rev, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{rev.author}</span>
                  <span className="font-bold text-amber-500">{rev.rating} ★</span>
                </div>
                <p className="text-emerald-700 font-semibold">✓ {rev.fresherFriendly}</p>
                <p className="text-slate-700"><strong className="text-slate-900">Pros:</strong> {rev.pros}</p>
                <p className="text-slate-700"><strong className="text-slate-900">Cons:</strong> {rev.cons}</p>
                <p className="text-teal-800 bg-teal-50 p-2.5 rounded-lg font-medium"><strong className="text-teal-950">Interview Advice:</strong> {rev.interviewTip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Open Jobs List */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-900 text-lg">Active Openings at {company.name}</h3>
          {company.openJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Fresher Opening</span>
              <h4 className="font-extrabold text-slate-900 text-sm mt-1">{job.title}</h4>
              <p className="text-xs text-teal-800 font-bold mt-1">{job.salary}</p>
              <p className="text-xs text-slate-500 mt-0.5">{job.location}</p>
              <Link
                href={`/jobs/${job.slug}`}
                className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center gap-1"
              >
                View Job & Skill Match
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
