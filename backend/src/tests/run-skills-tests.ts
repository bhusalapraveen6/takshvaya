import { SkillsService } from '../modules/skills/skills.service';
import { ResumeParserService } from '../modules/skills/resume-parser.service';
import { DB } from '../database/db';

async function runSkillsTests() {
  console.log('--- STARTING TAKSHVAYA SKILLS & GAP ANALYSIS TEST SUITE ---');

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
  // TEST 1: Resume Parser Entity & Skill Extraction
  // --------------------------------------------------------------------------
  const mockResumeText = `
    ADITYA SHARMA
    Email: aditya.sharma@gmail.com | Phone: 9876543210
    B.Tech in Computer Science and Engineering (Graduated: 2024)
    National Institute of Technology - CGPA: 8.4
    
    TECHNICAL SKILLS:
    - Languages: JavaScript, TypeScript, Python, HTML, CSS
    - Frontend: React, Next.js, Tailwind CSS
    - Developer Tools: Git, GitHub, VS Code
    
    ACADEMIC PROJECTS:
    - Campus Food Delivery PWA built using React, Firebase, and Tailwind CSS.
  `;

  const parsed = ResumeParserService.parseResumeContent(mockResumeText, 'aditya_resume.pdf');

  assert(parsed.degree === 'B.Tech', 'Parsed Degree correctly: B.Tech');
  assert(parsed.branch === 'Computer Science', 'Parsed Branch correctly: Computer Science');
  assert(parsed.graduationYear === 2024, 'Parsed Graduation Year: 2024');
  assert(parsed.cgpaOrPercentage === 8.4, 'Parsed Academic CGPA: 8.4');
  assert(
    parsed.detectedSkills.includes('React') &&
    parsed.detectedSkills.includes('TypeScript') &&
    parsed.detectedSkills.includes('Python') &&
    parsed.detectedSkills.includes('Git'),
    'Parsed all key technical skills: React, TypeScript, Python, Git'
  );

  // --------------------------------------------------------------------------
  // TEST 2: Resume Security - Magic Byte Validation
  // --------------------------------------------------------------------------
  // Valid PDF header: %PDF-1.4
  const validPdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
  const validCheck = ResumeParserService.verifyFileSafety(validPdfBuffer, 'resume.pdf');
  assert(validCheck.isValid === true, 'Magic byte verification: Valid PDF header accepted');

  // Disguised shell script named "resume.pdf"
  const fakePdfBuffer = Buffer.from('#!/bin/bash\nrm -rf /tmp/data\n');
  const fakeCheck = ResumeParserService.verifyFileSafety(fakePdfBuffer, 'resume.pdf');
  assert(
    fakeCheck.isValid === false && !!fakeCheck.reason,
    'Magic byte verification: Renamed shell script disguised as PDF rejected'
  );

  // Embedded launch payload
  const exploitBuffer = Buffer.from('%PDF-1.4\n/Launch << /F (cmd.exe) /P (/c calc.exe) >>');
  const exploitCheck = ResumeParserService.verifyFileSafety(exploitBuffer, 'resume.pdf');
  assert(
    exploitCheck.isValid === false && exploitCheck.reason!.includes('disallowed embedded scripts'),
    'Anti-malware defense: Disallowed PDF launch payload blocked'
  );

  // --------------------------------------------------------------------------
  // TEST 3: Skill Match Score & Gap Analysis for Razorpay Frontend Job
  // --------------------------------------------------------------------------
  const analysis = SkillsService.analyzeCandidateForJob('usr-candidate-1', 'job-1');

  assert(analysis.matchScore >= 75, `Computed high Match Score for qualified candidate: ${analysis.matchScore}%`);
  assert(analysis.matchedSkills.includes('React') && analysis.matchedSkills.includes('TypeScript'), 'Accurately detected matched skills: React, TypeScript');
  assert(analysis.eligibility.isEligible === true, 'Candidate passed all fresher eligibility criteria (Degree, Year, CGPA)');
  assert(analysis.readinessVerdict === 'HIGHLY_RECOMMENDED', 'Readiness verdict: HIGHLY_RECOMMENDED');

  // --------------------------------------------------------------------------
  // TEST 4: Missing Skills & Learning Roadmap Generation
  // --------------------------------------------------------------------------
  // Test with DevOps Job where candidate is missing skills (Linux, Networking, Docker)
  const devopsAnalysis = SkillsService.analyzeCandidateForJob('usr-candidate-1', 'job-3');

  assert(devopsAnalysis.missingSkills.length > 0, `Detected missing skills for DevOps role: ${devopsAnalysis.missingSkills.join(', ')}`);
  assert(devopsAnalysis.missingSkillRoadmaps.length === devopsAnalysis.missingSkills.length, 'Generated actionable roadmap for each missing skill');
  assert(devopsAnalysis.totalEstimatedLearningHours > 0, `Total estimated learning hours: ${devopsAnalysis.totalEstimatedLearningHours} hrs`);

  const sampleRoadmap = devopsAnalysis.missingSkillRoadmaps[0];
  assert(sampleRoadmap.freeResources.length > 0, `Roadmap for "${sampleRoadmap.skillName}" includes free curated resources (e.g. ${sampleRoadmap.freeResources[0].provider})`);
  assert(!!sampleRoadmap.practiceProject.title, `Roadmap includes hands-on practice project: "${sampleRoadmap.practiceProject.title}"`);

  // --------------------------------------------------------------------------
  // TEST 5: Academic Ineligibility Handling (Clear Reason)
  // --------------------------------------------------------------------------
  // Create candidate with year 2019 (too senior) and below CGPA
  const ineligibleCandidateId = 'usr-ineligible-demo';
  DB.candidateProfiles.set(ineligibleCandidateId, {
    id: 'prof-ineligible',
    user_id: ineligibleCandidateId,
    degree: 'B.A History', // Ineligible degree for Google Cloud DevOps
    branch: 'Humanities',
    institution_name: 'State College',
    graduation_year: 2019, // Batch too old for fresher drive
    cgpa_or_percentage: 5.2, // Below 7.0 CGPA
    experience_months: 0,
    skills: ['Git'],
    certifications: [],
    projects: [],
    preferred_locations: ['Remote'],
    preferred_roles: ['DevOps'],
    min_expected_salary: 500000,
  });

  const ineligibilityAnalysis = SkillsService.analyzeCandidateForJob(ineligibleCandidateId, 'job-3');
  assert(ineligibilityAnalysis.eligibility.isEligible === false, 'Correctly flagged as Ineligible');
  assert(ineligibilityAnalysis.eligibility.reasons.length >= 3, `Provided ${ineligibilityAnalysis.eligibility.reasons.length} specific rejection reasons`);
  assert(ineligibilityAnalysis.matchScore <= 50, 'Match score penalized and capped for ineligible candidate');

  console.log('\n---------------------------------------------------');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('---------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSkillsTests();
