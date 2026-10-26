import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/apps/bank');
    await this.expectLoginFormVisible();
  }

  async signIn(customerId: string, password: string, securityAnswer: string): Promise<void> {
    await this.page.locator('#customer-id').fill(customerId);
    await this.page.locator('#bank-password').fill(password);
    await this.page.getByRole('button', { name: 'Continue', exact: true }).click();

    const answer = this.page.locator('#security-answer');
    await expect(answer, 'Security answer should be editable').toBeEditable();
    await answer.fill(securityAnswer);
    await this.page.getByRole('button', { name: 'Sign in', exact: true }).click();
  }

  async expectLoginFormVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/\/apps\/bank\/?$/);
    await expect(this.page.locator('#customer-id'), 'Customer ID should be visible').toBeVisible();
    await expect(this.page.locator('#customer-id')).toBeEditable();
    await expect(this.page.locator('#bank-password'), 'Password should be visible').toBeVisible();
    await expect(this.page.locator('#bank-password')).toBeEditable();
  }

  async expectDashboardRequiresLogin(): Promise<void> {
    // Direct navigation here deliberately checks access after logout.
    await this.page.goto('/apps/bank/dashboard');
    await this.expectLoginFormVisible();
    await expect(this.page.getByTestId('account-savings')).not.toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Log out', exact: true })).not.toBeVisible();
  }
}
