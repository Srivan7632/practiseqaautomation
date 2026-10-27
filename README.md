# Practice QA Automation — TrustBank

Playwright and TypeScript tests for the weekend banking assignment.

## Run the assignment

Install dependencies and Chromium once:

```bash
npm ci
npx playwright install chromium
```

Run the test:

```bash
npx playwright test tests/bank.spec.ts
```

The test uses one browser tab and one login for the full journey: login, hide
balances, reveal balances, click **View all**, filter credits, switch to debits,
search all transactions for Swiggy, and log out. Direct dashboard navigation
after logout checks that authentication is required again.

## Structure

- `tests/bank.spec.ts`: assignment scenario with named report steps.
- `fixtures/bank.fixture.ts`: supplies page objects sharing the test's browser tab.
- `pages/`: login, dashboard, and transaction actions and assertions.
- `test-data/bank.data.ts`: public demo credentials and search text.
- `support/demo.ts`: 2.5-second presentation pauses for the visible demonstration.
- `playwright.config.ts`: visible Chromium, failure traces, and reports.

Balance checks verify masking when hidden and visible currency amounts when
revealed, without saving amounts or comparing them with earlier values. Transaction
checks require nonempty results and inspect the correct column on every page.
The search clears the previous debit filter to include credits and debits.

Open the report with `npm run test:report`. Failed runs retain a trace for debugging.
Browser operations use Playwright's automatic waiting without forced slow motion.
For the demonstration, explicit 2.5-second pauses keep the login stages, verified
step results, and intermediate transaction pages visible. Adjust `DEMO_PAUSE_MS`
in `support/demo.ts` to change the pace. These pauses do not replace assertions.
The journey has a three-minute timeout for the full sequence and result pages.
Internet access and available demo data are required.
The checks verify displayed behavior; they do not establish financial correctness
or independently prove that every matching transaction has been returned.
