import http from 'http';

const BASE_URL = 'http://localhost:5000/api/v1';

interface TestResult {
  module: string;
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  notes: string;
}

const auditResults: TestResult[] = [];

function httpRequest(
  method: string,
  path: string,
  body?: any,
  headers?: Record<string, string>
): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    const reqBody = body ? JSON.stringify(body) : undefined;
    if (reqBody) {
      reqHeaders['Content-Length'] = Buffer.byteLength(reqBody).toString();
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed: any;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode || 500, body: parsed, headers: res.headers });
        });
      }
    );

    req.on('error', reject);
    if (reqBody) req.write(reqBody);
    req.end();
  });
}

async function verifyAllFunctions() {
  console.log('========================================================================');
  console.log('🧪 TESTING ALL 36 API FUNCTIONS ACROSS TAKSHVAYA BACKEND');
  console.log('========================================================================\n');

  let candidateAuthHeader = '';
  let candidateUser: any;
  let candidateRefreshToken = '';
  let adminAuthHeader = '';
  let recruiterAuthHeader = '';

  const record = (module: string, method: string, endpoint: string, res: { status: number; body: any }, expectedStatus: number, notes: string) => {
    const success = res.status === expectedStatus;
    auditResults.push({
      module,
      endpoint,
      method,
      status: res.status,
      success,
      notes: success ? notes : `Expected ${expectedStatus}, received ${res.status}: ${JSON.stringify(res.body)}`,
    });
    const mark = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} [${module}] ${method} ${endpoint} (Status: ${res.status}) - ${notes}`);
  };

  // --------------------------------------------------------------------------
  // 1. HEALTH CHECK
  // --------------------------------------------------------------------------
  const healthRes = await httpRequest('GET', '/health');
  record('Health', 'GET', '/health', healthRes, 200, `Platform: ${healthRes.body.platform}`);

  // --------------------------------------------------------------------------
  // 2. AUTHENTICATION MODULE
  // --------------------------------------------------------------------------
  // Google Callback (Candidate)
  const loginRes = await httpRequest('POST', '/auth/google/callback', {
    email: 'live.candidate@university.edu',
    fullName: 'Live Test Candidate',
    googleId: 'google-sub-live-101',
    rolePreference: 'JOB_SEEKER',
  });
  candidateUser = loginRes.body.user;
  const devToken = (loginRes.body as any)._devAccessToken;
  candidateAuthHeader = `Bearer ${devToken}`;
  record('Auth', 'POST', '/auth/google/callback', loginRes, 200, `Authenticated candidate ${candidateUser?.fullName}`);

  // Extract cookies or dev token
  candidateRefreshToken = (loginRes.body as any)._devRefreshToken;
  if (!candidateRefreshToken) {
    const cookies = loginRes.headers['set-cookie'] || [];
    const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
    if (refreshCookie) {
      candidateRefreshToken = decodeURIComponent(refreshCookie.split(';')[0].replace('refreshToken=', ''));
    }
  }

  // Refresh Token
  const refreshRes = await httpRequest('POST', '/auth/refresh', {
    refreshToken: candidateRefreshToken,
  });
  record('Auth', 'POST', '/auth/refresh', refreshRes, 200, 'Rotated access & refresh tokens');

  // /auth/me
  const meRes = await httpRequest('GET', '/auth/me', undefined, { Authorization: candidateAuthHeader });
  record('Auth', 'GET', '/auth/me', meRes, 200, `Fetched profile for user: ${meRes.body.user?.email}`);

  // /auth/sessions
  const sessionsRes = await httpRequest('GET', '/auth/sessions', undefined, { Authorization: candidateAuthHeader });
  record('Auth', 'GET', '/auth/sessions', sessionsRes, 200, `Active sessions count: ${sessionsRes.body.sessions?.length}`);

  // /auth/logout
  const logoutRes = await httpRequest('POST', '/auth/logout', { refreshToken: candidateRefreshToken });
  record('Auth', 'POST', '/auth/logout', logoutRes, 200, 'Logged out single session');

  // /auth/logout-all
  const logoutAllRes = await httpRequest('POST', '/auth/logout-all', undefined, { Authorization: candidateAuthHeader });
  record('Auth', 'POST', '/auth/logout-all', logoutAllRes, 200, 'Logged out from all devices');

  // --------------------------------------------------------------------------
  // 3. ADMIN DUAL-FACTOR AUTH MODULE
  // --------------------------------------------------------------------------
  // Request OTP
  const adminReqOtp = await httpRequest('POST', '/admin-auth/request-otp', {
    email: 'bhusalapraveen6@gmail.com',
    phone: '9640742659',
  });
  const adminSessionId = adminReqOtp.body.sessionId;
  const devAdminCodes = (adminReqOtp.body as any)._devCodes;
  record('AdminAuth', 'POST', '/admin-auth/request-otp', adminReqOtp, 200, `OTP dispatched to allowlisted admin, session: ${adminSessionId}`);

  // Verify OTP
  const adminVerifyRes = await httpRequest('POST', '/admin-auth/verify-otp', {
    sessionId: adminSessionId,
    emailOTP: devAdminCodes?.emailOTP,
    phoneOTP: devAdminCodes?.phoneOTP,
  });
  const adminDevToken = (adminVerifyRes.body as any)._devAdminToken;
  adminAuthHeader = adminDevToken;
  record('AdminAuth', 'POST', '/admin-auth/verify-otp', adminVerifyRes, 200, 'Dual-Factor OTP verified, 30m session created');

  // Admin Status
  const adminStatusRes = await httpRequest('GET', '/admin-auth/status', undefined, { 'X-Admin-Token': adminAuthHeader });
  record('AdminAuth', 'GET', '/admin-auth/status', adminStatusRes, 200, `Admin session active: ${adminStatusRes.body.authenticated}`);

  // Admin Logout
  const adminLogoutRes = await httpRequest('POST', '/admin-auth/logout');
  record('AdminAuth', 'POST', '/admin-auth/logout', adminLogoutRes, 200, 'Admin session terminated');

  // --------------------------------------------------------------------------
  // 4. JOBS MODULE
  // --------------------------------------------------------------------------
  // Search Jobs
  const jobsRes = await httpRequest('GET', '/jobs?q=react&limit=5');
  record('Jobs', 'GET', '/jobs', jobsRes, 200, `Found ${jobsRes.body.total} jobs for query 'react'`);

  // Autocomplete
  const autoRes = await httpRequest('GET', '/jobs/autocomplete?q=soft');
  record('Jobs', 'GET', '/jobs/autocomplete', autoRes, 200, `Suggestions: ${autoRes.body.suggestions?.slice(0, 2).join(', ')}`);

  // Get job by slug
  const sampleSlug = jobsRes.body.jobs[0]?.slug || 'associate-software-engineer-frontend-razorpay';
  const jobDetailRes = await httpRequest('GET', `/jobs/${sampleSlug}`);
  record('Jobs', 'GET', '/jobs/:slug', jobDetailRes, 200, `Fetched job: ${jobDetailRes.body.job?.title}`);

  // Toggle Save Job
  const targetJobId = jobDetailRes.body.job?.id || 'job-1';
  const saveToggleRes = await httpRequest('POST', `/jobs/${targetJobId}/save`, undefined, { Authorization: candidateAuthHeader });
  record('Jobs', 'POST', '/jobs/:id/save', saveToggleRes, 200, `Toggled save status: ${saveToggleRes.body.isSaved}`);

  // Get Saved Jobs
  const savedJobsRes = await httpRequest('GET', '/jobs/saved', undefined, { Authorization: candidateAuthHeader });
  record('Jobs', 'GET', '/jobs/saved', savedJobsRes, 200, `Retrieved ${savedJobsRes.body.count} saved job bookmarks`);

  // Trigger Aggregation
  const aggRes = await httpRequest('POST', '/jobs/trigger-aggregation');
  record('Jobs', 'POST', '/jobs/trigger-aggregation', aggRes, 200, 'Executed legal aggregation feed check');

  // Create Job Alert
  const createAlertRes = await httpRequest('POST', '/jobs/alerts', { role: 'Software Engineer', location: 'Bengaluru', minSalary: 600000 }, { Authorization: candidateAuthHeader });
  record('Jobs', 'POST', '/jobs/alerts', createAlertRes, 200, `Alert created for ${createAlertRes.body.alert?.role}`);

  // List Job Alerts
  const listAlertsRes = await httpRequest('GET', '/jobs/alerts', undefined, { Authorization: candidateAuthHeader });
  record('Jobs', 'GET', '/jobs/alerts', listAlertsRes, 200, `Subscribed alerts count: ${listAlertsRes.body.count}`);

  // --------------------------------------------------------------------------
  // 5. SKILLS & GAP ANALYSIS MODULE
  // --------------------------------------------------------------------------
  // Match Analysis
  const matchRes = await httpRequest('GET', `/skills/match/${targetJobId}`, undefined, { Authorization: candidateAuthHeader });
  record('Skills', 'GET', '/skills/match/:jobId', matchRes, 200, `Match Score: ${matchRes.body.analysis?.matchScore}%, Verdict: ${matchRes.body.analysis?.readinessVerdict}`);

  // Parse Resume Text
  const parseResumeRes = await httpRequest('POST', '/skills/parse-resume', {
    resumeText: 'Aarav Sharma. B.Tech Computer Science graduate from NIT 2024. Skilled in React, TypeScript, Python, Git, HTML, CSS. CGPA: 8.6.',
    filename: 'aarav_resume.pdf',
  }, { Authorization: candidateAuthHeader });
  record('Skills', 'POST', '/skills/parse-resume', parseResumeRes, 200, `Detected skills: ${parseResumeRes.body.parsed?.detectedSkills?.join(', ')}`);

  // Fetch Roadmap for a Skill
  const roadmapRes = await httpRequest('GET', '/skills/roadmaps/TypeScript');
  record('Skills', 'GET', '/skills/roadmaps/:skill', roadmapRes, 200, `Roadmap for TypeScript (~${roadmapRes.body.roadmap?.estimatedHours} hrs)`);

  // Update Profile
  const updateProfRes = await httpRequest('PUT', '/skills/profile', {
    headline: 'Junior Software Engineer & React Enthusiast',
    degree: 'B.Tech',
    branch: 'Computer Science',
    graduation_year: 2024,
    cgpa_or_percentage: 8.6,
    skills: ['React', 'TypeScript', 'Node.js', 'Git'],
  }, { Authorization: candidateAuthHeader });
  record('Skills', 'PUT', '/skills/profile', updateProfRes, 200, 'Candidate profile updated');

  // --------------------------------------------------------------------------
  // 6. AUTO-APPLY ENGINE MODULE
  // --------------------------------------------------------------------------
  // Get Settings
  const autoSettingsRes = await httpRequest('GET', '/auto-apply/settings', undefined, { Authorization: candidateAuthHeader });
  record('AutoApply', 'GET', '/auto-apply/settings', autoSettingsRes, 200, `Quota remaining: ${autoSettingsRes.body.remainingQuota}`);

  // Update Settings
  const updateAutoRes = await httpRequest('PUT', '/auto-apply/settings', {
    is_enabled: true,
    min_match_score: 70,
    daily_application_limit: 3,
  }, { Authorization: candidateAuthHeader });
  record('AutoApply', 'PUT', '/auto-apply/settings', updateAutoRes, 200, `Auto-apply active: ${updateAutoRes.body.settings?.is_enabled}`);

  // Run Auto-Apply
  const runAutoRes = await httpRequest('POST', '/auto-apply/run', undefined, { Authorization: candidateAuthHeader });
  record('AutoApply', 'POST', '/auto-apply/run', runAutoRes, 200, `Auto-apply applied to ${runAutoRes.body.appliedCount} matching jobs`);

  // Manual Apply
  const manualApplyRes = await httpRequest('POST', `/auto-apply/apply/${targetJobId}`, undefined, { Authorization: candidateAuthHeader });
  record('AutoApply', 'POST', '/auto-apply/apply/:jobId', manualApplyRes, 200, 'Manual application submitted');

  // Get Applications Tracker
  const appsRes = await httpRequest('GET', '/auto-apply/applications', undefined, { Authorization: candidateAuthHeader });
  const sampleAppId = appsRes.body.applications[0]?.id;
  record('AutoApply', 'GET', '/auto-apply/applications', appsRes, 200, `Application tracker count: ${appsRes.body.count}`);

  // Withdraw Application
  if (sampleAppId) {
    const withdrawRes = await httpRequest('DELETE', `/auto-apply/applications/${sampleAppId}`, undefined, { Authorization: candidateAuthHeader });
    record('AutoApply', 'DELETE', '/auto-apply/applications/:id', withdrawRes, 200, 'Application withdrawn successfully');
  }

  // --------------------------------------------------------------------------
  // 7. RECRUITER ATS MODULE
  // --------------------------------------------------------------------------
  // Register Recruiter
  const recRegisterLogin = await httpRequest('POST', '/auth/google/callback', {
    email: 'talent@razorpay.com',
    fullName: 'Razorpay Talent Lead',
    googleId: 'google-rec-live-202',
    rolePreference: 'RECRUITER',
  });
  recruiterAuthHeader = `Bearer ${(recRegisterLogin.body as any)._devAccessToken}`;

  const recRegisterRes = await httpRequest('POST', '/recruiter/register', {
    corporateEmail: 'talent@razorpay.com',
    companyName: 'Razorpay',
    companyWebsite: 'https://razorpay.com',
    gstOrCin: 'U72200KA2013PTC097389',
    designation: 'Staff Tech Recruiter',
  }, { Authorization: recruiterAuthHeader });
  record('Recruiter', 'POST', '/recruiter/register', recRegisterRes, 200, `Recruiter verified for ${recRegisterRes.body.company?.name}`);

  // Post New Fresher Job
  const postJobRes = await httpRequest('POST', '/recruiter/jobs', {
    title: 'Junior Cloud DevOps Trainee (Fresher)',
    roleCategory: 'DevOps / Cloud',
    description: 'Looking for eager fresh engineering graduates to learn Terraform, AWS, and Docker container orchestration with staff mentors.',
    responsibilities: ['Maintain CI/CD pipelines', 'Monitor cloud logs', 'Automate tests'],
    requiredSkills: ['Linux', 'Docker', 'Git'],
    minExpYears: 0,
    maxExpYears: 1,
    eligibleDegrees: ['B.Tech', 'B.E'],
    eligibleBranches: ['All Engineering'],
    minGradYear: 2023,
    maxGradYear: 2026,
    minCgpa: 6.5,
    salaryMinInr: 700000,
    salaryMaxInr: 1100000,
    locationCity: 'Bengaluru',
    workplaceType: 'HYBRID',
    jobType: 'FULL_TIME',
    vacancies: 3,
  }, { Authorization: recruiterAuthHeader });
  const newlyCreatedJobId = postJobRes.body.job?.id;
  record('Recruiter', 'POST', '/recruiter/jobs', postJobRes, 200, `Created verified fresher job: ${postJobRes.body.job?.title}`);

  // Get Recruiter Jobs
  const recJobsRes = await httpRequest('GET', '/recruiter/jobs', undefined, { Authorization: recruiterAuthHeader });
  record('Recruiter', 'GET', '/recruiter/jobs', recJobsRes, 200, `Retrieved ${recJobsRes.body.count} jobs managed by recruiter`);

  // Edit Job Opening
  if (newlyCreatedJobId) {
    const editJobRes = await httpRequest('PUT', `/recruiter/jobs/${newlyCreatedJobId}`, {
      title: 'Junior Cloud & Platform Engineer (Fresher)',
      salaryMaxInr: 1200000,
    }, { Authorization: recruiterAuthHeader });
    record('Recruiter', 'PUT', '/recruiter/jobs/:id', editJobRes, 200, `Updated job title: ${editJobRes.body.job?.title}`);

    // Close Job Opening
    const closeJobRes = await httpRequest('PATCH', `/recruiter/jobs/${newlyCreatedJobId}/close`, undefined, { Authorization: recruiterAuthHeader });
    record('Recruiter', 'PATCH', '/recruiter/jobs/:id/close', closeJobRes, 200, `Closed job opening status: ${closeJobRes.body.job?.status}`);
  }

  // --------------------------------------------------------------------------
  // 8. ANTI-FRAUD MODULE
  // --------------------------------------------------------------------------
  // Submit Community Report
  const reportRes = await httpRequest('POST', '/anti-fraud/report', {
    jobId: targetJobId,
    reason: 'ASKS_FOR_MONEY',
    comments: 'Suspicious caller asking for money',
  }, { Authorization: candidateAuthHeader });
  record('AntiFraud', 'POST', '/anti-fraud/report', reportRes, 200, `Report handled, quarantined: ${reportRes.body.jobQuarantined}`);

  // Get Fresher Safety Tips
  const tipsRes = await httpRequest('GET', '/anti-fraud/safety-tips');
  record('AntiFraud', 'GET', '/anti-fraud/safety-tips', tipsRes, 200, `Retrieved ${tipsRes.body.tips?.length} fresher safety rules`);

  // --------------------------------------------------------------------------
  // 9. COMPANIES MODULE
  // --------------------------------------------------------------------------
  // Get all companies
  const companiesRes = await httpRequest('GET', '/companies');
  record('Companies', 'GET', '/companies', companiesRes, 200, `Retrieved ${companiesRes.body.count} verified companies`);

  // Get company by slug
  const compDetailRes = await httpRequest('GET', '/companies/razorpay');
  record('Companies', 'GET', '/companies/:slug', compDetailRes, 200, `Fetched company: ${compDetailRes.body.company?.name}`);

  // Post Company Review
  const postReviewRes = await httpRequest('POST', '/companies/razorpay/reviews', {
    rating: 5,
    fresherFriendliness: 5,
    title: 'Incredible Fresher Mentorship & Growth',
    content: 'The onboarding program for freshers is world class. You get direct pairing with senior engineers from day one.',
    pros: 'Transparent pay, great team culture, no legacy code',
    cons: 'Fast-paced sprints',
  }, { Authorization: candidateAuthHeader });
  record('Companies', 'POST', '/companies/:slug/reviews', postReviewRes, 200, `Review published for ${compDetailRes.body.company?.name}`);

  // --------------------------------------------------------------------------
  // 10. ADMIN DASHBOARD & MODERATION MODULE
  // --------------------------------------------------------------------------
  // Analytics
  const analyticsRes = await httpRequest('GET', '/admin/analytics', undefined, { 'X-Admin-Token': adminAuthHeader });
  record('Admin', 'GET', '/admin/analytics', analyticsRes, 200, `Total Jobs: ${analyticsRes.body.analytics?.totalJobs}, Total Users: ${analyticsRes.body.analytics?.totalUsers}`);

  // Moderation Queue
  const modQueueRes = await httpRequest('GET', '/admin/moderation', undefined, { 'X-Admin-Token': adminAuthHeader });
  record('Admin', 'GET', '/admin/moderation', modQueueRes, 200, `Flagged jobs awaiting moderation: ${modQueueRes.body.queue?.flaggedJobs?.length}`);

  // Take Job Action (PERMANENT_BAN)
  if (targetJobId) {
    const jobActionRes = await httpRequest('POST', `/admin/jobs/${targetJobId}/action`, { action: 'PERMANENT_BAN', notes: 'Verified pay-to-apply extortion scheme' }, { 'X-Admin-Token': adminAuthHeader });
    record('Admin', 'POST', '/admin/jobs/:id/action', jobActionRes, 200, 'Administrative action executed');
  }

  // Add to Blacklist
  const blacklistRes = await httpRequest('POST', '/admin/blacklist', { identifier: 'fraudulent-recruiter@scamcorp.com', reason: 'Attempted to demand training fee from candidates' }, { 'X-Admin-Token': adminAuthHeader });
  record('Admin', 'POST', '/admin/blacklist', blacklistRes, 200, 'Permanently added to platform blacklist');

  // Audit Logs
  const auditLogsRes = await httpRequest('GET', '/admin/audit-logs', undefined, { 'X-Admin-Token': adminAuthHeader });
  record('Admin', 'GET', '/admin/audit-logs', auditLogsRes, 200, `Immutable audit trail count: ${auditLogsRes.body.count}`);

  console.log('\n========================================================================');
  const allPassed = auditResults.every((r) => r.success);
  const passedCount = auditResults.filter((r) => r.success).length;
  console.log(`ALL 36 API FUNCTIONS TESTED: ${passedCount} / ${auditResults.length} PASSED`);
  console.log(`OVERALL HEALTH STATUS: ${allPassed ? '🟢 100% OPERATIONAL & READY FOR DEPLOY' : '🔴 SOME FUNCTIONS FAILED'}`);
  console.log('========================================================================\n');
}

verifyAllFunctions().catch(console.error);
