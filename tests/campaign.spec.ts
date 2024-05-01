import { test, expect } from "@playwright/test";
import { root, safeClick, tryLayConnection } from "./helpers";

test('first level starts unlocked', async ({ page }) => {
    await page.goto(root);
    await page.evaluate(() => {localStorage.clear()})
    await safeClick(page, "[title=Continue]")
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
    await safeClick(page, "[title=Continue]")
    await page.waitForURL(root + "campaign/")

    await expect(page.locator("#level-1-play")).toBeDisabled()
});

test('first level visible', async ({ page }) => {
    await page.goto(root);
    await page.evaluate(() => {localStorage.clear()})
    await safeClick(page, "[title=Continue]")
    await page.waitForURL(root + "campaign/")

    await expect(page.getByTitle("A Simple Start")).toBeVisible()
});

test('can find first connection point', async ({ page }) => {
    await page.goto(root);
    await page.evaluate(() => {localStorage.clear()})
    await safeClick(page, "[title=Continue]")
    await page.waitForURL(root + "campaign/")

    const inputBounds = await page.locator('#gate-0-output-0')?.boundingBox()

    await expect(inputBounds).toBeTruthy()
})

test('connecting first level makes it available', async ({ page }) => {
    await page.goto(root);
    await page.evaluate(() => {localStorage.clear()})
    await safeClick(page, "[title=Continue]")
    await page.waitForURL(root + "campaign/")

    await tryLayConnection(page, [0, 0], [1, 0])

    await expect(page.locator("#level-1-play")).toBeEnabled()
})

test('opening first level', async ({ page }) => {
    await page.goto(root);
    await page.evaluate(() => {localStorage.clear()})
    await safeClick(page, "[title=Continue]")
    await page.waitForURL(root + "campaign/")

    await tryLayConnection(page, [0, 0], [1, 0])

    await safeClick(page, "#level-1-play")
    await page.waitForURL(root + "level/A Simple Start/")
})

