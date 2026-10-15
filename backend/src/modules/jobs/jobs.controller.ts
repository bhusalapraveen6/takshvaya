import { Request, Response, Router } from 'express';
import { JobsService } from './jobs.service';
import { JobAggregatorService } from './aggregator.service';
import { requireAuth, AuthenticatedRequest } from '../../security/middleware';
import { DB } from '../../database/db';

export const jobsRouter = Router();

// ----------------------------------------------------------------------------
// 1. SEARCH & FILTER JOBS (Fresher Focused: 0-2 Yrs, Degree, Branch, CGPA)
// ----------------------------------------------------------------------------
jobsRouter.get('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      q,
      role,
      location,
      workplace,
      jobType,
      expMin,
      expMax,
      degree,
      branch,
      passingYear,
      minCgpa,
      salaryMin,
      companyType,
      verifiedOnly,
      sort,
      page,
      limit,
    } = req.query;

    const results = JobsService.searchJobs(
      {
        q: q as string,
        role: role as string,
        location: location as string,
        workplace: workplace as string,
        jobType: jobType as string,
        expMin: expMin ? parseInt(expMin as string, 10) : undefined,
        expMax: expMax ? parseInt(expMax as string, 10) : undefined,
        degree: degree as string,
        branch: branch as string,
        passingYear: passingYear ? parseInt(passingYear as string, 10) : undefined,
        minCgpa: minCgpa ? parseFloat(minCgpa as string) : undefined,
        salaryMin: salaryMin ? parseInt(salaryMin as string, 10) : undefined,
        companyType: companyType as string,
        verifiedOnly: verifiedOnly === 'true',
        sort: sort as any,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      },
      userId
    );

    return res.json({
      success: true,
      ...results,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 2. AUTOCOMPLETE SUGGESTIONS
// ----------------------------------------------------------------------------
jobsRouter.get('/autocomplete', (req: Request, res: Response) => {
  const q = req.query.q as string;
  const suggestions = JobsService.getAutocompleteSuggestions(q || '');
  return res.json({ success: true, suggestions });
});

// ----------------------------------------------------------------------------
// 3. SAVED JOBS (Authenticated Seeker)
// ----------------------------------------------------------------------------
jobsRouter.get('/saved', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const saved = JobsService.getSavedJobs(req.user!.id);
  return res.json({ success: true, count: saved.length, jobs: saved });
});

// ----------------------------------------------------------------------------
// 4. TOGGLE SAVE JOB
// ----------------------------------------------------------------------------
jobsRouter.post('/:id/save', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const result = JobsService.toggleSaveJob(req.user!.id, req.params.id);
  return res.json({ success: true, ...result });
});

// ----------------------------------------------------------------------------
// 5. JOB ALERTS (Create & List) - Must be before /:slug
// ----------------------------------------------------------------------------
jobsRouter.post('/alerts', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role, location, minSalary } = req.body;
    const userId = req.user!.id;
    const alertList = DB.jobAlerts.get(userId) || [];
    const newAlert = {
      id: `alert-${Date.now()}`,
      role: String(role || 'All Roles'),
      location: String(location || 'All Locations'),
      minSalary: Number(minSalary || 0),
      created_at: new Date().toISOString(),
    };
    alertList.push(newAlert);
    DB.jobAlerts.set(userId, alertList);

    return res.json({ success: true, message: 'Fresher job alert subscribed successfully.', alert: newAlert });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

jobsRouter.get('/alerts', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const alerts = DB.jobAlerts.get(req.user!.id) || [];
  return res.json({ success: true, count: alerts.length, alerts });
});

// ----------------------------------------------------------------------------
// 6. SCHEDULER HOOK / AGGREGATION RUNNER (Every 15-30 mins)
// ----------------------------------------------------------------------------
jobsRouter.post('/trigger-aggregation', (_req: Request, res: Response) => {
  const stats = JobAggregatorService.processAggregatedFeed([]);
  return res.json({
    success: true,
    message: 'Legal aggregation pipeline cycle completed.',
    stats,
  });
});

// ----------------------------------------------------------------------------
// 7. GET JOB BY SLUG OR ID (Parameterized catch-all)
// ----------------------------------------------------------------------------
jobsRouter.get('/:slug', (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const job = JobsService.getJobBySlug(req.params.slug, userId);

  if (!job) {
    return res.status(404).json({ success: false, error: 'Job opening not found or has expired.' });
  }

  return res.json({ success: true, job });
});

