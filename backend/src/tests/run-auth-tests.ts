import { AuthService } from '../modules/auth/auth.service';
import { DB } from '../database/db';
import { ENV } from '../config/env';

async function runAuthTests() {
  console.log('--- STARTING TAKSHVAYA AUTH & SECURITY TEST SUITE ---');

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
  // TEST 1: Candidate Google Login & Token Issuance
  // --------------------------------------------------------------------------
  try {
    const { user, tokens } = AuthService.handleGoogleLogin(
      {
        googleId: 'google-sub-12345',
        email: 'rahul.fresher@gmail.com',
        fullName: 'Rahul Verma',
        rolePreference: 'JOB_SEEKER',
      },
      '192.168.1.5',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    );

    assert(user.role === 'JOB_SEEKER', 'New Google login defaults to JOB_SEEKER');
    assert(!!tokens.accessToken && !!tokens.refreshToken, 'Issued access and refresh token pair');

    const candidateProfile = DB.candidateProfiles.get(user.id);
    assert(!!candidateProfile, 'Automatically provisioned candidate profile for fresher');

    // --------------------------------------------------------------------------
    // TEST 2: Refresh Token Rotation
    // --------------------------------------------------------------------------
    const rotatedTokens = AuthService.rotateRefreshToken(
      tokens.refreshToken,
      '192.168.1.5',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    );

    assert(
      !!rotatedTokens && rotatedTokens.refreshToken !== tokens.refreshToken,
      'Successfully rotated refresh token with new unique cryptographic secret'
    );

    // --------------------------------------------------------------------------
    // TEST 3: Refresh Token Reuse / Theft Detection (Revokes Whole Family)
    // --------------------------------------------------------------------------
    const reuseAttempt = AuthService.rotateRefreshToken(
      tokens.refreshToken, // REUSING OLD TOKEN!
      '192.168.1.99', // Attacker IP
      'curl/7.68.0'
    );

    assert(reuseAttempt === null, 'Replayed old refresh token was rejected');

    // Even the newer token in that family must now be revoked
    const postReplayAttempt = AuthService.rotateRefreshToken(
      rotatedTokens!.refreshToken,
      '192.168.1.5',
      'Mozilla/5.0'
    );
    assert(postReplayAttempt === null, 'Entire session family was revoked after reuse attack detection');

    // --------------------------------------------------------------------------
    // TEST 4: Admin Dual-Factor OTP - Unauthorized Identity Rejection
    // --------------------------------------------------------------------------
    const unauthorizedResult = await AuthService.requestAdminOTP(
      'hacker@exploit.com',
      '9999999999',
      '10.0.0.1',
      'BadActorBot'
    );

    assert(
      unauthorizedResult.success === true && !(unauthorizedResult as any).sessionId,
      'Unauthorized admin request receives generic timing-safe response without session ID'
    );

    // --------------------------------------------------------------------------
    // TEST 5: Admin Dual-Factor OTP - Authorized Allowlist Request
    // --------------------------------------------------------------------------
    const authorizedResult = await AuthService.requestAdminOTP(
      ENV.ADMIN_EMAIL,
      ENV.ADMIN_PHONE,
      '127.0.0.1',
      'AdminWorkstation'
    );

    const authRes = authorizedResult as any;
    assert(!!authRes.sessionId, 'Authorized admin request generated dual-OTP session');
    const devCodes = authRes._devCodes;
    assert(!!devCodes.emailOTP && !!devCodes.phoneOTP, 'Dual independent OTPs generated for Email and Phone');

    // --------------------------------------------------------------------------
    // TEST 6: Admin Dual-Factor OTP - Bad OTP Rejection
    // --------------------------------------------------------------------------
    let badOtpError = false;
    try {
      await AuthService.verifyAdminOTP(
        authRes.sessionId,
        '000000', // wrong email OTP
        devCodes.phoneOTP,
        '127.0.0.1',
        'AdminWorkstation'
      );
    } catch (err: any) {
      badOtpError = true;
      assert(err.message.includes('Attempts remaining'), 'Wrong OTP rejected and attempts deducted');
    }
    assert(badOtpError, 'Verification fails if any factor is incorrect');

    // --------------------------------------------------------------------------
    // TEST 7: Admin Dual-Factor OTP - Both Factors Correct
    // --------------------------------------------------------------------------
    const adminSession = await AuthService.verifyAdminOTP(
      authRes.sessionId,
      devCodes.emailOTP,
      devCodes.phoneOTP,
      '127.0.0.1',
      'AdminWorkstation'
    );

    assert(!!adminSession.adminSessionToken, 'Dual OTP verified: issued 30-min admin session token');
    assert(adminSession.admin.role === 'ADMIN', 'Admin session role confirmed');

    // --------------------------------------------------------------------------
    // TEST 8: Immutable Audit Trail
    // --------------------------------------------------------------------------
    const auditLogs = DB.adminAuditLogs;
    assert(auditLogs.length > 0, `Immutable audit trail recorded ${auditLogs.length} events`);
    const successfulLoginLog = auditLogs.find((l) => l.action === 'SUCCESSFUL_ADMIN_DUAL_OTP_LOGIN');
    assert(!!successfulLoginLog, 'Audit log contains record of successful dual-OTP login');
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n---------------------------------------------------');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('---------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTests();
