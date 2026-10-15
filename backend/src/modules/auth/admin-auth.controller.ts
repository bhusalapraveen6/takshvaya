import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { requireAdminOTP, AuthenticatedRequest } from '../../security/middleware';
import { ENV } from '../../config/env';

export const adminAuthRouter = Router();

const requestOtpSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  captchaToken: z.string().optional(),
});

const verifyOtpSchema = z.object({
  sessionId: z.string().uuid(),
  emailOTP: z.string().length(6),
  phoneOTP: z.string().length(6),
});

// ----------------------------------------------------------------------------
// 1. REQUEST ADMIN DUAL-FACTOR OTP (Strict Allowlist Protection)
// ----------------------------------------------------------------------------
adminAuthRouter.post('/request-otp', async (req: Request, res: Response) => {
  try {
    const parseResult = requestOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: Email and Phone number are required.',
      });
    }

    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Device';

    const result = await AuthService.requestAdminOTP(
      parseResult.data.email,
      parseResult.data.phone,
      ipAddress,
      userAgent
    );

    return res.json(result);
  } catch (err: any) {
    return res.status(429).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 2. VERIFY DUAL-FACTOR OTP & ISSUE ADMIN SESSION
// ----------------------------------------------------------------------------
adminAuthRouter.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const parseResult = verifyOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Both 6-digit Email OTP and Phone OTP are strictly required.',
        details: parseResult.error.flatten(),
      });
    }

    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Device';

    const { adminSessionToken, admin } = await AuthService.verifyAdminOTP(
      parseResult.data.sessionId,
      parseResult.data.emailOTP,
      parseResult.data.phoneOTP,
      ipAddress,
      userAgent
    );

    // Set 30-minute idle-timeout admin session cookie
    res.cookie('adminSessionToken', adminSessionToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 minutes
    });

    return res.json({
      success: true,
      message: 'Dual-Factor OTP verification successful. Admin privileges granted.',
      admin,
      // In dev mode provide token for easier test harnesses
      ...(ENV.NODE_ENV === 'development' ? { _devAdminToken: adminSessionToken } : {}),
    });
  } catch (err: any) {
    return res.status(401).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 3. CHECK ADMIN AUTH STATUS
// ----------------------------------------------------------------------------
adminAuthRouter.get('/status', requireAdminOTP, (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    success: true,
    authenticated: true,
    admin: req.admin,
  });
});

// ----------------------------------------------------------------------------
// 4. ADMIN LOGOUT
// ----------------------------------------------------------------------------
adminAuthRouter.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('adminSessionToken');
  return res.json({ success: true, message: 'Admin session terminated.' });
});
