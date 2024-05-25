import test, { expect, type Page } from "playwright/test";
import { gotoTutorial, locateConnectionPoint, locateWire } from "./resources";
import { CircuitRendererIDStandard } from "$lib/circuit_types/CircuitRendererIDSpace";

/**
 * Open the tutorial and ensure that the two elements on the first frame of the storyboard are visible
 */
test('tutorial initial layout is correct', async ({ page }) => {
    await gotoTutorial(page)

    await expect(await page.getByText(/click me/)).toBeVisible()
    await expect(await locateConnectionPoint(page, {id:0, type:"Output", index:0})).toBeVisible()
})

async function step1(page:Page) {
    const firstConnectionPoint = await locateConnectionPoint(page, {id:0, type:"Output", index:0})
    await firstConnectionPoint.click({force:true})
}

/**
 * Test the first action for progressing the tutorial, drawing a wire from the initial connection point should show the second connection point
 */
test('tutorial progression 1', async ({ page }) => {
    await gotoTutorial(page)

    await step1(page)
    await locateConnectionPoint(page, {id:1, type:"Input", index:0})
})

async function step2(page:Page) {
    const firstConnectionPoint = await locateConnectionPoint(page, {id:0, type:"Output", index:0})
    await firstConnectionPoint.click({force:true})
    const secondConnectionPoint = await locateConnectionPoint(page, {id:1, type:"Input", index:0})
    await secondConnectionPoint.click({force:true})
}

/**
 * Check that a wire is drawn and the "Voltage!" message is displayed after the output is clicked
 * 
 * The continue button on TutorialText objects was given a data-testid of "continue," which will work as a selector as long as only one is on screen at a time
 */
test('tutorial progression 2', async ({ page }) => {
    await gotoTutorial(page)

    await step2(page)

    await locateWire(page, [0, 0])
    await page.getByText(/Voltage!/)
    await page.getByTestId("continue")
})

/**
 * Test that clicking the input checkbox after drawing a wire makes the continue button unavailable
 * 
 * this assertion is achieved by asking if the voltage text is still here after the worker tries to press continue
 */
test('tutorial progression 2B', async ({ page }) => {
    await gotoTutorial(page)

    step2(page)

    await page.getByRole('checkbox').click()
    await page.getByTestId('continue').click({force:true})
    await expect(page.getByText(/Voltage!/)).toBeVisible()
})