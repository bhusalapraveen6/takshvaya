'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModal({ jobId, jobTitle, isOpen, onClose }: ReportModalProps) {
  const [reason, setReason] = useState<string>('ASKS_FOR_MONEY');
  const [comments, setComments] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // POST to backend anti-fraud reporting endpoint
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      await fetch(`${API_BASE}/anti-fraud/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jobId,
          reason,
          comments,
        }),
      });
    } catch {
      // Fallback simulation
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-coral-600" />
            <h4 className="font-extrabold text-slate-800 text-base">Report Suspicious Job</h4>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h5 className="font-bold text-slate-800 text-base mb-1">Report Received</h5>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Thank you for protecting fellow freshers. If this posting asks for money, our automated anti-fraud engine will immediately quarantine it pending moderator inspection.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Job Opening:</p>
              <p className="text-xs font-bold text-slate-800 truncate">{jobTitle}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Report *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-coral-500 focus:outline-none"
                required
              >
                <option value="ASKS_FOR_MONEY">🚨 Asking for Money / Registration Fee (Critical)</option>
                <option value="WHATSAPP_OR_TELEGRAM_ONLY">📱 Directing only to WhatsApp or Telegram</option>
                <option value="PERSONAL_EMAIL_CONTACT">✉️ Recruiter uses personal email (Gmail/Yahoo)</option>
                <option value="UNREALISTIC_SALARY">💸 Unrealistic salary for fresher / Daily pay scam</option>
                <option value="MISLEADING_DESCRIPTION">⚠️ Vague or deceptive job description</option>
                <option value="EXPIRED_OR_INACTIVE">⏳ Job opening already filled / expired</option>
                <option value="OTHER">Other Reason</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Additional Details / Context</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Describe what occurred (e.g. recruiter asked for security deposit via email)..."
                rows={3}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-coral-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-coral-600 hover:bg-coral-700 text-white disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
