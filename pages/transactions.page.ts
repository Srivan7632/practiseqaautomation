import { expect, type Locator, type Page } from '@playwright/test';

type TransactionType = 'all' | 'credit' | 'debit';

export class TransactionsPage {
  readonly typeFilter: Locator;
  readonly searchInput: Locator;
  private readonly table: Locator;

  constructor(private readonly page: Page) {
    this.typeFilter = page.locator('#history-type');
    this.searchInput = page.locator('#history-search');
    this.table = page.getByTestId('history-table');
  }

  async selectType(type: TransactionType): Promise<void> {
    await this.typeFilter.selectOption(type);
    await expect(this.typeFilter).toHaveValue(type);
    // Each filter change should reset pagination to the first page.
    await expect(this.page.getByTestId('page-info')).toHaveText(/^Page 1 of \d+$/);
  }

  async expectOnlyCredits(): Promise<void> {
    await expect(this.typeFilter).toHaveValue('credit');
    await this.checkEveryResultPage('Amount', /^\s*\+\s*₹\s*[\d,]+\.\d{2}\s*$/);
  }

  async expectOnlyDebits(): Promise<void> {
    await expect(this.typeFilter).toHaveValue('debit');
    await this.checkEveryResultPage('Amount', /^\s*[−-]\s*₹\s*[\d,]+\.\d{2}\s*$/);
  }

  async search(description: string): Promise<void> {
    await this.searchInput.fill(description);
    await expect(this.searchInput).toHaveValue(description);
    await expect(this.page.getByTestId('page-info')).toHaveText(/^Page 1 of \d+$/);
  }

  async expectDescriptionsContaining(description: string): Promise<void> {
    await expect(this.searchInput).toHaveValue(description);
    await this.checkEveryResultPage('Description', description);
  }

  private async checkEveryResultPage(
    column: 'Amount' | 'Description',
    expectedText: RegExp | string,
  ): Promise<void> {
    const headings = ['Date', 'Reference', 'Description', 'Account', 'Amount'];
    await expect(this.table.getByRole('columnheader')).toHaveText(headings);
    const columnIndex = headings.indexOf(column);
    const rows = this.table.getByTestId('history-row');
    const nextButton = this.page.getByTestId('page-next');
    const pageInfo = this.page.getByTestId('page-info');
    let pageNumber = 1;

    while (true) {
      await expect(pageInfo).toHaveText(new RegExp(`^Page ${pageNumber} of \\d+$`));
      await expect(this.table).toBeVisible();
      // An empty result must not skip every assertion and pass.
      await expect(rows.first(), 'Filtered results should contain at least one row').toBeVisible();
      const rowCount = await rows.count();

      for (let i = 0; i < rowCount; i++) {
        const cell = rows.nth(i).getByRole('cell').nth(columnIndex);
        const message = `${column}, page ${pageNumber}, row ${i + 1}`;
        await expect(cell, message).toBeVisible();
        if (typeof expectedText === 'string') {
          await expect(cell, message).toContainText(expectedText, { ignoreCase: true });
        } else {
          await expect(cell, message).toHaveText(expectedText);
        }
      }

      if (await nextButton.isDisabled()) break;
      await nextButton.click();
      pageNumber++;
    }
  }
}
