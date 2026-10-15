import { Response, Router } from 'express';
import { z } from 'zod';
import { AutoApplyService } from './auto-apply.service';
import { requireAuth, AuthenticatedRequest } from '../../security/middleware';

export const autoApplyRouter = Router();

// ----------------------------------------------------------------------------
// 1. GET AUTO-APPLY SETTINGS & QUOTA
// ----------------------------------------------------------------------------
autoApplyRouter.get('/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const settings = AutoApplyService.getSettings(req.user!.id);
  const remainingQuota = settings.daily_application_limit - settings.applications_today;
  return res.json({ success: true, settings, remainingQuota });
});

// ----------------------------------------------------------------------------
// 2. UPDATE AUTO-APPLY PREFERENCES
// ----------------------------------------------------------------------------
const updateSettingsSchema = z.object({
  is_enabled: z.boolean().optional(),
  min_match_score: z.number().min(50).max(100).optional(),
  preferred_roles: z.array(z.string()).optional(),
  preferred_locations: z.array(z.string()).optional(),
  min_salary_inr: z.number().min(0).optional(),
  daily_application_limit: z.number().min(1).max(15).optional(),
  excluded_company_ids: z.array(z.string()).optional(),
});

autoApplyRouter.put('/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = updateSettingsSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid auto-apply preferences.',
        details: parseResult.error.flatten(),
      });
    }

    const updated = AutoApplyService.updateSettings(req.user!.id, parseResult.data);
    return res.json({ success: true, message: 'Auto-apply settings updated.', settings: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 3. TRIGGER AUTO-APPLY MATCHING RUN
// ----------------------------------------------------------------------------
autoApplyRouter.post('/run', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = AutoApplyService.runAutoApply(req.user!.id);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 4. GET APPLICATION TRACKER (All Applied Jobs & Statuses)
// ----------------------------------------------------------------------------
autoApplyRouter.get('/applications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const applications = AutoApplyService.getCandidateApplications(req.user!.id);
  return res.json({ success: true, count: applications.length, applications });
});

// ----------------------------------------------------------------------------
// 5. MANUAL APPLY TO A SPECIFIC JOB
// ----------------------------------------------------------------------------
autoApplyRouter.post('/apply/:jobId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const application = AutoApplyService.submitManualApplication(req.user!.id, req.params.jobId);
    return res.json({ success: true, message: 'Application submitted successfully.', application });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 6. WITHDRAW AN APPLICATION
// ----------------------------------------------------------------------------
autoApplyRouter.delete('/applications/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    AutoApplyService.withdrawApplication(req.user!.id, req.params.id);
    return res.json({ success: true, message: 'Application withdrawn successfully.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});
