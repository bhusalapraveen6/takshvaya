import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env';
import { DB, UserRole } from '../database/db';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    fullName: string;
  };
  admin?: {
    email: string;
    phone: string;
    role: 'ADMIN';
  };
}

// ----------------------------------------------------------------------------
// 1. JWT AUTHENTICATION MIDDLEWARE (HttpOnly Cookie or Bearer Token)
// ----------------------------------------------------------------------------
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.replace(/^Bearer\s+/, '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in with your Google account.',
    });
  }

  try {
    const payload = jwt.verify(token, ENV.JWT_ACCESS_SECRET) as {
      sub: string;
      email: string;
      role: UserRole;
      fullName: string;
    };

    const user = DB.users.get(payload.sub);
    if (!user || !user.is_active || user.is_banned) {
      return res.status(403).json({
        success: false,
        error: 'Account access revoked or suspended.',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        error: 'Session access token expired. Refresh required.',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid or forged authentication token.',
    });
  }
};

// ----------------------------------------------------------------------------
// 2. ROLE-BASED ACCESS CONTROL (RBAC)
// ----------------------------------------------------------------------------
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: This resource requires one of [${allowedRoles.join(', ')}] role privileges.`,
      });
    }

    next();
  };
};

// ----------------------------------------------------------------------------
// 3. ADMIN DUAL-FACTOR OTP SESSION VERIFIER (Hidden Route Protection)
// ----------------------------------------------------------------------------
export const requireAdminOTP = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const adminToken = req.cookies?.adminSessionToken || req.headers['x-admin-token'];

  if (!adminToken) {
    return res.status(401).json({
      success: false,
      error: 'Admin authorization required. Please authenticate via Dual-Factor OTP verification.',
    });
  }

  try {
    const payload = jwt.verify(adminToken, ENV.JWT_ADMIN_SECRET) as {
      sub: string;
      email: string;
      phone: string;
      role: 'ADMIN';
      ipBinding: string;
      uaFingerprint: string;
    };

    const currentIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const currentUa = req.headers['user-agent'] || '';
    const currentUaFingerprint = crypto.createHash('sha256').update(currentUa).digest('hex');

    // Strict Device & IP Binding check
    if (payload.ipBinding !== currentIp && ENV.NODE_ENV === 'production') {
      console.warn(`[SECURITY ALERT] Admin session IP mismatch! Bound: ${payload.ipBinding}, Request: ${currentIp}`);
      return res.status(403).json({
        success: false,
        error: 'Admin session bound IP mismatch detected. Re-authentication via Dual-Factor OTP required.',
      });
    }

    if (payload.uaFingerprint !== currentUaFingerprint && ENV.NODE_ENV === 'production') {
      console.warn(`[SECURITY ALERT] Admin session device fingerprint changed!`);
      return res.status(403).json({
        success: false,
        error: 'Admin session device fingerprint mismatch. Re-authentication required.',
      });
    }

    req.admin = {
      email: payload.email,
      phone: payload.phone,
      role: 'ADMIN',
    };

    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: 'Admin session has expired or is invalid. Please re-authenticate with Dual-Factor OTP.',
    });
  }
};
