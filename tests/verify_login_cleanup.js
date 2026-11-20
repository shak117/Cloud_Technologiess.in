const { chromium } = require('C:/Users/Admin1/AppData/Local/OpenAI/Codex/runtimes/cua_node/45309f9050f7314b/bin/node_modules/playwright');
const path = require('path');
const assert = require('assert');

const artDir = 'C:/Users/Admin1/.gemini/antigravity/brain/cd399ad1-9f87-443a-9da6-3f065e899e03';

async function runLoginVerification() {
  console.log('======================================================');
  console.log('🚀 RUNNING ADMIN LOGIN CLEANUP & SECURITY VERIFICATION');
  console.log('======================================================\n');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Clear any existing session storage before starting
  await page.goto('http://localhost:5000/admin.html');
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle' });

  // -------------------------------------------------------------
  // TEST 1: Initial Login Card Presentation & Zero Prefill
  // -------------------------------------------------------------
  console.log('Checking Test 1: Initial state & zero example/prefill...');
  const overlayVisible = await page.isVisible('#adminLoginOverlay');
  assert.strictEqual(overlayVisible, true, 'Login overlay must be visible on initial load');

  const headingText = await page.textContent('.login-title');
  assert.strictEqual(headingText.trim(), 'Cloud Technologies', 'Heading must be Cloud Technologies');

  const subtitleText = await page.textContent('.login-subtitle');
  assert.strictEqual(subtitleText.trim(), 'Portfolio CMS & Admin Security Portal', 'Subtitle must match');

  const lockIconVisible = await page.isVisible('.login-icon-box svg');
  assert.strictEqual(lockIconVisible, true, 'Lock icon must be visible');

  // Username input
  const usernamePlaceholder = await page.getAttribute('#adminUsername', 'placeholder');
  assert.strictEqual(usernamePlaceholder, 'Enter your username', 'Username placeholder must be "Enter your username"');
  
  const usernameVal = await page.inputValue('#adminUsername');
  assert.strictEqual(usernameVal, '', 'Username input must start completely empty');

  // Check no "e.g. cloud" in entire page HTML
  const pageContent = await page.content();
  assert.strictEqual(pageContent.includes('e.g. cloud'), false, 'Page must not contain "e.g. cloud"');

  // Password input
  const passwordPlaceholder = await page.getAttribute('#adminPassword', 'placeholder');
  assert.strictEqual(passwordPlaceholder, 'Enter your password', 'Password placeholder must be "Enter your password"');

  const passwordVal = await page.inputValue('#adminPassword');
  assert.strictEqual(passwordVal, '', 'Password input must start completely empty');

  const passwordType = await page.getAttribute('#adminPassword', 'type');
  assert.strictEqual(passwordType, 'password', 'Password input type must be "password" initially');

  // Submit button
  const submitText = await page.textContent('#btnLoginText');
  assert.ok(submitText.includes('Authenticate & Open Dashboard →'), 'Button text must match');

  // Save initial screenshot
  await page.screenshot({ path: path.join(artDir, 'verify_admin_login_initial.png') });
  console.log('✅ [PASS] Test 1: Initial state and placeholders verified. Saved verify_admin_login_initial.png');

  // -------------------------------------------------------------
  // TEST 2: Show/Hide Password Toggle
  // -------------------------------------------------------------
  console.log('Checking Test 2: Show/Hide password toggle...');
  await page.fill('#adminPassword', 'SecretTest123');

  // Click toggle button to show password
  await page.click('#btnTogglePassword');
  let currentType = await page.getAttribute('#adminPassword', 'type');
  assert.strictEqual(currentType, 'text', 'Password field type must change to "text" after click');

  const eyeIconHidden = await page.evaluate(() => {
    const eye = document.querySelector('#btnTogglePassword .icon-eye');
    return eye && eye.style.display === 'none';
  });
  assert.strictEqual(eyeIconHidden, true, 'Eye icon must be hidden when password visible');

  await page.screenshot({ path: path.join(artDir, 'verify_admin_login_password_revealed.png') });

  // Click toggle button again to hide password
  await page.click('#btnTogglePassword');
  currentType = await page.getAttribute('#adminPassword', 'type');
  assert.strictEqual(currentType, 'password', 'Password field type must change back to "password"');

  await page.fill('#adminPassword', '');
  console.log('✅ [PASS] Test 2: Show/Hide password toggle working correctly. Saved verify_admin_login_password_revealed.png');

  // -------------------------------------------------------------
  // TEST 3: Validation on Empty Submission & Auto-Clear on Input
  // -------------------------------------------------------------
  console.log('Checking Test 3: Empty submission error...');
  await page.click('#btnLoginSubmit');
  
  const errorVisible = await page.isVisible('#loginError');
  assert.strictEqual(errorVisible, true, 'Error message must appear on empty submit');
  const errorText = await page.textContent('#loginError');
  assert.ok(errorText.includes('Please enter both your admin username and security password.'), 'Error message text correct');

  await page.screenshot({ path: path.join(artDir, 'verify_admin_login_empty_error.png') });

  // Type in username -> error must automatically hide
  await page.fill('#adminUsername', 'c');
  const errorHiddenAfterTyping = await page.evaluate(() => {
    const err = document.getElementById('loginError');
    return !err || err.style.display === 'none' || err.textContent === '';
  });
  assert.strictEqual(errorHiddenAfterTyping, true, 'Error message must hide automatically when typing');
  await page.fill('#adminUsername', '');

  console.log('✅ [PASS] Test 3: Empty submission validation and auto-clear verified. Saved verify_admin_login_empty_error.png');

  // -------------------------------------------------------------
  // TEST 4: Invalid Credentials & Rejection Feedback
  // -------------------------------------------------------------
  console.log('Checking Test 4: Invalid credentials rejection...');
  await page.fill('#adminUsername', 'invalidAdmin');
  await page.fill('#adminPassword', 'wrongPassword!99');
  await page.click('#btnLoginSubmit');

  // Wait for error message
  await page.waitForSelector('#loginError:visible');
  const invalidErrorText = await page.textContent('#loginError');
  assert.ok(
    invalidErrorText.includes('Invalid') || invalidErrorText.includes('denied') || invalidErrorText.includes('password'),
    'Meaningful invalid credentials message displayed'
  );

  // Check that password was cleared for safety
  const passAfterFail = await page.inputValue('#adminPassword');
  assert.strictEqual(passAfterFail, '', 'Password must be cleared after invalid attempt');

  await page.screenshot({ path: path.join(artDir, 'verify_admin_login_invalid_error.png') });
  console.log('✅ [PASS] Test 4: Invalid credentials properly rejected. Saved verify_admin_login_invalid_error.png');

  // -------------------------------------------------------------
  // TEST 5: Mobile Responsive Layout (390 x 844)
  // -------------------------------------------------------------
  console.log('Checking Test 5: Mobile responsive layout...');
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://localhost:5000/admin.html');
  await mobilePage.evaluate(() => sessionStorage.clear());
  await mobilePage.reload({ waitUntil: 'networkidle' });

  const hasOverflow = await mobilePage.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  assert.strictEqual(hasOverflow, false, 'Mobile login page must not have horizontal overflow');

  await mobilePage.screenshot({ path: path.join(artDir, 'verify_admin_login_mobile.png') });
  await mobilePage.close();
  console.log('✅ [PASS] Test 5: Mobile layout verified without overflow. Saved verify_admin_login_mobile.png');

  // -------------------------------------------------------------
  // TEST 6: Valid Authentication & Enter Key Support
  // -------------------------------------------------------------
  console.log('Checking Test 6: Valid authentication via Enter key...');
  await page.fill('#adminUsername', 'cloud');
  await page.fill('#adminPassword', 'Cloud@2005');

  // Press Enter key to submit
  await page.press('#adminPassword', 'Enter');

  // Wait for login overlay to disappear and dashboard to be visible
  await page.waitForSelector('#adminLoginOverlay', { state: 'hidden', timeout: 5000 });
  const dashboardShown = await page.isVisible('.admin-layout');
  assert.strictEqual(dashboardShown, true, 'Admin dashboard layout must be visible after login');

  // Verify session storage has auth token and NO password is saved
  const storageCheck = await page.evaluate(() => {
    return {
      sessionAuth: sessionStorage.getItem('cloudtech_admin_session'),
      hasToken: !!sessionStorage.getItem('cloudtech_auth_token'),
      localKeys: Object.keys(localStorage),
      savedPassword: localStorage.getItem('password') || sessionStorage.getItem('password')
    };
  });
  assert.strictEqual(storageCheck.sessionAuth, 'true', 'Session auth flag must be set');
  assert.strictEqual(storageCheck.hasToken, true, 'Auth token must be set in sessionStorage');
  assert.strictEqual(storageCheck.savedPassword, null, 'Passwords must NEVER be saved in web storage');

  await page.screenshot({ path: path.join(artDir, 'verify_admin_authenticated_dashboard.png') });
  console.log('✅ [PASS] Test 6: Valid authentication and session storage verified. Saved verify_admin_authenticated_dashboard.png');

  await browser.close();

  console.log('\n======================================================');
  console.log('🎉 ALL LOGIN CLEANUP & SECURITY VERIFICATIONS PASSED!');
  console.log('======================================================');
}

runLoginVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
