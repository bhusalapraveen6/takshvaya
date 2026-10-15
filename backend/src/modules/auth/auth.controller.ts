import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { requireAuth, AuthenticatedRequest } from '../../security/middleware';
import { DB } from '../../database/db';
import { ENV } from '../../config/env';

export const authRouter = Router();

// ----------------------------------------------------------------------------
// 1. GOOGLE OAUTH CALLBACK / LOGIN
// ----------------------------------------------------------------------------
const googleLoginSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  googleId: z.string().min(5),
  avatarUrl: z.string().url().optional(),
  rolePreference: z.enum(['JOB_SEEKER', 'RECRUITER']).default('JOB_SEEKER'),
});

authRouter.post('/google/callback', (req: Request, res: Response) => {
  try {
    const parseResult = googleLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OAuth payload.',
        details: parseResult.error.flatten(),
      });
    }

    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Device';

    const { user, tokens } = AuthService.handleGoogleLogin(parseResult.data, ipAddress, userAgent);

    // Set Secure HttpOnly Cookies (Never store in localStorage!)
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: 7 * 24 * 3600 * 1000, // 7 days
    });

    return res.json({
      success: true,
      message: 'Authentication successful.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        avatarUrl: user.avatar_url,
      },
      // In dev mode provide token for easier headless/curl debugging
      ...(ENV.NODE_ENV === 'development' ? { _devAccessToken: tokens.accessToken, _devRefreshToken: tokens.refreshToken } : {}),
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 2. REFRESH TOKEN ROTATION (Detects Token Reuse)
// ----------------------------------------------------------------------------
authRouter.post('/refresh', (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Device';

  if (!refreshToken) {
    return res.status(401).json({ success: false, error: 'No refresh token provided.' });
  }

  const newTokens = AuthService.rotateRefreshToken(refreshToken, ipAddress, userAgent);

  if (!newTokens) {
    // Clear cookies if token reuse or expired
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });

    return res.status(401).json({
      success: false,
      error: 'Invalid or compromised refresh token. Session family revoked. Please log in again.',
    });
  }

  res.cookie('accessToken', newTokens.accessToken, {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', newTokens.refreshToken, {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth/refresh',
    maxAge: 7 * 24 * 3600 * 1000,
  });

  return res.json({
    success: true,
    message: 'Tokens rotated successfully.',
    expiresInSeconds: newTokens.expiresInSeconds,
  });
});

// ----------------------------------------------------------------------------
// 3. LOGOUT & LOGOUT FROM ALL DEVICES
// ----------------------------------------------------------------------------
authRouter.post('/logout', (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (refreshToken) {
    AuthService.revokeSession(refreshToken);
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });

  return res.json({ success: true, message: 'Logged out successfully.' });
});

authRouter.post('/logout-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    AuthService.revokeAllUserSessions(req.user.id);
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });

  return res.json({ success: true, message: 'Successfully signed out from all active devices.' });
});

// ----------------------------------------------------------------------------
// 4. GET CURRENT AUTHENTICATED USER & ACTIVE SESSIONS
// ----------------------------------------------------------------------------
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = DB.users.get(req.user!.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  const profile = DB.candidateProfiles.get(user.id);
  const autoApply = DB.autoApplySettings.get(user.id);

  return res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      phone: user.phone_number,
      role: user.role,
      createdAt: user.created_at,
    },
    candidateProfile: profile || null,
    autoApplySettings: autoApply || null,
  });
});

authRouter.get('/sessions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const sessions = Array.from(DB.refreshTokens.values())
    .filter((rt) => rt.user_id === req.user!.id && !rt.is_revoked)
    .map((rt) => ({
      id: rt.id,
      ipAddress: rt.ip_address,
      userAgent: rt.user_agent,
      createdAt: rt.created_at,
      expiresAt: rt.expires_at,
    }));

  return res.json({ success: true, sessions });
});
