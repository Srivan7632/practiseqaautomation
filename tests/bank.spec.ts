import { test } from '../fixtures/bank.fixture';
import { bankData } from '../test-data/bank.data';

test('TrustBank: complete the assignment in one browser session', async ({
  loginPage,
  dashboardPage,
  transactionsPage,
}) => {
  // Allow time for the full journey with the configured three-second slow motion.
  test.setTimeout(180_000);

  await test.step('1. Log in and verify the dashboard', async () => {
    await loginPage.open();
    await loginPage.signIn(bankData.customerId, bankData.password, bankData.securityAnswer);
    await dashboardPage.expectLoaded();
  });

  const originalBalances = await test.step('Capture the original account balances', async () => {
    return await dashboardPage.captureBalances();
  });

  await test.step('2. Check Hide balances and verify every amount is masked', async () => {
    await dashboardPage.setBalancesHidden(true);
    await dashboardPage.expectBalancesHidden();
  });

  await test.step('3. Uncheck Hide balances and verify the original amounts return', async () => {
    await dashboardPage.setBalancesHidden(false);
    await dashboardPage.expectBalancesRestored(originalBalances);
  });

  await test.step('Open transaction history using View all', async () => {
    await dashboardPage.openTransactionHistory();
  });

  await test.step('4. Select Credits only and check amounts on every page', async () => {
    await transactionsPage.selectType('credit');
    await transactionsPage.expectOnlyCredits();
  });

  await test.step('5. Switch to Debits only and check amounts on every page', async () => {
    await transactionsPage.selectType('debit');
    await transactionsPage.expectOnlyDebits();
  });

  await test.step('6. Search all transactions and verify only Swiggy descriptions', async () => {
    // Remove the debit filter so the search includes both credits and debits.
    await transactionsPage.selectType('all');
    await transactionsPage.search(bankData.description);
    await transactionsPage.expectDescriptionsContaining(bankData.description);
  });

  await test.step('7. Log out and verify the dashboard requires login again', async () => {
    await dashboardPage.logout();
    await loginPage.expectLoginFormVisible();
    await loginPage.expectDashboardRequiresLogin();
  });
});
