import test, { expect, type Page } from "playwright/test";
import { gotoTutorial, locateConnectionPoint, locateWire } from "./resources";
import { CircuitRendererIDStandard } from "$lib/circuit_types/CircuitRendererIDSpace";
import { goto } from "$app/navigation";

/**
 * Open the tutorial and ensure that the two elements on the first frame of the storyboard are visible
 * 
 * The "click me" indicator is automated with opacity, so it can't be tested for visibility, toBeDefined will have to be enough for now
 */
test('tutorial initial layout is correct', async ({ page }) => {
    await gotoTutorial(page)

    await expect(await page.getByText(/click me/)).toBeDefined() 
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
    await step1(page)
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

async function step3(page:Page) {
    await step2(page)
    await page.getByTestId("continue").click()
}

test('tutorial progression 3', async ({ page }) => {
    await gotoTutorial(page)

    await step3(page)

    await expect(page.getByText(/Voltage!/)).toHaveCount(0)
})

/**
 * Test that clicking the input checkbox after drawing a wire makes the continue button unavailable
 * 
 * this assertion is achieved by asking if the voltage text is still here after the worker tries to press continue
 */
test('tutorial progression 3B', async ({ page }) => {
    await gotoTutorial(page)

    step2(page)

    await page.getByRole('checkbox').click()
    await page.getByTestId('continue').click({force:true})
    await expect(page.getByText(/Voltage!/)).toBeVisible()
})

/**
 * Test that clicking the input checkbox twice after step2 makes the continue button available again
 */
test('tutorial progression 3C', async ({ page }) => {
    await gotoTutorial(page)

    step2(page)

    await page.getByRole('checkbox').click()
    await page.getByRole('checkbox').click()
    await page.getByTestId('continue').click()
    await expect(page.getByText(/Voltage!/)).toHaveCount(0)
})

async function step4(page:Page) {
    await step3(page)
    await page.getByRole('checkbox').click()
}

/**
 * There are 3 "low"s exactly, because the "low" in the instructions is wrapped by a span to change its color, making it an "exact" low as well as the two on the circuit
 */
test('tutorial progression 4', async ({ page }) => {
    await gotoTutorial(page)

    await step4(page)

    await expect(page.getByText('low', { exact:true })).toHaveCount(3)
})

//delete the wire by clicking first on the output connection point and then on the input
async function stepm2(page:Page) {
    const secondConnectionPoint = await locateConnectionPoint(page, {id:1, type:"Input", index:0})
    await secondConnectionPoint.click({force:true})
    const firstConnectionPoint = await locateConnectionPoint(page, {id:0, type:"Output", index:0})
    await firstConnectionPoint.click({force:true})
}

/**
 * Modify step 4 to remove the wire, then click the checkbox, then reconnect the wire
 */
test('tutorial progression 4A', async ({ page }) => {
    await gotoTutorial(page)

    await step3(page)

    await stepm2(page)
    await page.getByRole('checkbox').click()
    await step2(page)

    await expect(page.getByText('low', { exact:true })).toHaveCount(3)
    await expect(page.getByText('high', { exact:true })).toHaveCount(1)
    await expect(page.getByText('neither', { exact:true })).toHaveCount(1)
})

async function step5(page:Page) {
    await step4(page)
    await page.getByTestId('continue').click()
}

test('tutorial progression 5', async ({ page }) => {
    await gotoTutorial(page)

    await step5(page)

    await expect(page.getByText('neither', { exact:true })).toHaveCount(1)
})

/**
 * Step 5 should still progress as expected if the wire is deleted
 * 
 * After disconnecting the wire, there should be two "neither"s on screen, one for the output and one for the instructions
 */
test('tutorial progression 5A', async ({ page }) => {
    await gotoTutorial(page)

    await step4(page)

    await stepm2(page)

    await expect(page.getByText('low', { exact:true })).toHaveCount(2)
    await expect(page.getByText('high', { exact:true })).toHaveCount(1)
    await expect(page.getByText('neither', { exact:true })).toHaveCount(2)

    await page.getByTestId('continue').click()

    await expect(page.getByText('neither', { exact:true })).toHaveCount(1)
})

/**
 * Step 5 should still progress as expected if the checkbox is set to true
 * 
 * After clicking the checkbox, there should be 3 "high"s on screen, two for the input and output and one for the instructions
 */
test('tutorial progression 5B', async ({ page }) => {
    await gotoTutorial(page)

    await step4(page)

    await page.getByRole('checkbox').click()

    await expect(page.getByText('low', { exact:true })).toHaveCount(1)
    await expect(page.getByText('high', { exact:true })).toHaveCount(3)
    await expect(page.getByText('neither', { exact:true })).toHaveCount(1)

    await page.getByTestId('continue').click()

    await expect(page.getByText('neither', { exact:true })).toHaveCount(1)
})

/**
 * Step 5 should still progress as expected if the checkbox is set to true AND the wire is disconnected
 * 
 * After clicking the checkbox, there should be 2 "high"s on screen, one for the input and one for the instructions
 */
test('tutorial progression 5C', async ({ page }) => {
    await gotoTutorial(page)

    await step4(page)

    await page.getByRole('checkbox').click()
    await stepm2(page)

    await expect(page.getByText('low', { exact:true })).toHaveCount(1)
    await expect(page.getByText('high', { exact:true })).toHaveCount(2)
    await expect(page.getByText('neither', { exact:true })).toHaveCount(2)

    await page.getByTestId('continue').click()

    await expect(page.getByText('neither', { exact:true })).toHaveCount(1)
})

async function step6(page:Page) {
    await step5(page)
    await stepm2(page)
}

/**
 * Step 6 has an intermediate instruction, so it's tested in two parts. 6.1 and 6.2
 */
test('tutorial progression 6.1', async ({ page }) => {
    await gotoTutorial(page)

    await step5(page)

    const secondConnectionPoint = await locateConnectionPoint(page, {id:1, type:"Input", index:0})
    await secondConnectionPoint.click({force:true})

    await expect(page.getByText('Click on any blank space')).toHaveCount(1)
})

test('tutorial progression 6.2', async ({ page }) => {
    await gotoTutorial(page)

    await step6(page)

    await expect(page.getByText('ready')).toHaveCount(1)
})

async function step7(page:Page) {
    await step6(page)
    await step2(page)
}

test('tutorial progression 7', async ({page}) => {
    await gotoTutorial(page)

    await step7(page)

    //...
})