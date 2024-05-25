import { test, expect } from '@playwright/test';
import { root } from './resources';

test('page up', async ({ page }) => {
  await page.goto(root);
});

test('tutorial button', async ({ page }) => {
  //nav to home
  await page.goto(root);

  //clear local storage
  await page.evaluate(() => {localStorage.clear()})

  //get the tutorial button and click it to navigate to the tutorial
  await page.locator('button', {hasText: /Tutorial/}).click()
  await page.waitForURL(/Tutorial/)
})