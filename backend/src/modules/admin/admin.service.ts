import crypto from 'crypto';
import { DB, AdminAuditLog } from '../../database/db';

export class AdminService {
  // 1. Dashboard Overview Analytics
  static getDashboardAnalytics() {
    const totalJobs = DB.jobs.size;
    const activeJobs = Array.from(DB.jobs.values()).filter((j) => j.status === 'ACTIVE').length;
    const flaggedJobs = Array.from(DB.jobs.values()).filter((j) => j.status === 'FLAGGED').length;
    const totalApplications = DB.applications.size;
    const autoAppliedCount = Array.from(DB.applications.values()).filter((a) => a.is_auto_applied).length;
    const totalCompanies = DB.companies.size;
    const totalRecruiters = DB.recruiterProfiles.size;
    const totalReports = DB.fraudReports.length;
    const totalUsers = DB.users.size;
    const blacklistedCount = DB.blacklistedIdentifiers.size;

    return {
      totalJobs,
      activeJobs,
      flaggedJobs,
      totalApplications,
      autoAppliedCount,
      totalCompanies,
      totalRecruiters,
      totalReports,
      totalUsers,
      blacklistedCount,
      zeroAdsEnforced: true,
      lastAuditSync: new Date().toISOString(),
    };
  }

  // 2. Moderation Queue (Flagged Jobs & Community Reports)
  static getModerationQueue() {
    const flagged = Array.from(DB.jobs.values()).filter((j) => j.status === 'FLAGGED');
    const reportsWithJob = DB.fraudReports.map((report) => {
      const job = DB.jobs.get(report.job_id);
      const company = job ? DB.companies.get(job.company_id) : undefined;
      return {
        ...report,
        jobTitle: job?.title || 'Unknown',
        companyName: company?.name || 'Unknown',
        companyDomain: company?.domain || 'Unknown',
      };
    });

    return {
      flaggedJobs: flagged,
      reports: reportsWithJob,
    };
  }

  // 3. Take Moderation Action on a Job
  static takeJobAction(
    adminEmail: string,
    jobId: string,
    action: 'APPROVE' | 'PERMANENT_BAN',
    ipAddress: string,
    userAgent: string,
    notes?: string
  ) {
    const job = DB.jobs.get(jobId);
    if (!job) throw new Error('Job not found.');

    const company = DB.companies.get(job.company_id);

    if (action === 'APPROVE') {
      job.status = 'ACTIVE';
      job.fraud_check_passed = true;
      job.fraud_risk_score = 0;
      job.fraud_check_notes = `Approved by administrator (${adminEmail}): ${notes || 'Verified genuine fresher post'}`;
    } else if (action === 'PERMANENT_BAN') {
      job.status = 'REJECTED';
      job.fraud_check_passed = false;
      job.fraud_risk_score = 100;
      job.fraud_check_notes = `Banned by administrator (${adminEmail}): ${notes || 'Confirmed violation of safety policies'}`;

      if (company) {
        company.trust_score = 0;
        company.is_verified = false;
        DB.blacklistedIdentifiers.add(company.domain.toLowerCase());
      }
    }

    // Write immutable record into audit log
    DB.adminAuditLogs.push({
      id: crypto.randomUUID(),
      admin_email: adminEmail,
      action: action === 'APPROVE' ? 'ADMIN_JOB_APPROVED' : 'ADMIN_JOB_BANNED',
      target_entity: 'JOB',
      target_id: jobId,
      ip_address: ipAddress,
      user_agent: userAgent,
      changes_diff: { action, notes, jobTitle: job.title, newStatus: job.status },
      created_at: new Date().toISOString(),
    });

    return { success: true, jobStatus: job.status };
  }

  // 4. Blacklist Manager
  static addToBlacklist(adminEmail: string, identifier: string, reason: string, ipAddress: string, userAgent: string) {
    const cleanId = identifier.toLowerCase().trim();
    DB.blacklistedIdentifiers.add(cleanId);

    DB.adminAuditLogs.push({
      id: crypto.randomUUID(),
      admin_email: adminEmail,
      action: 'ADMIN_BLACKLIST_ADDED',
      target_entity: 'BLACKLIST',
      target_id: cleanId,
      ip_address: ipAddress,
      user_agent: userAgent,
      changes_diff: { identifier: cleanId, reason },
      created_at: new Date().toISOString(),
    });

    return { success: true, identifier: cleanId };
  }

  // 5. Immutable Audit Logs
  static getAuditLogs(): AdminAuditLog[] {
    return [...DB.adminAuditLogs].reverse();
  }
}
