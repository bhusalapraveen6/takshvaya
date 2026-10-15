'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, FileText, Sparkles, User, GraduationCap, Briefcase, Plus, X } from 'lucide-react';

export default function CandidateProfilePage() {
  const [headline, setHeadline] = useState('Aspiring Frontend Engineer | React & TypeScript Enthusiast');
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science');
  const [institution, setInstitution] = useState('National Institute of Technology');
  const [graduationYear, setGraduationYear] = useState(2024);
  const [cgpa, setCgpa] = useState(8.4);
  const [skills, setSkills] = useState(['React', 'JavaScript', 'TypeScript', 'HTML/CSS', 'Git', 'Tailwind CSS', 'Python', 'SQL']);
  const [newSkill, setNewSkill] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (toRemove: string) => {
    setSkills(skills.filter((s) => s !== toRemove));
  };

  const handleResumeSimulatedUpload = () => {
    setIsParsing(true);
    setParseSuccess(false);

    setTimeout(() => {
      setIsParsing(false);
      setParseSuccess(true);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-900/10 shadow-card flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80"
          alt="Aditya Sharma"
          className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-700"
        />
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900">Aditya Sharma</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Google Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">{headline}</p>
          <p className="text-xs text-slate-400 mt-1">fresher.demo@gmail.com • Batch of 2024</p>
        </div>
      </div>

      {/* Resume Upload & Magic Byte Verification */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-900/10 shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-teal-700" />
          <h3 className="font-extrabold text-slate-900 text-lg">Resume Upload & Anti-Malware Parsing</h3>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Upload your resume in PDF format (max 5 MB). Our engine performs magic byte sniffing, strips malicious macros, and extracts skills automatically.
        </p>

        <div className="border-2 border-dashed border-teal-200 rounded-2xl p-8 text-center bg-teal-50/40 hover:bg-teal-50/70 transition-colors">
          <UploadCloud className="w-12 h-12 text-teal-700 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800 mb-1">Upload Resume (PDF only)</p>
          <p className="text-xs text-slate-500 mb-4">Current file: <strong className="text-teal-900">Aditya_Sharma_Frontend_Resume.pdf</strong> (Magic bytes verified)</p>

          <button
            onClick={handleResumeSimulatedUpload}
            disabled={isParsing}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-sm inline-flex items-center gap-2"
          >
            {isParsing ? 'Verifying Magic Bytes & Parsing...' : 'Re-parse Resume with AI'}
          </button>
        </div>

        {parseSuccess && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Success: Resume magic bytes verified safe (`%PDF-1.4`). Extracted 8 verified technical skills.</span>
          </div>
        )}
      </div>

      {/* Academic Qualifications */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-900/10 shadow-card space-y-5">
        <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-coral-500" />
          Academic Eligibility Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Degree</label>
            <input
              type="text"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Branch / Major</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Institution / College Name</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Passing Year</label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(parseInt(e.target.value, 10))}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">CGPA / %</label>
              <input
                type="number"
                step="0.1"
                value={cgpa}
                onChange={(e) => setCgpa(parseFloat(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Skills Inventory */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-900/10 shadow-card">
        <h3 className="font-extrabold text-slate-900 text-lg mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-700" />
          Technical Skills Inventory
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          These skills are cross-referenced in real-time on every job listing to calculate your Match Score (%).
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold flex items-center gap-1.5"
            >
              {skill}
              <button onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-coral-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 max-w-sm">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            placeholder="Add new skill (e.g. Next.js, Docker)..."
            className="flex-1 p-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-teal-700"
          />
          <button
            onClick={addSkill}
            className="px-3 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold hover:bg-teal-800"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
