import { expect, type Locator, type Page } from '@playwright/test';

type AccountName = 'savings' | 'current' | 'creditCard';

export class DashboardPage {
  readonly hideBalancesCheckbox: Locator;
  private readonly balances: Record<AccountName, Locator>;

  constructor(private readonly page: Page) {
    this.hideBalancesCheckbox = page.getByTestId('hide-balances');
    this.balances = {
      savings: page.getByTestId('balance-savings'),
      current: page.getByTestId('balance-current'),
      // The credit card amount has no separate test ID on the demo site.
      creditCard: page.getByTestId('account-credit-card').locator('p').nth(2),
    };
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/bank\/dashboard\/?$/);
    await expect(this.page.getByTestId('customer-name')).toBeVisible();
    await expect(this.page.getByTestId('customer-name')).not.toHaveText(/^\s*$/);
    await expect(this.page.getByTestId('account-savings')).toBeVisible();
    await expect(this.hideBalancesCheckbox).toBeVisible();
  }

  async expectBalancesVisible(): Promise<void> {
    await expect(this.hideBalancesCheckbox).not.toBeChecked();
    for (const [account, balance] of Object.entries(this.balances)) {
      await expect(balance, `${account} balance should be visible`).toBeVisible();
      await expect(balance, `${account} should display a currency amount`)
        .toHaveText(/^₹\s*[\d,]+\.\d{2}$/);
    }
  }

  async setBalancesHidden(hidden: boolean): Promise<void> {
    await this.hideBalancesCheckbox.setChecked(hidden);
  }

  async expectBalancesHidden(): Promise<void> {
    await expect(this.hideBalancesCheckbox).toBeChecked();
    for (const [account, balance] of Object.entries(this.balances)) {
      await expect(balance).toBeVisible();
      await expect(balance, `${account} balance should be masked`).toHaveText('₹ ••••••');
      await expect(balance, `${account} balance should expose no digits`).not.toContainText(/[0-9]/);
    }
  }

  async openTransactionHistory(): Promise<void> {
    await this.page.getByRole('link', { name: 'View all →', exact: true }).click();
    await expect(this.page).toHaveURL(/\/bank\/history\/?$/);
  }

  async logout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Log out', exact: true }).click();
    await expect(this.page.getByTestId('customer-name')).not.toBeVisible();
    await expect(this.hideBalancesCheckbox).not.toBeVisible();
  }
}
