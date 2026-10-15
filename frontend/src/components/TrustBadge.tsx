import React from 'react';
import { ShieldCheck, Award, CheckCircle } from 'lucide-react';
import { TrustBadge as TrustBadgeType } from '../lib/types';

interface TrustBadgeProps {
  badge: TrustBadgeType;
  showText?: boolean;
}

export function TrustBadge({ badge, showText = true }: TrustBadgeProps) {
  if (badge === 'VERIFIED_COMPANY') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold badge-verified-company" title="Official GST/CIN & Corporate Domain Verified Employer">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        {showText && <span>Verified Company</span>}
      </span>
    );
  }

  if (badge === 'VERIFIED_RECRUITER') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold badge-verified-recruiter" title="Official Corporate Email & Phone OTP Verified Recruiter">
        <Award className="w-3.5 h-3.5 text-sky-600" />
        {showText && <span>Verified Recruiter</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold badge-source-verified" title="Ingested directly from official government or corporate career portal">
      <CheckCircle className="w-3.5 h-3.5 text-purple-600" />
      {showText && <span>Source Verified</span>}
    </span>
  );
}
