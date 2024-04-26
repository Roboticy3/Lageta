import { test, expect, type Page } from '@playwright/test';

const root = 'http://localhost:5173/'

/**
 * Click a button... safely. Fixes main menu Continue test not working on chromium, and hopefully stabilizes other button tests too
 * 
 * https://stackoverflow.com/questions/74301319/playwright-click-button-does-not-work-reliably-flaky
 * @param page 
 * @param title 
 */
const safeClick = async (page:Page, title:string) => {
  await page.waitForLoadState('networkidle'); // <-  until there are no network connections for at least 500 ms.
  const element = page.getByTitle("Continue")
  await element.waitFor()
  await element.click()
}

test('did Pablo remember to run "npm run dev -- --open?"', async ({ page }) => {
  await page.goto(root).catch(() => console.log("no!"))
})

test('has title', async ({ page }) => {
  await page.goto(root);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Lageta/);
});

test('opening campaign', async ({ page }) => {
  await page.goto(root);
  safeClick(page, "Continue")
  await page.waitForURL(root + "campaign/")
});