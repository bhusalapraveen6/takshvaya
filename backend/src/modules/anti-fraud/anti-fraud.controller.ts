import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { AntiFraudService } from './anti-fraud.service';
import { requireAuth, AuthenticatedRequest } from '../../security/middleware';

export const antiFraudRouter = Router();

const reportJobSchema = z.object({
  jobId: z.string().min(1),
  reason: z.enum([
    'ASKS_FOR_MONEY',
    'UNREALISTIC_SALARY',
    'PERSONAL_EMAIL_CONTACT',
    'WHATSAPP_OR_TELEGRAM_ONLY',
    'DUPLICATE_OR_SPAM',
    'MISLEADING_DESCRIPTION',
    'EXPIRED_OR_INACTIVE',
    'OTHER',
  ]),
  comments: z.string().optional(),
});

// ----------------------------------------------------------------------------
// 1. REPORT A SUSPICIOUS JOB
// ----------------------------------------------------------------------------
antiFraudRouter.post('/report', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = reportJobSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report data.',
        details: parseResult.error.flatten(),
      });
    }

    const result = AntiFraudService.reportJob({
      ...parseResult.data,
      reporterUserId: req.user!.id,
    });

    return res.json({
      success: true,
      message: result.jobQuarantined
        ? 'Thank you for protecting early-career freshers! This job opening has been auto-quarantined and hidden from public searches pending administrative investigation.'
        : 'Thank you for your report. Our trust and safety team will review this listing shortly.',
      ...result,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 2. GET FRESHER SAFETY TIPS (Displayed on all Job & Search Pages)
// ----------------------------------------------------------------------------
antiFraudRouter.get('/safety-tips', (_req: Request, res: Response) => {
  const tips = AntiFraudService.getSafetyTips();
  return res.json({ success: true, tips });
});
