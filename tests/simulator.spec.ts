import { test, expect } from '@playwright/test';
import { gameViewComponentTitles, root } from './resources';

test('ui exists', async ({ page }) => {
  await page.goto(root + 'level/Simple%20Calculator')

  for (let title of gameViewComponentTitles) { 
    await expect(page.getByTitle(title)).toHaveCount(1)
  }
});