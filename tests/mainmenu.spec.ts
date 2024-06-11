import { test, expect, type Page } from '@playwright/test';
import { gotoTutorial, root } from './resources';
import { goto } from '$app/navigation';

test('page up', async ({ page }) => {
  await page.goto(root);
});

test('tutorial button', async ({ page }) => {
  await gotoTutorial(page)
})

test('campaign button', async ({ page }) => {
  await gotoTutorial(page)
})