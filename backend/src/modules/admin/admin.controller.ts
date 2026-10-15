import { Response, Router } from 'express';
import { z } from 'zod';
import { AdminService } from './admin.service';
import { requireAdminOTP, AuthenticatedRequest } from '../../security/middleware';

export const adminRouter = Router();

// Protect ALL admin routes with Dual-Factor OTP verification
adminRouter.use(requireAdminOTP);

// ----------------------------------------------------------------------------
// 1. DASHBOARD OVERVIEW ANALYTICS
// ----------------------------------------------------------------------------
adminRouter.get('/analytics', (_req: AuthenticatedRequest, res: Response) => {
  const analytics = AdminService.getDashboardAnalytics();
  return res.json({ success: true, analytics });
});

// ----------------------------------------------------------------------------
// 2. MODERATION QUEUE (Flagged Postings & Reports)
// ----------------------------------------------------------------------------
adminRouter.get('/moderation', (_req: AuthenticatedRequest, res: Response) => {
  const queue = AdminService.getModerationQueue();
  return res.json({ success: true, queue });
});

// ----------------------------------------------------------------------------
// 3. TAKE ACTION ON A JOB (Approve / Ban)
// ----------------------------------------------------------------------------
const jobActionSchema = z.object({
  action: z.enum(['APPROVE', 'PERMANENT_BAN']),
  notes: z.string().optional(),
});

adminRouter.post('/jobs/:id/action', (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = jobActionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action.',
        details: parseResult.error.flatten(),
      });
    }

    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Device';

    const result = AdminService.takeJobAction(
      req.admin!.email,
      req.params.id,
      parseResult.data.action,
      ipAddress,
      userAgent,
      parseResult.data.notes
    );

    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 4. ADD TO PERMANENT BLACKLIST
// ----------------------------------------------------------------------------
const blacklistSchema = z.object({
  identifier: z.string().min(3),
  reason: z.string().min(5),
});

adminRouter.post('/blacklist', (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = blacklistSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid blacklist entry.',
        details: parseResult.error.flatten(),
      });
    }

    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Device';

    const result = AdminService.addToBlacklist(
      req.admin!.email,
      parseResult.data.identifier,
      parseResult.data.reason,
      ipAddress,
      userAgent
    );

    return res.json({ message: 'Identifier added to permanent blacklist.', ...result });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 5. IMMUTABLE AUDIT LOGS
// ----------------------------------------------------------------------------
adminRouter.get('/audit-logs', (_req: AuthenticatedRequest, res: Response) => {
  const logs = AdminService.getAuditLogs();
  return res.json({ success: true, count: logs.length, logs });
});
