import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  retries: 0,
  reporter: [
    ['list'],       // Shows tick/cross marks per test in terminal
    ['html', { open: 'never' }], // HTML report saved but not auto-opened
  ],
  use: {
    headless: false,          // Headed mode: browser window is visible
    slowMo: 3000,             // 3 sec pause between every action — looks like manual testing
    baseURL: 'https://www.practiceqaautomation.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
