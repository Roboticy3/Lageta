import { test, expect, type Page } from '@playwright/test';
import { root } from './resources';
import { goto } from '$app/navigation';

test('page up', async ({ page }) => {
  await page.goto(root);
});

async function gotoTutorial(page:Page) {
  //nav to home
  await page.goto(root);

  //clear local storage
  await page.evaluate(() => {localStorage.clear()})

  //get the tutorial button and click it to navigate to the tutorial
  await page.locator('button', {hasText: /Tutorial/}).click()
  await page.waitForURL(/Tutorial/)
}
test('tutorial button', async ({ page }) => {
  await gotoTutorial(page)
})