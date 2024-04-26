import { test, expect } from "@playwright/test";
import { root, safeClick } from "./helpers";

test('first level starts unlocked', async ({ page }) => {
    await page.goto(root);

    await page.evaluate(() => {localStorage.clear()})

    await safeClick(page, "Continue")
    await page.waitForURL(root + "campaign/")

    const l = await page.getByTitle("A Simple Start")
});

/**
 * Check that the first level starts unavailable by clearing progress, then trying to open the campaign and click on the first level
 * 
 * Asserts that Lageta stays on the campaign page after this action
 */
test('first level starts unavailable', async ({ page }) => {
    await page.goto(root);

    await page.evaluate(() => {localStorage.clear()})

    await safeClick(page, "Continue")
    await page.waitForURL(root + "campaign/")

    await expect(page.getByTitle("Play A Simple Start")).toBeDisabled()
});