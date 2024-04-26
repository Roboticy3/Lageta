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

test('test', async ({ page }) => {
  await page.goto(root);
  await page.getByRole('button', { name: "Continue" }).click();

  await page.waitForURL(root + "campaign/")
});