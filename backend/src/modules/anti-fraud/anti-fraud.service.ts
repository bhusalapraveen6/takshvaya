import crypto from 'crypto';
import { DB, Job } from '../../database/db';

export interface FraudReportInput {
  jobId: string;
  reporterUserId: string;
  reason:
    | 'ASKS_FOR_MONEY'
    | 'UNREALISTIC_SALARY'
    | 'PERSONAL_EMAIL_CONTACT'
    | 'WHATSAPP_OR_TELEGRAM_ONLY'
    | 'DUPLICATE_OR_SPAM'
    | 'MISLEADING_DESCRIPTION'
    | 'EXPIRED_OR_INACTIVE'
    | 'OTHER';
  comments?: string;
}

export interface FresherSafetyTip {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'ADVICE';
}

export const FRESHER_SAFETY_TIPS: FresherSafetyTip[] = [
  {
    id: 'tip-1',
    title: 'Never Pay Any Money For Jobs',
    description: 'Genuine employers NEVER ask candidates for registration fees, laptop security deposits, or paid training. Any such request is 100% fraudulent.',
    severity: 'CRITICAL',
  },
  {
    id: 'tip-2',
    title: 'Verify Official Corporate Domains',
    description: 'Official recruiters only email from verified corporate domains (e.g., @tcs.com, @google.com). Beware of recruiters using @gmail.com or @yahoo.com.',
    severity: 'WARNING',
  },
  {
    id: 'tip-3',
    title: 'Avoid WhatsApp / Telegram Only Interviews',
    description: 'Legitimate hiring processes take place via verified video conferencing (Google Meet, MS Teams, Zoom) or official company ATS portals, never Telegram groups.',
    severity: 'WARNING',
  },
  {
    id: 'tip-4',
    title: 'Report Suspicious Activity',
    description: 'Click "Report this job" on any suspicious listing. Jobs with money demands are auto-quarantined immediately by our anti-fraud engine.',
    severity: 'ADVICE',
  },
];

export class AntiFraudService {
  // Submit community fraud report
  static reportJob(input: FraudReportInput): { reportId: string; jobQuarantined: boolean } {
    const job = DB.jobs.get(input.jobId);
    if (!job) {
      throw new Error('Job opening not found.');
    }

    const report = {
      id: `rep-${crypto.randomUUID().slice(0, 8)}`,
      job_id: input.jobId,
      reporter_user_id: input.reporterUserId,
      reason: input.reason,
      comments: input.comments || '',
      created_at: new Date().toISOString(),
      is_resolved: false,
    };

    DB.fraudReports.push(report);

    // Count reports for this job
    const jobReports = DB.fraudReports.filter((r) => r.job_id === input.jobId);
    let jobQuarantined = false;

    // IMMEDIATE AUTO-QUARANTINE RULE:
    // If reason is ASKS_FOR_MONEY or >= 2 reports submitted, auto-hide job immediately!
    if (input.reason === 'ASKS_FOR_MONEY' || jobReports.length >= 2) {
      job.status = 'FLAGGED';
      job.fraud_check_passed = false;
      job.fraud_risk_score = 95;
      job.fraud_check_notes = `Auto-quarantined: Received ${jobReports.length} report(s). Reason: ${input.reason}. Awaiting administrative review.`;
      jobQuarantined = true;

      console.warn(`[ANTI-FRAUD ENGINE] Job "${job.title}" (${job.id}) auto-quarantined due to report: ${input.reason}`);
    }

    return { reportId: report.id, jobQuarantined };
  }

  // Check if identifier is blacklisted
  static isBlacklisted(identifier: string): boolean {
    return DB.blacklistedIdentifiers.has(identifier.toLowerCase().trim());
  }

  // Get safety banner tips
  static getSafetyTips(): FresherSafetyTip[] {
    return FRESHER_SAFETY_TIPS;
  }
}
