import test, { expect, type Page } from "playwright/test";
import { clickDelayMS, gotoTutorial, locateConnectionPoint, locateGate, locateGridSquare } from "../resources";
import { step15, step16, step17, step18, step19, step20 } from "./steps";


test('tutorial progression 16', async ({ page }) => {
    await gotoTutorial(page);

    await step16(page);

    await expect(page.getByText("picked up a gate")).toHaveCount(0);
    await expect(page.getByText("you can add more gates")).toHaveCount(1);
});
/**
 * Try to place a gate in a filled position on the circuit. This should not progress the tutorial.
 */
test('tutorial progression 16A', async ({ page }) => {
    await gotoTutorial(page);

    await step15(page);

    const offset = await locateGridSquare(page, 10, 5, 8, 1);
    await page.mouse.click(offset[0], offset[1]);

    await expect(page.getByText("picked up a gate")).toHaveCount(1);
    await expect(page.getByText("you can add more gates")).toHaveCount(0);
});

test('tutorial progression 17', async ({ page }) => {
    await gotoTutorial(page);

    await step17(page);

    await expect(page.getByText("you can add more gates")).toHaveCount(0);
    await expect(page.getByText("press play")).toHaveCount(1);
});

test('tutorial progression 18', async ({ page }) => {
    await gotoTutorial(page);

    await step18(page);

    await expect(page.getByText("press play")).toHaveCount(0);
    await expect(page.getByText("...")).toHaveCount(1);
});


test('tutorial progression 19', async ({ page }) => {
    await gotoTutorial(page);

    await step19(page);

    await expect(page.getByText("...")).toHaveCount(0);
    await expect(page.getByText("still not working")).toHaveCount(1);
});

test('tutorial progression 20', async ({ page }) => {
    await gotoTutorial(page);

    await step20(page);

    await expect(page.getByText("still not working")).toHaveCount(1);
    await expect(page.getByText("affect the circuit")).toHaveCount(1);
});
/**
 * Step should not progress if the gate is deleted first. In fact, the tutorial should go back to the step that asks the user to place a gate
 */
test('tutorial progression 20A', async ({ page }) => {
    await gotoTutorial(page);

    await step19(page);

    await (await locateGate(page, 2)).click({ force: true });

    await page.waitForTimeout(clickDelayMS);

    await (await locateGate(page, 0)).click({ force: true });

    await page.waitForTimeout(clickDelayMS);

    const firstConnectionPoint = await locateConnectionPoint(page, { id: 0, type: "Output", index: 0 });
    await firstConnectionPoint.click({ force: true });

    await page.waitForTimeout(clickDelayMS);

    await expect(page.getByText("still not working")).toHaveCount(0);
    await expect(page.getByText("affect the circuit")).toHaveCount(0);
});
