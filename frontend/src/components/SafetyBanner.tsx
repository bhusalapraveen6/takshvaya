'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function SafetyBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 text-white px-4 py-2.5 text-xs sm:text-sm border-b border-teal-700/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-coral-500/20 text-coral-400 font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-coral-400" />
          </span>
          <p className="truncate">
            <strong className="text-coral-300">Fresher Safety Rule:</strong> Never pay any registration or training fee. Genuine employers on Takshvaya NEVER ask candidates for money.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/privacy"
            className="hidden sm:inline-flex items-center gap-1 text-teal-200 hover:text-white underline underline-offset-2"
          >
            Zero-Ad & Safety Policy
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-teal-700/50 rounded text-teal-300 hover:text-white"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
