import { expect, type Locator, type Page } from '@playwright/test';

export type BalanceSnapshot = {
  savings: string;
  current: string;
  creditCard: string;
};

export class DashboardPage {
  readonly hideBalancesCheckbox: Locator;
  private readonly balances: Record<keyof BalanceSnapshot, Locator>;

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

  async captureBalances(): Promise<BalanceSnapshot> {
    await expect(this.hideBalancesCheckbox).not.toBeChecked();
    for (const [account, balance] of Object.entries(this.balances)) {
      await expect(balance, `${account} balance should be visible`).toBeVisible();
      await expect(balance, `${account} should display a currency amount`)
        .toHaveText(/^₹\s*[\d,]+\.\d{2}$/);
    }

    return {
      savings: (await this.balances.savings.innerText()).trim(),
      current: (await this.balances.current.innerText()).trim(),
      creditCard: (await this.balances.creditCard.innerText()).trim(),
    };
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

  async expectBalancesRestored(original: BalanceSnapshot): Promise<void> {
    await expect(this.hideBalancesCheckbox).not.toBeChecked();
    for (const account of Object.keys(this.balances) as (keyof BalanceSnapshot)[]) {
      await expect(this.balances[account]).toBeVisible();
      await expect(this.balances[account], `${account} balance should match its original value`)
        .toHaveText(original[account], { useInnerText: true });
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
