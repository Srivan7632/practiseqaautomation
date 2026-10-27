import { test } from '../fixtures/bank.fixture';
import { bankData } from '../test-data/bank.data';
import { pauseForDemo } from '../support/demo';

test('TrustBank: complete the assignment in one browser session', async ({
  page,
  loginPage,
  dashboardPage,
  transactionsPage,
}) => {
  // Allow time for the complete journey, including all transaction result pages.
  test.setTimeout(180_000);

  async function showStep(title: string, action: () => Promise<void>): Promise<void> {
    await test.step(title, async () => {
      await action();
      // Let the viewer see the verified result before the next action.
      await pauseForDemo(page);
    });
  }

  await showStep('1. Log in and verify the dashboard', async () => {
    await loginPage.open();
    await loginPage.signIn(bankData.customerId, bankData.password, bankData.securityAnswer);
    await dashboardPage.expectLoaded();
  });

  await showStep('Verify balances display currency amounts before hiding', async () => {
    await dashboardPage.expectBalancesVisible();
  });

  await showStep('2. Check Hide balances and verify every amount is masked', async () => {
    await dashboardPage.setBalancesHidden(true);
    await dashboardPage.expectBalancesHidden();
  });

  await showStep('3. Uncheck Hide balances and verify currency amounts are visible again', async () => {
    await dashboardPage.setBalancesHidden(false);
    await dashboardPage.expectBalancesVisible();
  });

  await showStep('Open transaction history using View all', async () => {
    await dashboardPage.openTransactionHistory();
  });

  await showStep('4. Select Credits only and check amounts on every page', async () => {
    await transactionsPage.selectType('credit');
    await transactionsPage.expectOnlyCredits();
  });

  await showStep('5. Switch to Debits only and check amounts on every page', async () => {
    await transactionsPage.selectType('debit');
    await transactionsPage.expectOnlyDebits();
  });

  await showStep('6. Search all transactions and verify only Swiggy descriptions', async () => {
    // Remove the debit filter so the search includes both credits and debits.
    await transactionsPage.selectType('all');
    await transactionsPage.search(bankData.description);
    await transactionsPage.expectDescriptionsContaining(bankData.description);
  });

  await showStep('7. Log out and verify the dashboard requires login again', async () => {
    await dashboardPage.logout();
    await loginPage.expectLoginFormVisible();
    await loginPage.expectDashboardRequiresLogin();
  });
});
