import { RecruiterService } from '../modules/recruiter/recruiter.service';
import { AutoApplyService } from '../modules/auto-apply/auto-apply.service';
import { DB, User } from '../database/db';

async function runAutoApplyAndRecruiterTests() {
  console.log('--- STARTING TAKSHVAYA AUTO-APPLY & RECRUITER ATS TEST SUITE ---');

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
  // TEST 1: Recruiter Corporate Email Verification (Rejects Free Personal Domains)
  // --------------------------------------------------------------------------
  const recruiterUser: User = {
    id: 'usr-rec-1',
    email: 'kunal.shah@gmail.com',
    full_name: 'Kunal Shah',
    role: 'JOB_SEEKER',
    phone_verified: true,
    is_active: true,
    is_banned: false,
    created_at: new Date().toISOString(),
  };
  DB.users.set(recruiterUser.id, recruiterUser);

  let freeDomainRejected = false;
  try {
    RecruiterService.verifyAndRegisterRecruiter(
      recruiterUser.id,
      'kunal.shah@gmail.com', // DISALLOWED PERSONAL EMAIL!
      'CRED',
      'https://cred.club',
      'GSTIN29AAACR1234F1Z5',
      'Head of Talent'
    );
  } catch (err: any) {
    freeDomainRejected = true;
    assert(err.message.includes('personal email domains'), 'Disallowed free email (@gmail.com) rejected for recruiter registration');
  }
  assert(freeDomainRejected, 'Recruiter onboarding strictly requires corporate email domain');

  // Corporate email accepted
  const verifiedRec = RecruiterService.verifyAndRegisterRecruiter(
    recruiterUser.id,
    'kunal@cred.club', // CORPORATE DOMAIN!
    'CRED Technologies',
    'https://cred.club',
    'GSTIN29AAACR1234F1Z5',
    'Talent Acquisition Lead'
  );
  assert(verifiedRec.recruiter.status === 'VERIFIED', 'Recruiter with corporate email verified successfully');
  assert(recruiterUser.role === 'RECRUITER', 'User role upgraded to RECRUITER');

  // --------------------------------------------------------------------------
  // TEST 2: Job Posting Anti-Fraud Filter (Zero Tolerance for Payment Scams)
  // --------------------------------------------------------------------------
  let scamRejected = false;
  try {
    RecruiterService.postJob(recruiterUser.id, {
      title: 'Junior React Trainee (Work From Home)',
      roleCategory: 'Software Engineer',
      description: 'Candidate must pay a refundable registration fee of Rs. 1500 before laptop dispatch.', // SCAM ATTEMPT!
      responsibilities: ['Write code'],
      requiredSkills: ['React'],
      minExpYears: 0,
      maxExpYears: 1,
      eligibleDegrees: ['Any Graduate'],
      eligibleBranches: ['All'],
      minGradYear: 2023,
      maxGradYear: 2026,
      minCgpa: 6.0,
      salaryMinInr: 500000,
      salaryMaxInr: 800000,
      locationCity: 'Bengaluru',
      workplaceType: 'REMOTE',
      jobType: 'FULL_TIME',
      vacancies: 2,
    });
  } catch (err: any) {
    scamRejected = true;
    assert(err.message.includes('Security Fraud Alert'), 'Anti-Fraud Engine: Job demanding registration fee was blocked');
  }
  assert(scamRejected, 'Fraud filter prevents pay-to-work scam postings');

  // --------------------------------------------------------------------------
  // TEST 3: Fresher Ceiling Enforcement (Rejects Senior Postings)
  // --------------------------------------------------------------------------
  let seniorRejected = false;
  try {
    RecruiterService.postJob(recruiterUser.id, {
      title: 'Staff Platform Engineer',
      roleCategory: 'DevOps',
      description: 'Senior Kubernetes architect wanted.',
      responsibilities: ['Architecture'],
      requiredSkills: ['Kubernetes'],
      minExpYears: 4, // > 2 YRS!
      maxExpYears: 8,
      eligibleDegrees: ['B.Tech'],
      eligibleBranches: ['CS'],
      minGradYear: 2020,
      maxGradYear: 2024,
      minCgpa: 6.0,
      salaryMinInr: 2500000,
      salaryMaxInr: 4000000,
      locationCity: 'Bengaluru',
      workplaceType: 'HYBRID',
      jobType: 'FULL_TIME',
      vacancies: 1,
    });
  } catch (err: any) {
    seniorRejected = true;
    assert(err.message.includes('strictly focused on Freshers'), 'Fresher constraint: Non-fresher position (>2 yrs) rejected');
  }
  assert(seniorRejected, 'Platform preserves 0-2 yrs fresher purity');

  // --------------------------------------------------------------------------
  // TEST 4: Post Legitimate Fresher Job
  // --------------------------------------------------------------------------
  const credJob = RecruiterService.postJob(recruiterUser.id, {
    title: 'Associate Backend Engineer - Microservices (Golang / Python)',
    roleCategory: 'Software Engineer',
    description: 'CRED is hiring passionate freshers to build high-concurrency payment microservices and event pipelines. Mentorship provided by senior architects.',
    responsibilities: [
      'Write clean, idiomatic Python and Go code for payment transaction APIs',
      'Build unit tests and benchmark throughput latency',
      'Participate in daily engineering scrums and post-mortems',
    ],
    requiredSkills: ['Python', 'SQL', 'Git'],
    optionalSkills: ['Docker', 'Redis'],
    minExpYears: 0,
    maxExpYears: 1,
    eligibleDegrees: ['B.Tech', 'B.E', 'BCA', 'MCA'],
    eligibleBranches: ['Computer Science', 'Information Technology', 'All Engineering'],
    minGradYear: 2023,
    maxGradYear: 2026,
    minCgpa: 7.0,
    salaryMinInr: 1000000,
    salaryMaxInr: 1600000,
    locationCity: 'Bengaluru',
    workplaceType: 'HYBRID',
    jobType: 'FULL_TIME',
    vacancies: 4,
  });

  assert(credJob.trust_badge === 'VERIFIED_RECRUITER', 'Job posted with VERIFIED_RECRUITER trust badge');

  // --------------------------------------------------------------------------
  // TEST 5: User-Controlled Auto-Apply Engine
  // --------------------------------------------------------------------------
  const candidateId = 'usr-candidate-1';
  // Ensure candidate has Python & SQL in profile to match CRED job
  const candidateProfile = DB.candidateProfiles.get(candidateId)!;
  candidateProfile.skills = ['React', 'JavaScript', 'TypeScript', 'Python', 'SQL', 'Git'];

  // Configure Auto-Apply Rules
  AutoApplyService.updateSettings(candidateId, {
    is_enabled: true,
    min_match_score: 75,
    preferred_roles: ['Software Engineer'],
    preferred_locations: ['Bengaluru', 'Remote'],
    min_salary_inr: 800000,
    daily_application_limit: 3,
  });

  const autoApplyResult = AutoApplyService.runAutoApply(candidateId);

  assert(autoApplyResult.appliedCount > 0, `Auto-apply successfully matched and submitted ${autoApplyResult.appliedCount} jobs`);
  assert(
    autoApplyResult.appliedJobs.some((j) => j.title.includes('Associate Backend Engineer')),
    'Auto-applied to matching verified CRED opening'
  );

  // Verify daily limit respected
  const settingsPostRun = AutoApplyService.getSettings(candidateId);
  assert(settingsPostRun.applications_today <= settingsPostRun.daily_application_limit, 'Daily quota strictly capped and respected');

  // --------------------------------------------------------------------------
  // TEST 6: Application Tracker Lifecycle & IDOR Protection
  // --------------------------------------------------------------------------
  const candidateApps = AutoApplyService.getCandidateApplications(candidateId);
  const credApp = candidateApps.find((a) => a.job_id === credJob.id);
  assert(!!credApp, 'Candidate application tracker reflects new auto-applied application');
  assert(credApp?.is_auto_applied === true, 'Application accurately flagged as auto-applied');
  assert(credApp?.status === 'APPLIED', 'Initial application status is APPLIED');

  // Recruiter views applicants for the job
  const applicantsList = RecruiterService.getJobApplicants(recruiterUser.id, credJob.id);
  assert(applicantsList.length > 0, `Recruiter sees ${applicantsList.length} applicant(s) for the opening`);
  assert(applicantsList[0].application.match_score >= 75, 'Applicant ranked by high match score');
  assert(!!applicantsList[0].resumeUrl, 'Recruiter provided short-lived secure resume URL');

  // Recruiter advances candidate in pipeline: APPLIED -> SHORTLISTED -> INTERVIEW
  RecruiterService.updateApplicantStatus(recruiterUser.id, credApp!.id, 'SHORTLISTED', 'Strong GitHub projects and high CGPA');
  const updatedCandidateApps = AutoApplyService.getCandidateApplications(candidateId);
  const shortlistedApp = updatedCandidateApps.find((a) => a.id === credApp!.id);
  assert(shortlistedApp?.status === 'SHORTLISTED', 'Candidate application tracker updated to SHORTLISTED');

  // IDOR Protection: Attacker recruiter cannot view or mutate another recruiter's job applicants
  const rogueRecruiterId = 'usr-rec-rogue';
  DB.recruiterProfiles.set(rogueRecruiterId, {
    id: 'rec-rogue',
    user_id: rogueRecruiterId,
    company_id: 'comp-other',
    corporate_email: 'rogue@other.com',
    corporate_email_verified: true,
    designation: 'HR',
    status: 'VERIFIED',
    phone_otp_verified: true,
  });

  let idorBlocked = false;
  try {
    RecruiterService.getJobApplicants(rogueRecruiterId, credJob.id);
  } catch (err: any) {
    idorBlocked = true;
    assert(err.message.includes('IDOR protection') || err.message.includes('Unauthorized'), 'IDOR Defense: Unauthorized recruiter blocked from viewing applicant data');
  }
  assert(idorBlocked, 'Strict object-level access control (OLAC) enforced');

  console.log('\n---------------------------------------------------');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('---------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAutoApplyAndRecruiterTests();
