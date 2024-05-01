import { test, expect, type Page } from '@playwright/test';
import { root, safeClick } from './helpers';

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
  await safeClick(page, "[title=Continue]")
  await page.waitForURL(root + "campaign/")
});

