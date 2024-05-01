import { test, expect } from '@playwright/test';
import { root, safeClick, tryLayConnection } from './helpers';

test('laying a connection in level 1', async ({ page }) => {
  await page.goto(root);
  await page.evaluate(() => {localStorage.clear()})
  await safeClick(page, "[title=Continue]")
  await page.waitForURL(root + "campaign/")

  await tryLayConnection(page, [0, 0], [1, 0])

  await safeClick(page, "#level-1-play")
  await page.waitForURL(root + "level/A Simple Start/")

  await tryLayConnection(page, [0, 0], [1, 0])
})
