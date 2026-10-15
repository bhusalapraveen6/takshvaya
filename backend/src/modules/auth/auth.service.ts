import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { DB, User, UserRole, RefreshToken, AdminOTPSession, AdminAuditLog } from '../../database/db';
import { ENV } from '../../config/env';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export class AuthService {
  // --------------------------------------------------------------------------
  // 1. JWT TOKEN ISSUANCE & REFRESH TOKEN ROTATION
  // --------------------------------------------------------------------------
  static issueTokens(user: User, ipAddress: string, userAgent: string, existingFamily?: string): AuthTokens {
    const sessionFamily = existingFamily || crypto.randomUUID();
    
    // Access token: 15 minutes short-lived
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
      },
      ENV.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    // Refresh token: 7 days, cryptographically strong random hex
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    const refreshTokenEntity: RefreshToken = {
      id: crypto.randomUUID(),
      user_id: user.id,
      token_hash: tokenHash,
      session_family: sessionFamily,
      is_revoked: false,
      expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
    };

    DB.refreshTokens.set(tokenHash, refreshTokenEntity);

    return {
      accessToken,
      refreshToken: `${refreshTokenEntity.id}:${rawRefreshToken}`,
      expiresInSeconds: 900,
    };
  }

  // --------------------------------------------------------------------------
  // 2. REFRESH TOKEN REUSE DETECTION (Automatic Family Revocation)
  // --------------------------------------------------------------------------
  static rotateRefreshToken(compositeToken: string, ipAddress: string, userAgent: string): AuthTokens | null {
    if (!compositeToken || !compositeToken.includes(':')) {
      return null;
    }

    const [tokenId, rawSecret] = compositeToken.split(':');
    const tokenHash = crypto.createHash('sha256').update(rawSecret).digest('hex');
    const existing = DB.refreshTokens.get(tokenHash);

    if (!existing) {
      return null;
    }

    // THEFT / REUSE ATTACK DETECTED: An already revoked token is used again!
    if (existing.is_revoked) {
      console.warn(`[SECURITY ALERT] Refresh token reuse detected for family ${existing.session_family}. Revoking all tokens in family.`);
      // Invalidate the whole session family immediately
      for (const [hash, rt] of DB.refreshTokens.entries()) {
        if (rt.session_family === existing.session_family) {
          rt.is_revoked = true;
        }
      }
      return null;
    }

    // Check expiration
    if (new Date(existing.expires_at).getTime() < Date.now()) {
      existing.is_revoked = true;
      return null;
    }

    // Mark current token as revoked (used)
    existing.is_revoked = true;

    // Issue new pair preserving the session family
    const user = DB.users.get(existing.user_id);
    if (!user || user.is_banned || !user.is_active) {
      return null;
    }

    return this.issueTokens(user, ipAddress, userAgent, existing.session_family);
  }

  // Revoke session on logout
  static revokeSession(compositeToken: string): void {
    if (!compositeToken || !compositeToken.includes(':')) return;
    const [, rawSecret] = compositeToken.split(':');
    const tokenHash = crypto.createHash('sha256').update(rawSecret).digest('hex');
    const existing = DB.refreshTokens.get(tokenHash);
    if (existing) {
      existing.is_revoked = true;
    }
  }

  // Revoke all devices for a user
  static revokeAllUserSessions(userId: string): void {
    for (const rt of DB.refreshTokens.values()) {
      if (rt.user_id === userId) {
        rt.is_revoked = true;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 3. MANDATORY GOOGLE OAUTH 2.0 FLOW
  // --------------------------------------------------------------------------
  static handleGoogleLogin(profile: {
    googleId: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    rolePreference?: UserRole;
  }, ipAddress: string, userAgent: string) {
    let user = Array.from(DB.users.values()).find(
      (u) => u.email.toLowerCase() === profile.email.toLowerCase()
    );

    if (!user) {
      // Create new user (Freshers portal defaults to JOB_SEEKER or requested RECRUITER)
      const assignedRole: UserRole = profile.rolePreference === 'RECRUITER' ? 'RECRUITER' : 'JOB_SEEKER';
      user = {
        id: crypto.randomUUID(),
        email: profile.email.toLowerCase(),
        google_id: profile.googleId,
        full_name: profile.fullName,
        avatar_url: profile.avatarUrl,
        phone_verified: false,
        role: assignedRole,
        is_active: true,
        is_banned: false,
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      };
      DB.users.set(user.id, user);

      // Initialize candidate profile if job seeker
      if (assignedRole === 'JOB_SEEKER') {
        DB.candidateProfiles.set(user.id, {
          id: crypto.randomUUID(),
          user_id: user.id,
          degree: 'B.Tech',
          branch: 'Computer Science',
          institution_name: '',
          graduation_year: 2025,
          cgpa_or_percentage: 7.5,
          experience_months: 0,
          skills: [],
          certifications: [],
          projects: [],
          preferred_locations: ['Remote'],
          preferred_roles: ['Software Engineer'],
          min_expected_salary: 400000,
        });

        DB.autoApplySettings.set(user.id, {
          id: crypto.randomUUID(),
          user_id: user.id,
          is_enabled: false,
          min_match_score: 80,
          preferred_roles: ['Software Engineer'],
          preferred_locations: ['Remote'],
          min_salary_inr: 400000,
          daily_application_limit: 5,
          applications_today: 0,
          excluded_company_ids: [],
          last_reset_date: new Date().toISOString().split('T')[0],
        });
      }
    } else {
      user.last_login_at = new Date().toISOString();
      if (profile.avatarUrl) user.avatar_url = profile.avatarUrl;
      if (profile.googleId) user.google_id = profile.googleId;
    }

    if (user.is_banned) {
      throw new Error(`Account is suspended: ${user.ban_reason || 'Violation of terms'}`);
    }

    const tokens = this.issueTokens(user, ipAddress, userAgent);
    return { user, tokens };
  }

  // --------------------------------------------------------------------------
  // 4. ADMIN DUAL-FACTOR OTP AUTHENTICATION (STRICT ALLOWLIST)
  // --------------------------------------------------------------------------
  private static otpRateLimitTracker: Map<string, { count: number; windowStart: number }> = new Map();

  static async requestAdminOTP(email: string, phone: string, ipAddress: string, userAgent: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, '');

    // Rate Limiting: Max 3 OTP requests per hour per IP or email
    const rateKey = `${ipAddress}:${normalizedEmail}`;
    const now = Date.now();
    const userLimit = this.otpRateLimitTracker.get(rateKey) || { count: 0, windowStart: now };
    
    if (now - userLimit.windowStart < 3600 * 1000) {
      if (userLimit.count >= 3) {
        throw new Error('Rate limit exceeded: Too many OTP requests. Please wait an hour before retrying.');
      }
      userLimit.count += 1;
    } else {
      userLimit.count = 1;
      userLimit.windowStart = now;
    }
    this.otpRateLimitTracker.set(rateKey, userLimit);

    // Generic response returned regardless of match to prevent account enumeration
    const genericResponse = {
      success: true,
      message: 'If the provided identity is authorized on the Takshvaya admin allowlist, dual verification codes have been dispatched to your email and phone.',
      validitySeconds: 300,
    };

    // Check allowlist strictly
    const isEmailAllowed = normalizedEmail === ENV.ADMIN_EMAIL.toLowerCase();
    const isPhoneAllowed = cleanPhone === ENV.ADMIN_PHONE.replace(/\D/g, '');

    if (!isEmailAllowed || !isPhoneAllowed) {
      // Record failed reconnaissance attempt in audit logs
      console.warn(`[SECURITY ALERT] Unauthorized admin OTP attempt from IP: ${ipAddress}, Email: ${email}, Phone: ${phone}`);
      DB.adminAuditLogs.push({
        id: crypto.randomUUID(),
        admin_email: normalizedEmail,
        action: 'UNAUTHORIZED_ADMIN_LOGIN_ATTEMPT',
        target_entity: 'ADMIN_GATEWAY',
        target_id: 'GLOBAL',
        ip_address: ipAddress,
        user_agent: userAgent,
        changes_diff: { attempted_email: email, attempted_phone: phone },
        created_at: new Date().toISOString(),
      });
      return genericResponse;
    }

    // Generate two independent cryptographically secure 6-digit OTPs
    const emailOTP = crypto.randomInt(100000, 999999).toString();
    const phoneOTP = crypto.randomInt(100000, 999999).toString();

    // Hash with SHA-256 + salt
    const salt = crypto.randomBytes(16).toString('hex');
    const emailOtpHash = crypto.createHash('sha256').update(emailOTP + salt).digest('hex');
    const phoneOtpHash = crypto.createHash('sha256').update(phoneOTP + salt).digest('hex');

    const sessionId = crypto.randomUUID();
    const otpSession: AdminOTPSession = {
      id: sessionId,
      admin_email: normalizedEmail,
      admin_phone: cleanPhone,
      email_otp_hash: `${salt}:${emailOtpHash}`,
      phone_otp_hash: `${salt}:${phoneOtpHash}`,
      attempts: 0,
      max_attempts: 3,
      is_consumed: false,
      expires_at: now + 5 * 60 * 1000, // 5 minutes
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: now,
    };

    DB.adminOTPSessions.set(sessionId, otpSession);

    const maskedEmail = normalizedEmail.replace(/^(.{2})(.*)(@.*)$/, (_m, p1, p2, p3) => p1 + '*'.repeat(Math.max(1, p2.length)) + p3);
    const maskedPhone = cleanPhone.replace(/^(\d{2})(\d+)(\d{2})$/, (_m, p1, p2, p3) => p1 + '*'.repeat(Math.max(1, p2.length)) + p3);

    // Simulated Provider Dispatch (in Production connected to SendGrid/SES & Twilio/Gupshup)
    console.log(`\n======================================================`);
    console.log(`[TAKSHVAYA ADMIN DUAL-OTP DISPATCH]`);
    console.log(`Target Email: ${maskedEmail}`);
    console.log(`Target Phone: +91-${maskedPhone}`);
    console.log(`Email OTP:    >> ${emailOTP} <<`);
    console.log(`Phone OTP:    >> ${phoneOTP} <<`);
    console.log(`Message: "Takshvaya admin login code. Never share this code. Requested at ${new Date().toISOString()} from IP: ${ipAddress}"`);
    console.log(`Session ID:   ${sessionId}`);
    console.log(`======================================================\n`);

    // Log admin alert
    DB.adminAuditLogs.push({
      id: crypto.randomUUID(),
      admin_email: normalizedEmail,
      action: 'ADMIN_OTP_REQUESTED',
      target_entity: 'ADMIN_GATEWAY',
      target_id: sessionId,
      ip_address: ipAddress,
      user_agent: userAgent,
      changes_diff: { status: 'DISPATCHED', expiry: '5m' },
      created_at: new Date().toISOString(),
    });

    return {
      ...genericResponse,
      sessionId,
      // Provide preview in development mode for easy testing
      ...(ENV.NODE_ENV === 'development' ? { _devCodes: { emailOTP, phoneOTP } } : {}),
    };
  }

  static async verifyAdminOTP(
    sessionId: string,
    emailOTP: string,
    phoneOTP: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ adminSessionToken: string; admin: any }> {
    const session = DB.adminOTPSessions.get(sessionId);

    if (!session || session.is_consumed) {
      throw new Error('Invalid or expired OTP session. Please request a new verification code.');
    }

    if (Date.now() > session.expires_at) {
      DB.adminOTPSessions.delete(sessionId);
      throw new Error('OTP has expired. Codes are valid for 5 minutes only.');
    }

    if (session.attempts >= session.max_attempts) {
      DB.adminOTPSessions.delete(sessionId);
      throw new Error('Maximum attempt limit exceeded (3). Please request a new OTP after a cooldown.');
    }

    // Verify Email OTP
    const [emailSalt, expectedEmailHash] = session.email_otp_hash.split(':');
    const computedEmailHash = crypto.createHash('sha256').update(emailOTP.trim() + emailSalt).digest('hex');

    // Verify Phone OTP
    const [phoneSalt, expectedPhoneHash] = session.phone_otp_hash.split(':');
    const computedPhoneHash = crypto.createHash('sha256').update(phoneOTP.trim() + phoneSalt).digest('hex');

    const isEmailValid = crypto.timingSafeEqual(Buffer.from(computedEmailHash), Buffer.from(expectedEmailHash));
    const isPhoneValid = crypto.timingSafeEqual(Buffer.from(computedPhoneHash), Buffer.from(expectedPhoneHash));

    if (!isEmailValid || !isPhoneValid) {
      session.attempts += 1;
      const remaining = session.max_attempts - session.attempts;
      
      DB.adminAuditLogs.push({
        id: crypto.randomUUID(),
        admin_email: session.admin_email,
        action: 'FAILED_ADMIN_OTP_VERIFICATION',
        target_entity: 'ADMIN_GATEWAY',
        target_id: sessionId,
        ip_address: ipAddress,
        user_agent: userAgent,
        changes_diff: { attemptsUsed: session.attempts, remaining },
        created_at: new Date().toISOString(),
      });

      throw new Error(`Invalid verification code. Both Email OTP and Phone OTP are required. Attempts remaining: ${remaining}`);
    }

    // Single use: Mark consumed immediately
    session.is_consumed = true;

    // Issue short-lived admin session token (30-min idle timeout) bound to IP & device
    const adminSessionToken = jwt.sign(
      {
        sub: 'admin-root',
        email: session.admin_email,
        phone: session.admin_phone,
        role: 'ADMIN',
        ipBinding: ipAddress,
        uaFingerprint: crypto.createHash('sha256').update(userAgent).digest('hex'),
        issuedAt: Date.now(),
      },
      ENV.JWT_ADMIN_SECRET,
      { expiresIn: '30m' }
    );

    // Record immutable success in audit log
    DB.adminAuditLogs.push({
      id: crypto.randomUUID(),
      admin_email: session.admin_email,
      action: 'SUCCESSFUL_ADMIN_DUAL_OTP_LOGIN',
      target_entity: 'ADMIN_GATEWAY',
      target_id: sessionId,
      ip_address: ipAddress,
      user_agent: userAgent,
      changes_diff: { status: 'AUTHENTICATED', sessionDuration: '30m' },
      created_at: new Date().toISOString(),
    });

    return {
      adminSessionToken,
      admin: {
        email: session.admin_email,
        phone: session.admin_phone,
        role: 'ADMIN',
        full_name: 'Praveen Bhusala (Administrator)',
      },
    };
  }
}
