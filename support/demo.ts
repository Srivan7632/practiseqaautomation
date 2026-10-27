import { type Page } from '@playwright/test';

// Presentation pacing only. Assertions still determine whether the application is ready.
// Change this value to adjust how long each demonstrated state stays on screen.
export const DEMO_PAUSE_MS = 2500;

export async function pauseForDemo(page: Page): Promise<void> {
  await page.waitForTimeout(DEMO_PAUSE_MS);
}
