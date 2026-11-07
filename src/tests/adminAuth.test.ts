/**
 * Automated Test Suite for Secure Admin Authentication, Password Hashing & Email OTP Reset
 * Tests:
 * 1. Initial access control and unauthorized access blocking
 * 2. Rejection of empty credentials
 * 3. Rejection of unauthorized admin name or email
 * 4. Rejection of incorrect password for authorized administrator
 * 5. Successful sign-in with authorized Administrator Name
 * 6. Successful sign-in with authorized Administrator Email
 * 7. Session termination upon logout
 * 8. Rate limiting and brute-force lockout protection
 * 9. Cryptographic salted hashing & constant-time comparison
 * 10. Anti-enumeration: neutral response for unregistered vs registered email addresses
 * 11. Request OTP for registered administrator Gmail address
 * 12. Rate limiting / cooldown protection on OTP generation
 * 13. Rejection of invalid OTP code & attempt counter decrement
 * 14. Maximum attempt exhaustion & complete invalidation of OTP after repeated failed attempts
 * 15. Rejection of expired OTP code
 * 16. Successful password reset with valid OTP & new password
 * 17. Active session terminated upon reset
 * 18. Invalidation of used OTP code (single-use constraint)
 * 19. Rejection of old password after reset
 * 20. Successful sign-in with new password via Administrator Name
 * 21. Successful sign-in with new password via Administrator Email
 */

import {
  authenticateAdmin,
  getActiveAdminSession,
  isSessionAuthorized,
  logoutAdmin,
  clearLockoutState,
  getLockoutRemainingSeconds,
  requestPasswordResetOtp,
  verifyOtpAndResetPassword,
  getActiveOtpStatus,
  clearAllAuthAndOtpState,
  ADMIN_EMAIL,
  hashPassword,
  constantTimeCompare,
  generateSecureSalt,
  expireActiveOtpForTesting,
} from '../services/adminAuth';

async function runTests() {
  console.log('--- RUNNING SECURE ADMIN AUTHENTICATION & PASSWORD RESET TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // Clear previous state before testing
  clearAllAuthAndOtpState();

  // Test 1: Block access without authorization
  assert(
    getActiveAdminSession() === null,
    'Initial state has no active session'
  );
  assert(
    isSessionAuthorized() === false,
    'Access is strictly blocked without valid authentication session'
  );

  // Test 2: Rejection of empty credentials
  const emptyRes = authenticateAdmin('', '');
  assert(
    emptyRes.success === false && Boolean(emptyRes.error),
    'Rejects empty credentials with appropriate error message'
  );

  // Test 3: Rejection of incorrect name
  const wrongNameRes = authenticateAdmin('HackerUser', 'OnsetStudio2026!');
  assert(
    wrongNameRes.success === false && wrongNameRes.session === undefined,
    'Rejects unauthorized admin name'
  );

  // Test 4: Rejection of incorrect password
  const wrongPassRes = authenticateAdmin('Onset Admin', 'WrongPassword123');
  assert(
    wrongPassRes.success === false && wrongPassRes.session === undefined,
    'Rejects incorrect password for authorized administrator'
  );

  // Test 5: Successful sign-in with valid Administrator Name
  clearLockoutState();
  const validRes = authenticateAdmin('Onset Admin', 'OnsetStudio2026!');
  assert(
    validRes.success === true && Boolean(validRes.session?.token),
    'Successful sign-in via Administrator Name returns authenticated session token'
  );
  assert(
    isSessionAuthorized() === true,
    'Authorizes access when valid session is stored'
  );
  assert(
    getActiveAdminSession()?.adminName === 'Onset Admin',
    'Active session retains authenticated administrator name'
  );

  // Test 6: Successful sign-in with valid Administrator Email
  logoutAdmin();
  clearLockoutState();
  const validEmailRes = authenticateAdmin(ADMIN_EMAIL, 'OnsetStudio2026!');
  assert(
    validEmailRes.success === true && Boolean(validEmailRes.session?.token),
    'Successful sign-in via Administrator Email returns authenticated session token'
  );

  // Test 7: Logout invalidation
  logoutAdmin();
  assert(
    getActiveAdminSession() === null,
    'Admin logout removes session token completely'
  );
  assert(
    isSessionAuthorized() === false,
    'Access is blocked immediately following logout'
  );

  // Test 8: Rate-limiting / brute-force lockout protection
  clearLockoutState();
  for (let i = 0; i < 4; i++) {
    authenticateAdmin('Onset Admin', 'BadGuess');
  }
  const fifthAttempt = authenticateAdmin('Onset Admin', 'BadGuess');
  assert(
    fifthAttempt.success === false &&
      fifthAttempt.error?.toLowerCase().includes('locked') === true,
    'Triggers security lockout after consecutive failed attempts'
  );
  assert(
    getLockoutRemainingSeconds() > 0,
    'Lockout timer activates and enforces security delay'
  );

  // Locked out attempt even with valid credentials
  const lockedOutValidAttempt = authenticateAdmin('Onset Admin', 'OnsetStudio2026!');
  assert(
    lockedOutValidAttempt.success === false &&
      lockedOutValidAttempt.error?.includes('lockout') === true,
    'Blocks even valid credentials while lockout is in effect'
  );

  // Test 9: Cryptographic Salted Hashing & Constant-time comparison
  const salt = generateSecureSalt(16);
  const hash1 = hashPassword('MySecretPass123', salt, 50);
  const hash2 = hashPassword('MySecretPass123', salt, 50);
  const hash3 = hashPassword('DifferentPass456', salt, 50);
  assert(
    hash1 === hash2 && constantTimeCompare(hash1, hash2) === true,
    'Deterministic password hashing with same salt verifies correctly'
  );
  assert(
    hash1 !== hash3 && constantTimeCompare(hash1, hash3) === false,
    'Different passwords yield distinct hashes and constantTimeCompare returns false'
  );

  // --- FORGOT PASSWORD & EMAIL OTP TEST SUITE ---
  clearAllAuthAndOtpState();

  // Test 10: Anti-Enumeration Protection
  const unregisteredRes = await requestPasswordResetOtp('attacker@unknown-domain.com');
  assert(
    unregisteredRes.success === true &&
      unregisteredRes.message.includes('authorized administrator') &&
      unregisteredRes.simulatedDevOtp === undefined,
    'Anti-enumeration: Neutral response returned for unregistered email, no OTP issued'
  );

  // Clear state for registered test
  clearAllAuthAndOtpState();

  // Test 11: Request OTP for registered administrator Gmail address
  const registeredRes = await requestPasswordResetOtp(ADMIN_EMAIL);
  assert(
    registeredRes.success === true &&
      registeredRes.message.includes('authorized administrator') &&
      Boolean(registeredRes.simulatedDevOtp),
    'Registered admin email receives valid verification OTP code'
  );
  const validOtp = registeredRes.simulatedDevOtp!;

  // Test 12: Rate Limiting / Cooldown on OTP requests
  const immediateReRequest = await requestPasswordResetOtp(ADMIN_EMAIL);
  assert(
    immediateReRequest.success === false &&
      immediateReRequest.message.includes('wait') &&
      (immediateReRequest.cooldownSeconds ?? 0) > 0,
    'Enforces cooldown rate limit between consecutive OTP requests'
  );

  // Test 13: Rejection of invalid OTP code & attempt counter decrement
  const wrongOtpRes = verifyOtpAndResetPassword(ADMIN_EMAIL, '000000', 'NewSecurePass2026!');
  assert(
    wrongOtpRes.success === false &&
      wrongOtpRes.error?.includes('Invalid verification code') === true,
    'Rejects incorrect OTP code'
  );
  const statusAfter1Fail = getActiveOtpStatus(ADMIN_EMAIL);
  assert(
    statusAfter1Fail !== null && statusAfter1Fail.attemptsLeft === 4,
    'Decrements attemptsLeft counter following invalid attempt (4 remaining)'
  );

  // Test 14: Attempt exhaustion & complete invalidation after repeated failed attempts
  verifyOtpAndResetPassword(ADMIN_EMAIL, '111111', 'NewSecurePass2026!');
  verifyOtpAndResetPassword(ADMIN_EMAIL, '222222', 'NewSecurePass2026!');
  verifyOtpAndResetPassword(ADMIN_EMAIL, '333333', 'NewSecurePass2026!');
  const finalFail = verifyOtpAndResetPassword(ADMIN_EMAIL, '444444', 'NewSecurePass2026!');
  assert(
    finalFail.success === false &&
      finalFail.error?.includes('Maximum attempts reached') === true,
    'Exhausts attempts and invalidates OTP upon 5 failed tries'
  );
  assert(
    getActiveOtpStatus(ADMIN_EMAIL) === null,
    'OTP is completely wiped from storage after max failed attempts'
  );

  // Trying with the originally correct OTP now fails because code was destroyed
  const retryOriginalAfterExhaustion = verifyOtpAndResetPassword(
    ADMIN_EMAIL,
    validOtp,
    'NewSecurePass2026!'
  );
  assert(
    retryOriginalAfterExhaustion.success === false,
    'Destroyed OTP cannot be used even if code was originally valid'
  );

  // Test 15: Expired OTP rejection
  clearAllAuthAndOtpState();
  const freshOtpRes = await requestPasswordResetOtp(ADMIN_EMAIL);
  const freshOtp = freshOtpRes.simulatedDevOtp!;
  expireActiveOtpForTesting();

  // Attempting reset with expired OTP
  const expiredRes = verifyOtpAndResetPassword(ADMIN_EMAIL, freshOtp, 'NewSecurePass2026!');
  assert(
    expiredRes.success === false &&
      expiredRes.error?.toLowerCase().includes('expired') === true,
    'Rejects expired OTP and invalidates record'
  );

  // Test 16: Successful reset flow with valid OTP & new password
  clearAllAuthAndOtpState();
  // Establish an active session first to test that reset terminates it
  authenticateAdmin('Onset Admin', 'OnsetStudio2026!');
  assert(isSessionAuthorized() === true, 'Admin session active prior to password reset');

  const resetReq = await requestPasswordResetOtp(ADMIN_EMAIL);
  const resetOtp = resetReq.simulatedDevOtp!;
  const newPass = 'BrandNewMasterPass2026#';

  const resetSuccess = verifyOtpAndResetPassword(ADMIN_EMAIL, resetOtp, newPass);
  assert(
    resetSuccess.success === true &&
      resetSuccess.message?.includes('successfully') === true,
    'Successfully resets password with valid OTP and strong new password'
  );

  // Test 17: Active session terminated upon reset
  assert(
    getActiveAdminSession() === null && isSessionAuthorized() === false,
    'Terminates all active admin sessions immediately upon password reset'
  );

  // Test 18: Invalidation of used OTP code (cannot be reused)
  const reuseRes = verifyOtpAndResetPassword(ADMIN_EMAIL, resetOtp, 'AnotherPass2026!');
  assert(
    reuseRes.success === false &&
      reuseRes.error?.includes('No active password reset request') === true,
    'Rejects reused OTP (single-use constraint enforced)'
  );

  // Test 19: Old passwords rejected after password reset
  const oldPass1Login = authenticateAdmin('Onset Admin', 'OnsetStudio2026!');
  assert(
    oldPass1Login.success === false,
    'Old password OnsetStudio2026! is no longer accepted after password reset'
  );

  const oldPass2Login = authenticateAdmin('Onset Admin', 'ronnyfilms');
  assert(
    oldPass2Login.success === false,
    'Old password ronnyfilms is no longer accepted after password reset'
  );

  // Test 20: Administrator successfully signs in with new password via Name
  const newPassLoginByName = authenticateAdmin('Onset Admin', newPass);
  assert(
    newPassLoginByName.success === true &&
      newPassLoginByName.session?.adminName === 'Onset Admin',
    'Administrator successfully signs in with new password via Name'
  );

  // Test 21: Administrator successfully signs in with new password via Email
  logoutAdmin();
  clearLockoutState();
  const newPassLoginByEmail = authenticateAdmin(ADMIN_EMAIL, newPass);
  assert(
    newPassLoginByEmail.success === true &&
      Boolean(newPassLoginByEmail.session?.token),
    'Administrator successfully signs in with new password via registered Email'
  );

  // Clean up
  clearAllAuthAndOtpState();

  console.log(`\nTEST SUMMARY: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
