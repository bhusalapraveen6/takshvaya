import { AntiFraudService } from '../modules/anti-fraud/anti-fraud.service';
import { AdminService } from '../modules/admin/admin.service';
import { AuthService } from '../modules/auth/auth.service';
import { JobsService } from '../modules/jobs/jobs.service';
import { DB } from '../database/db';
import { ENV } from '../config/env';

async function runAntiFraudAndAdminTests() {
  console.log('--- STARTING TAKSHVAYA ANTI-FRAUD & ADMIN TEST SUITE ---');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Community Fraud Report & Instant Auto-Quarantine
  // --------------------------------------------------------------------------
  // Create a sample job to report
  const targetJobId = 'job-1';
  const targetJob = DB.jobs.get(targetJobId)!;
  assert(targetJob.status === 'ACTIVE', 'Target job starts in ACTIVE state');

  const reportResult = AntiFraudService.reportJob({
    jobId: targetJobId,
    reporterUserId: 'usr-candidate-1',
    reason: 'ASKS_FOR_MONEY', // High severity!
    comments: 'Recruiter sent an email requesting 2000 INR for interview kit.',
  });

  assert(reportResult.jobQuarantined === true, 'Anti-Fraud Engine: Job asking for money was immediately auto-quarantined');
  assert(targetJob.status === 'FLAGGED', 'Job status changed to FLAGGED');
  assert(targetJob.fraud_risk_score >= 90, 'Job fraud risk score elevated to 95%');

  // Verify that quarantined job no longer appears in public candidate search!
  const publicSearch = JobsService.searchJobs({ q: targetJob.title });
  const appearsInSearch = publicSearch.jobs.some((j) => j.id === targetJobId);
  assert(!appearsInSearch, 'Auto-quarantined job is immediately hidden from public fresher job search');

  // --------------------------------------------------------------------------
  // TEST 2: Admin Gateway Authentication (Dual-Factor OTP)
  // --------------------------------------------------------------------------
  const otpRequest = (await AuthService.requestAdminOTP(
    ENV.ADMIN_EMAIL,
    ENV.ADMIN_PHONE,
    '127.0.0.1',
    'AdminConsole'
  )) as any;

  assert(!!otpRequest.sessionId, 'Admin OTP session dispatched to allowlisted identity');

  const adminSession = await AuthService.verifyAdminOTP(
    otpRequest.sessionId,
    otpRequest._devCodes.emailOTP,
    otpRequest._devCodes.phoneOTP,
    '127.0.0.1',
    'AdminConsole'
  );
  assert(!!adminSession.adminSessionToken, 'Dual OTP verified: Admin session established');

  // --------------------------------------------------------------------------
  // TEST 3: Admin Moderation Queue
  // --------------------------------------------------------------------------
  const queue = AdminService.getModerationQueue();
  assert(queue.flaggedJobs.some((j) => j.id === targetJobId), 'Flagged job appears in Admin Moderation Queue');
  assert(queue.reports.some((r) => r.job_id === targetJobId), 'Community fraud report linked to job in queue');

  // --------------------------------------------------------------------------
  // TEST 4: Admin Moderation Action (Permanent Ban & Blacklist)
  // --------------------------------------------------------------------------
  const banAction = AdminService.takeJobAction(
    adminSession.admin.email,
    targetJobId,
    'PERMANENT_BAN',
    '127.0.0.1',
    'AdminConsole',
    'Confirmed scam attempt reported by candidate'
  );

  assert(banAction.jobStatus === 'REJECTED', 'Admin action: Job permanently marked as REJECTED');
  const targetCompany = DB.companies.get(targetJob.company_id)!;
  assert(targetCompany.trust_score === 0, 'Fraudulent employer trust score zeroed');
  assert(DB.blacklistedIdentifiers.has(targetCompany.domain.toLowerCase()), 'Fraudulent employer domain permanently blacklisted');

  // --------------------------------------------------------------------------
  // TEST 5: Immutable Audit Trail Verification
  // --------------------------------------------------------------------------
  const auditLogs = AdminService.getAuditLogs();
  const banLog = auditLogs.find((l) => l.action === 'ADMIN_JOB_BANNED');
  assert(!!banLog, 'Immutable audit trail recorded administrative ban action');
  assert(banLog?.admin_email === ENV.ADMIN_EMAIL, 'Audit log records exact administrator email identity');

  // --------------------------------------------------------------------------
  // TEST 6: Platform Analytics & Zero Ads Verification
  // --------------------------------------------------------------------------
  const analytics = AdminService.getDashboardAnalytics();
  assert(analytics.zeroAdsEnforced === true, 'Platform Zero-Ads Policy strictly verified');
  assert(analytics.totalJobs > 0 && analytics.totalUsers > 0, 'Analytics tracking platform metrics');

  console.log('\n---------------------------------------------------');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('---------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAntiFraudAndAdminTests();
