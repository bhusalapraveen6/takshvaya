'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, BookOpen, Clock, Sparkles, ChevronRight, X, ExternalLink } from 'lucide-react';
import { SkillMatchAnalysis, SkillRoadmapItem } from '../lib/types';

interface SkillMatchWidgetProps {
  analysis: SkillMatchAnalysis;
}

export function SkillMatchWidget({ analysis }: SkillMatchWidgetProps) {
  const [selectedRoadmap, setSelectedRoadmap] = useState<SkillRoadmapItem | null>(null);

  // Score color badge
  const scoreColor =
    analysis.matchScore >= 80
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : analysis.matchScore >= 55
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-coral-700 bg-coral-50 border-coral-200';

  return (
    <div className="bg-white rounded-2xl p-6 border border-teal-900/10 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-coral-500" />
            <h3 className="font-extrabold text-slate-800 text-lg">Fresher Skill Match & Gap Analysis</h3>
          </div>
          <p className="text-xs text-slate-500">
            Real-time comparison between your profile and this job&apos;s verified requirements.
          </p>
        </div>

        {/* Circular Match Score Display */}
        <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-3 ${scoreColor}`}>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Skill Match</p>
            <p className="text-2xl font-black">{analysis.matchScore}%</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-white/80 shadow-xs">
            {analysis.readinessVerdict === 'HIGHLY_RECOMMENDED'
              ? 'Strong Match'
              : analysis.readinessVerdict === 'COMPETITIVE_WITH_GAP'
              ? 'Competitive'
              : 'Upskill First'}
          </span>
        </div>
      </div>

      {/* Academic Eligibility Banner */}
      <div className="my-4">
        {analysis.eligibility.isEligible ? (
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900">Academic Eligibility: ELIGIBLE</p>
              <p className="text-xs text-emerald-700">Your degree, branch, passing year, and CGPA satisfy all requirements.</p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-coral-50/70 border border-coral-200/80 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-coral-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-coral-900">Academic Eligibility: NOT MET</p>
              <ul className="text-xs text-coral-700 list-disc list-inside space-y-0.5 mt-1">
                {analysis.eligibility.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {/* Matched Skills */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
          <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Matched Skills ({analysis.matchedSkills.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.matchedSkills.length > 0 ? (
              analysis.matchedSkills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100/70 text-emerald-800 border border-emerald-200"
                >
                  ✓ {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No direct required skills detected in profile.</span>
            )}
          </div>
        </div>

        {/* Missing Skills (With Roadmap Links) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
          <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-coral-500" />
            Missing Skills & Learning Gap ({analysis.missingSkills.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.missingSkills.length > 0 ? (
              analysis.missingSkills.map((skill, i) => {
                const roadmap = analysis.missingSkillRoadmaps.find(
                  (r) => r.skillName.toLowerCase() === skill.toLowerCase()
                );
                return (
                  <button
                    key={i}
                    onClick={() => roadmap && setSelectedRoadmap(roadmap)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-coral-50 text-coral-800 border border-coral-200 hover:bg-coral-100 flex items-center gap-1 group transition-colors"
                    title="Click to view free learning roadmap"
                  >
                    <span>{skill}</span>
                    <span className="text-[10px] text-coral-600 group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>
                );
              })
            ) : (
              <span className="text-xs text-emerald-600 font-semibold">100% of required skills fulfilled!</span>
            )}
          </div>
        </div>
      </div>

      {/* Missing Skills Roadmap Banner */}
      {analysis.missingSkills.length > 0 && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-teal-900">
                Bridge your gap in ~{analysis.totalEstimatedLearningHours} hours
              </p>
              <p className="text-[11px] text-teal-700">
                We&apos;ve prepared free courses and projects to help you qualify for this job.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedRoadmap(analysis.missingSkillRoadmaps[0])}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 flex items-center gap-1 flex-shrink-0"
          >
            Explore Roadmap
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Free Learning Roadmap Modal */}
      {selectedRoadmap && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Free Fresher Roadmap</span>
                <h4 className="text-xl font-extrabold text-slate-800">{selectedRoadmap.skillName}</h4>
              </div>
              <button
                onClick={() => setSelectedRoadmap(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">{selectedRoadmap.overview}</p>

            {/* Estimated time */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-teal-600" /> ~{selectedRoadmap.estimatedHours} Hours Required</span>
              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-coral-500" /> Difficulty: {selectedRoadmap.difficulty}</span>
            </div>

            {/* Learning steps */}
            <div className="mb-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Step-by-Step Curriculum</h5>
              <ol className="space-y-1.5 list-decimal list-inside text-xs text-slate-700">
                {selectedRoadmap.learningSteps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>

            {/* Free resources */}
            <div className="mb-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">100% Free Verified Resources</h5>
              <div className="space-y-2">
                {selectedRoadmap.freeResources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 flex items-center justify-between text-xs transition-colors group"
                  >
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-teal-800">{res.title}</p>
                      <p className="text-[10px] text-slate-500">Provider: {res.provider} • Free Access</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
                  </a>
                ))}
              </div>
            </div>

            {/* Practice project */}
            <div className="p-3.5 rounded-xl bg-coral-50/60 border border-coral-200/80 mb-5">
              <p className="text-xs font-bold text-coral-950 mb-1">Recommended Portfolio Project:</p>
              <p className="text-xs font-semibold text-coral-800">{selectedRoadmap.practiceProject.title}</p>
              <p className="text-[11px] text-coral-700 mt-0.5">{selectedRoadmap.practiceProject.description}</p>
            </div>

            <button
              onClick={() => setSelectedRoadmap(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white"
            >
              Close Roadmap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
