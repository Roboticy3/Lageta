import test, { expect } from "playwright/test";
import { clickCircuit, gotoTutorial, locateConnectionPoint, locateWire } from "./resources";
import { CircuitRendererIDStandard } from "$lib/circuit_types/CircuitRendererIDSpace";

/**
 * Open the tutorial and ensure that the two elements on the first frame of the storyboard are visible
 */
test('tutorial initial layout is correct', async ({ page }) => {
    await gotoTutorial(page)

    await expect(await page.getByText(/click me/)).toBeVisible()
    await expect(await locateConnectionPoint(page, {id:0, type:"Output", index:0})).toBeVisible()
})

/**
 * Test the first action for progressing the tutorial, drawing a wire from the initial connection point should show the second connection point
 */
test('tutorial progression 1', async ({ page }) => {
    await gotoTutorial(page)

    const firstConnectionPoint = await locateConnectionPoint(page, {id:0, type:"Output", index:0})
    await clickCircuit(page, firstConnectionPoint)
    await locateConnectionPoint(page, {id:1, type:"Input", index:0})
})

/**
 * Check that a wire is drawn after it is plac
 */
test('tutorial progression 2', async ({ page }) => {
    await gotoTutorial(page)

    const firstConnectionPoint = await locateConnectionPoint(page, {id:0, type:"Output", index:0})
    await clickCircuit(page, firstConnectionPoint)
    const secondConnectionPoint = await locateConnectionPoint(page, {id:1, type:"Input", index:0})
    await clickCircuit(page, secondConnectionPoint)

    await locateWire(page, [0, 0])
})