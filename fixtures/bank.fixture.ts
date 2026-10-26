import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { TransactionsPage } from '../pages/transactions.page';

type BankFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  transactionsPage: TransactionsPage;
};

// Every page object uses the same test-scoped page and browser session.
export const test = base.extend<BankFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  transactionsPage: async ({ page }, use) => {
    await use(new TransactionsPage(page));
  },
});
