import { test, expect } from '@playwright/test';

const root = 'http://localhost:5173/'

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
  await page.waitForLoadState('networkidle'); // <-  until there are no network connections for at least 500 ms.
  await page.getByTitle("Continue").waitFor()
  await page.getByTitle("Continue").click()

  await page.waitForURL(root + "campaign/")
});