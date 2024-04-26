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

    await expect(page.getByTestId("Play A Simple Start")).toBeDisabled()
});

test('first level visible', async ({ page }) => {
    await page.goto(root);
    await page.evaluate(() => {localStorage.clear()})
    await safeClick(page, "Continue")
    await page.waitForURL(root + "campaign/")

    await expect(page.getByTitle("A Simple Start")).toBeVisible()
});

test('can find first connection point', async ({ page }) => {
    await page.goto(root);
    await page.evaluate(() => {localStorage.clear()})
    await safeClick(page, "Continue")
    await page.waitForURL(root + "campaign/")

    const inputBounds = await page.locator('#gate-0>path').boundingBox()

    await expect(inputBounds != null).toBeTruthy()
})

test('connecting first level makes it available', async ({ page }) => {
    await page.goto(root);
    await page.evaluate(() => {localStorage.clear()})
    await safeClick(page, "Continue")
    await page.waitForURL(root + "campaign/")

    const inputBounds = await page.locator('#gate-0>path').boundingBox()

    //inputBounds tested to exist by "can find first connection point"
    await page.mouse.click(inputBounds?.x || 0, inputBounds?.y || 0)

    
})

