import { Response, Router } from 'express';
import { z } from 'zod';
import { RecruiterService } from './recruiter.service';
import { requireAuth, requireRole, AuthenticatedRequest } from '../../security/middleware';

export const recruiterRouter = Router();

// ----------------------------------------------------------------------------
// 1. RECRUITER VERIFICATION & REGISTRATION
// ----------------------------------------------------------------------------
const registerRecruiterSchema = z.object({
  corporateEmail: z.string().email(),
  companyName: z.string().min(2),
  companyWebsite: z.string().url(),
  gstOrCin: z.string().min(5),
  designation: z.string().min(2),
});

recruiterRouter.post('/register', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = registerRecruiterSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recruiter registration details.',
        details: parseResult.error.flatten(),
      });
    }

    const result = RecruiterService.verifyAndRegisterRecruiter(
      req.user!.id,
      parseResult.data.corporateEmail,
      parseResult.data.companyName,
      parseResult.data.companyWebsite,
      parseResult.data.gstOrCin,
      parseResult.data.designation
    );

    return res.json({
      success: true,
      message: 'Recruiter credentials verified successfully. Recruiter status granted.',
      ...result,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 2. POST A NEW JOB (Strict Fresher 0-2 yrs & Anti-Fraud checks)
// ----------------------------------------------------------------------------
const postJobSchema = z.object({
  title: z.string().min(5),
  roleCategory: z.string().min(2),
  description: z.string().min(30),
  responsibilities: z.array(z.string()).min(1),
  requiredSkills: z.array(z.string()).min(1),
  optionalSkills: z.array(z.string()).optional(),
  minExpYears: z.number().min(0).max(2),
  maxExpYears: z.number().min(0).max(2),
  eligibleDegrees: z.array(z.string()).min(1),
  eligibleBranches: z.array(z.string()).min(1),
  minGradYear: z.number().int().min(2020),
  maxGradYear: z.number().int().max(2027),
  minCgpa: z.number().min(0).max(10),
  salaryMinInr: z.number().min(100000),
  salaryMaxInr: z.number().min(100000),
  locationCity: z.string().min(2),
  workplaceType: z.enum(['ON_SITE', 'REMOTE', 'HYBRID']),
  jobType: z.enum(['FULL_TIME', 'INTERNSHIP']),
  vacancies: z.number().min(1).default(1),
});

recruiterRouter.post('/jobs', requireAuth, requireRole('RECRUITER', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = postJobSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid job posting data.',
        details: parseResult.error.flatten(),
      });
    }

    const job = RecruiterService.postJob(req.user!.id, parseResult.data);
    return res.json({
      success: true,
      message: 'Job posting published successfully with Verified Recruiter trust badge.',
      job,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 3. GET RECRUITER'S ACTIVE JOBS
// ----------------------------------------------------------------------------
recruiterRouter.get('/jobs', requireAuth, requireRole('RECRUITER', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const jobs = RecruiterService.getRecruiterJobs(req.user!.id);
  return res.json({ success: true, count: jobs.length, jobs });
});

// ----------------------------------------------------------------------------
// 4. GET APPLICANTS FOR A JOB (Ranked by Match Score, IDOR Protected)
// ----------------------------------------------------------------------------
recruiterRouter.get('/jobs/:jobId/applicants', requireAuth, requireRole('RECRUITER', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const applicants = RecruiterService.getJobApplicants(req.user!.id, req.params.jobId);
    return res.json({ success: true, count: applicants.length, applicants });
  } catch (err: any) {
    return res.status(403).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 5. UPDATE APPLICANT STATUS IN ATS PIPELINE
// ----------------------------------------------------------------------------
const updateStatusSchema = z.object({
  status: z.enum(['APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'OFFER']),
  notes: z.string().optional(),
});

recruiterRouter.patch('/applications/:id/status', requireAuth, requireRole('RECRUITER', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = updateStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status update.',
        details: parseResult.error.flatten(),
      });
    }

    const updated = RecruiterService.updateApplicantStatus(
      req.user!.id,
      req.params.id,
      parseResult.data.status,
      parseResult.data.notes
    );

    return res.json({
      success: true,
      message: `Candidate application advanced to ${parseResult.data.status}.`,
      application: updated,
    });
  } catch (err: any) {
    return res.status(403).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 6. EDIT JOB
// ----------------------------------------------------------------------------
recruiterRouter.put('/jobs/:id', requireAuth, requireRole('RECRUITER', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = RecruiterService.editJob(req.user!.id, req.params.id, req.body);
    return res.json({ success: true, message: 'Job opening updated.', job: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 7. CLOSE / EXPIRE JOB
// ----------------------------------------------------------------------------
recruiterRouter.patch('/jobs/:id/close', requireAuth, requireRole('RECRUITER', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const closed = RecruiterService.closeJob(req.user!.id, req.params.id);
    return res.json({ success: true, message: 'Job opening closed.', job: closed });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

