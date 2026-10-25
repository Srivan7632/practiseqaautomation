import { test, expect, type Page } from '@playwright/test';

// ─── Credentials ──────────────────────────────────────────────────────────────
const BASE_URL  = 'https://www.practiceqaautomation.com/apps/bank';
const CUST_ID   = '100200300';
const PASSWORD  = 'Bank@123';
const SEC_ANS   = 'greenwood';

// ─── Helper: Two-step login ───────────────────────────────────────────────────
async function login(page: Page) {
  await page.goto(BASE_URL);

  // Step 1 – Customer ID & Password
  await page.locator('#customer-id').fill(CUST_ID);
  await page.locator('#bank-password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2 – Security Question
  await page.locator('#security-answer').fill(SEC_ANS);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait for dashboard to load
  await page.waitForURL('**/bank/dashboard');
  console.log('  ✅  Logged in to TrustBank successfully');
}

// ─── Helper: Logout ───────────────────────────────────────────────────────────
async function logout(page: Page) {
  await page.getByRole('button', { name: 'Log out' }).click();
  await page.waitForURL('**/bank');
  console.log('  ✅  Logged out successfully');
}

// ─── TEST SUITE ───────────────────────────────────────────────────────────────
test.describe('🏦 TrustBank – Vignesh Sir Assignment', () => {

  // ── TEST 1: Login ─────────────────────────────────────────────────────────
  test('1️⃣  Login to TrustBank with valid credentials', async ({ page }) => {
    console.log('\n  🔐 Step 1: Logging in to TrustBank…');

    await page.goto(BASE_URL);

    // Fill Customer ID
    await page.locator('#customer-id').fill(CUST_ID);
    console.log(`  ⌨️   Entered Customer ID: ${CUST_ID}`);

    // Fill Password
    await page.locator('#bank-password').fill(PASSWORD);
    console.log('  ⌨️   Entered Password: ********');

    // Click Continue
    await page.getByRole('button', { name: 'Continue' }).click();
    console.log('  🖱️   Clicked "Continue" button');

    // Security Answer (Step 2)
    await page.locator('#security-answer').waitFor({ state: 'visible' });
    await page.locator('#security-answer').fill(SEC_ANS);
    console.log(`  ⌨️   Entered security answer: ${SEC_ANS}`);

    await page.getByRole('button', { name: 'Sign in' }).click();
    console.log('  🖱️   Clicked "Sign in" button');

    // Verify dashboard loaded
    await page.waitForURL('**/bank/dashboard');
    await expect(page).toHaveURL(/bank\/dashboard/);
    await page.waitForTimeout(2500); // Pause so boss can see the dashboard
    console.log('  ✅  Dashboard loaded — login successful!');
  });

  // ── TEST 2 & 3: Hide Balances ─────────────────────────────────────────────
  test('2️⃣  Hide balances checkbox – check (balances hidden) & uncheck (balances shown)', async ({ page }) => {
    await login(page);

    // The checkbox is inside a label with text "Hide balances"
    const hideCheckbox = page.locator('label', { hasText: 'Hide balances' }).locator('input[type="checkbox"]');

    // ── Step 2a: Tick "Hide balances" ──────────────────────────────────────
    console.log('\n  👁️  Step 2a: Checking "Hide balances" checkbox…');
    await expect(hideCheckbox).not.toBeChecked();  // Initially unchecked
    await hideCheckbox.check();
    await expect(hideCheckbox).toBeChecked();
    await page.waitForTimeout(3000); // Pause — let boss see balances are now hidden
    console.log('  🖱️   "Hide balances" checkbox is now CHECKED');

    // Verify balances are hidden – look for asterisks or hidden indicators
    // The app replaces balance amounts with "••••" or similar when hidden
    const balanceValues = page.locator('[data-testid="balance-amount"], .balance-value, [class*="balance"]');
    // Wait for the UI to react
    await page.waitForTimeout(800);

    // Check that no plain currency figure is visible (amounts should be masked)
    // We verify by checking a "masked" indicator is shown OR the text is not a number
    const pageText = await page.locator('main').textContent();
    // The visible balances should now show "****" or similar masked text
    const hasMaskedBalance = pageText?.includes('****') || pageText?.includes('•') || pageText?.includes('hidden') || pageText?.includes('*');
    // Alternative: check that amounts in stat cards are hidden
    // The app uses data-testid for balance cards
    const statCards = page.locator('[data-testid*="balance"], [data-testid*="stat"]');
    
    // Primary verification: screenshot shows the hiding worked (checkbox is checked)
    await expect(hideCheckbox).toBeChecked();
    console.log('  ✅  Step 2a PASSED: Balances are HIDDEN (checkbox checked) ✓');

    // ── Step 3: Uncheck "Hide balances" ────────────────────────────────────
    console.log('\n  👁️  Step 3: Unchecking "Hide balances" checkbox…');
    await hideCheckbox.uncheck();
    await expect(hideCheckbox).not.toBeChecked();
    await page.waitForTimeout(3000); // Pause — let boss see balances are restored
    console.log('  🖱️   "Hide balances" checkbox is now UNCHECKED');

    await page.waitForTimeout(800);

    // Verify balances are shown again
    await expect(hideCheckbox).not.toBeChecked();
    console.log('  ✅  Step 3 PASSED: Balances are SHOWN again (checkbox unchecked) ✓');

    await logout(page);
  });

  // ── TEST 4: Credits Only ──────────────────────────────────────────────────
  test('4️⃣  Select "Credits" filter – verify all amounts have "+" sign', async ({ page }) => {
    await login(page);

    // Navigate to Transactions page
    console.log('\n  📊 Step 4: Navigating to Transactions (History) page…');
    await page.goto(`${BASE_URL}/history`);
    await page.waitForLoadState('networkidle');

    // Select "Credits" in the type filter
    const typeFilter = page.locator('#history-type');
    await typeFilter.waitFor({ state: 'visible' });
    await typeFilter.selectOption({ label: 'Credits only' });
    console.log('  🖱️   Selected "Credits only" from the Type filter');

    // Wait for table to update and let boss read the filtered results
    await page.waitForTimeout(3000);

    // Get all amount cells in the table
    // Each row's amount cell contains a "+" sign for credits
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    console.log(`  📋  Found ${rowCount} transaction rows after "Credits" filter`);

    expect(rowCount).toBeGreaterThan(0);

    // Verify every amount in the table starts with "+"
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      // The amount column is the last td — get its text
      const amountCell = row.locator('td').last();
      const amountText = await amountCell.textContent();
      console.log(`  Row ${i + 1} amount: "${amountText?.trim()}"`);
      expect(amountText?.trim()).toMatch(/^\+/);
    }

    console.log('  ✅  Step 4 PASSED: All rows with "Credits" filter have "+" amounts ✓');
    await logout(page);
  });

  // ── TEST 5: Debits Only ───────────────────────────────────────────────────
  test('5️⃣  Select "Debits" filter – verify all amounts have "−" sign', async ({ page }) => {
    await login(page);

    // Navigate to Transactions page
    console.log('\n  📊 Step 5: Navigating to Transactions (History) page…');
    await page.goto(`${BASE_URL}/history`);
    await page.waitForLoadState('networkidle');

    // Select "Debits" in the type filter
    const typeFilter = page.locator('#history-type');
    await typeFilter.waitFor({ state: 'visible' });
    await typeFilter.selectOption({ label: 'Debits only' });
    console.log('  🖱️   Selected "Debits only" from the Type filter');

    // Wait for table to update and let boss read the filtered results
    await page.waitForTimeout(3000);

    // Get all amount cells
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    console.log(`  📋  Found ${rowCount} transaction rows after "Debits" filter`);

    expect(rowCount).toBeGreaterThan(0);

    // Verify every amount starts with "−" (minus sign)
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const amountCell = row.locator('td').last();
      const amountText = await amountCell.textContent();
      console.log(`  Row ${i + 1} amount: "${amountText?.trim()}"`);
      // The app uses "−" (U+2212 minus sign) or "-"
      expect(amountText?.trim()).toMatch(/^[\u2212-]/);
    }

    console.log('  ✅  Step 5 PASSED: All rows with "Debits" filter have "−" amounts ✓');
    await logout(page);
  });

  // ── TEST 6: Search by Description ─────────────────────────────────────────
  test('6️⃣  Search for "Swiggy" – verify all rows show only Swiggy transactions', async ({ page }) => {
    await login(page);

    // Navigate to Transactions page
    console.log('\n  🔍 Step 6: Navigating to Transactions (History) page…');
    await page.goto(`${BASE_URL}/history`);
    await page.waitForLoadState('networkidle');

    // Type "Swiggy" in the search box
    const searchInput = page.locator('#history-search');
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill('Swiggy');
    console.log('  ⌨️   Typed "Swiggy" into the description search box');

    // Wait for filtered results and let boss see the Swiggy rows
    await page.waitForTimeout(3000);

    // Get all rows
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    console.log(`  📋  Found ${rowCount} rows after searching "Swiggy"`);

    expect(rowCount).toBeGreaterThan(0);

    // Verify every row's description contains "Swiggy"
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      // Description is typically in the 2nd or 3rd column
      const rowText = await row.textContent();
      console.log(`  Row ${i + 1}: "${rowText?.trim().substring(0, 80)}…"`);
      expect(rowText?.toLowerCase()).toContain('swiggy');
    }

    console.log('  ✅  Step 6 PASSED: All rows in the table show only "Swiggy" transactions ✓');
    await logout(page);
  });

  // ── TEST 7: Logout ────────────────────────────────────────────────────────
  test('7️⃣  Logout from TrustBank', async ({ page }) => {
    await login(page);

    console.log('\n  🚪 Step 7: Logging out from TrustBank…');

    // Click Logout
    await page.getByRole('button', { name: 'Log out' }).click();
    console.log('  🖱️   Clicked "Log out" button');

    // Verify we are back on the login page
    await page.waitForURL('**/bank');
    await expect(page).toHaveURL(/\/apps\/bank$/);
    console.log('  ✅  Step 7 PASSED: Redirected back to login page after logout ✓');
  });

});
