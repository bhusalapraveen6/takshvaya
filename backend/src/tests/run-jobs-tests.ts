import { JobsService } from '../modules/jobs/jobs.service';
import { JobAggregatorService } from '../modules/jobs/aggregator.service';
import { DB } from '../database/db';

async function runJobsTests() {
  console.log('--- STARTING TAKSHVAYA JOBS & AGGREGATION TEST SUITE ---');

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
  // TEST 1: Catalog Diversity (All Required Categories Represented)
  // --------------------------------------------------------------------------
  const allJobs = Array.from(DB.jobs.values());
  const categories = new Set(allJobs.map((j) => j.role_category));
  console.log(`Available Job Categories (${categories.size}):`, Array.from(categories));

  assert(categories.has('Software Engineer'), 'IT / Software Engineering present');
  assert(categories.has('Core Engineering'), 'Core Engineering (Mechanical/Robotics) present');
  assert(categories.has('Finance & Banking'), 'Finance & Banking present');
  assert(categories.has('Marketing'), 'Marketing present');
  assert(categories.has('Human Resources'), 'HR present');
  assert(categories.has('Design'), 'UI/UX Design present');
  assert(categories.has('Government & Public Sector'), 'Government Sector (ISRO) present');
  assert(categories.has('Healthcare & Biotech'), 'Healthcare & Biotech present');

  // --------------------------------------------------------------------------
  // TEST 2: Typo-Tolerant Keyword Search
  // --------------------------------------------------------------------------
  const typoResults = JobsService.searchJobs({ q: 'rect' });
  assert(
    typoResults.jobs.some((j) => j.title.toLowerCase().includes('react') || j.required_skills.includes('React')),
    'Typo search: query "rect" successfully matches React frontend job'
  );

  const pythonTypo = JobsService.searchJobs({ q: 'pyton' });
  assert(
    pythonTypo.jobs.some((j) => j.required_skills.some((s) => s.toLowerCase().includes('python'))),
    'Typo search: query "pyton" successfully matches Python jobs'
  );

  // --------------------------------------------------------------------------
  // TEST 3: Fresher Eligibility Filtering (Passing Year, Branch, CGPA)
  // --------------------------------------------------------------------------
  const eligibilitySearch = JobsService.searchJobs({
    passingYear: 2024,
    degree: 'B.Tech',
    branch: 'Computer Science',
    minCgpa: 7.0,
  });
  assert(eligibilitySearch.total > 0, `Fresher eligibility filter returned ${eligibilitySearch.total} matching jobs`);

  // Ensure every job returned honors max 2 yrs experience
  const allHonorFresherExp = eligibilitySearch.jobs.every((j) => j.min_exp_years <= 2 && j.max_exp_years <= 2);
  assert(allHonorFresherExp, 'Strict fresher constraint: all results are 0-2 years experience');

  // --------------------------------------------------------------------------
  // TEST 4: Autocomplete Suggestions
  // --------------------------------------------------------------------------
  const suggestions = JobsService.getAutocompleteSuggestions('data');
  assert(suggestions.length > 0, `Autocomplete for "data" returned: ${suggestions.join(', ')}`);

  // --------------------------------------------------------------------------
  // TEST 5: SSRF Protection on Job Aggregator
  // --------------------------------------------------------------------------
  const ssrfAttempt = JobAggregatorService.processAggregatedFeed([
    {
      title: 'Malicious SSRF Job',
      companyName: 'Internal AWS Exploit',
      companyDomain: 'exploit.internal',
      companyWebsite: 'http://169.254.169.254/latest/meta-data/',
      roleCategory: 'IT',
      description: 'Attempting to access cloud metadata',
      responsibilities: [],
      requiredSkills: ['Hacking'],
      minExpYears: 0,
      maxExpYears: 1,
      eligibleDegrees: ['Any Graduate'],
      eligibleBranches: ['All'],
      minGradYear: 2023,
      maxGradYear: 2026,
      minCgpa: 5.0,
      salaryMinInr: 500000,
      salaryMaxInr: 800000,
      locationCity: 'Remote',
      workplaceType: 'REMOTE',
      jobType: 'FULL_TIME',
      originalApplyUrl: 'http://169.254.169.254/credentials', // SSRF TARGET!
      sourceOrigin: 'VERIFIED_PARTNER_API',
    },
  ]);
  assert(ssrfAttempt.added === 0, 'SSRF Defense: internal/metadata IP feed URL blocked from ingestion');

  // --------------------------------------------------------------------------
  // TEST 6: Feed Deduplication
  // --------------------------------------------------------------------------
  const duplicateAttempt = JobAggregatorService.processAggregatedFeed([
    {
      title: 'Junior Product Designer (UI/UX - Mobile & Web)', // Same as existing Swiggy job
      companyName: 'Swiggy',
      companyDomain: 'swiggy.com',
      companyWebsite: 'https://swiggy.com',
      roleCategory: 'Design',
      description: 'Duplicate listing from third-party feed',
      responsibilities: [],
      requiredSkills: ['Figma'],
      minExpYears: 0,
      maxExpYears: 1,
      eligibleDegrees: ['Any Graduate'],
      eligibleBranches: ['All'],
      minGradYear: 2022,
      maxGradYear: 2026,
      minCgpa: 6.0,
      salaryMinInr: 750000,
      salaryMaxInr: 1200000,
      locationCity: 'Bengaluru',
      workplaceType: 'HYBRID',
      jobType: 'FULL_TIME',
      originalApplyUrl: 'https://partner-portal.com/swiggy-job',
      sourceOrigin: 'VERIFIED_PARTNER_API',
    },
  ]);
  assert(duplicateAttempt.skippedDuplicates === 1, 'Deduplication: duplicate job from partner feed was detected and skipped');

  // --------------------------------------------------------------------------
  // TEST 7: Bookmark / Save Job Workflow
  // --------------------------------------------------------------------------
  const sampleJob = allJobs[0];
  const toggleRes1 = JobsService.toggleSaveJob('usr-candidate-1', sampleJob.id);
  assert(toggleRes1.isSaved === true, 'Saved job for user');

  const savedList = JobsService.getSavedJobs('usr-candidate-1');
  assert(savedList.some((j) => j.id === sampleJob.id), 'Saved job appears in candidate bookmark list');

  const toggleRes2 = JobsService.toggleSaveJob('usr-candidate-1', sampleJob.id);
  assert(toggleRes2.isSaved === false, 'Removed saved job on second toggle');

  // --------------------------------------------------------------------------
  // TEST 8: Human-Friendly Relative Time & Trust Badges
  // --------------------------------------------------------------------------
  const jobDetail = JobsService.getJobBySlug(sampleJob.slug);
  assert(!!jobDetail?.postedTimeAgo, `Computed relative posted time: "${jobDetail?.postedTimeAgo}"`);
  assert(!!jobDetail?.lastVerifiedAgo, `Computed relative verified time: "${jobDetail?.lastVerifiedAgo}"`);
  assert(!!jobDetail?.trust_badge, `Verified trust badge: "${jobDetail?.trust_badge}"`);

  console.log('\n---------------------------------------------------');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('---------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runJobsTests();
