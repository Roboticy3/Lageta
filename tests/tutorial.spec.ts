import test, { expect } from "playwright/test";
import { gotoTutorial, locateConnectionPoint } from "./resources";
import { CircuitRendererIDStandard } from "$lib/circuit_types/CircuitRendererIDSpace";

//ensure that elements are visible and in place
test('tutorial initial layout is correct', async ({ page }) => {
    await gotoTutorial(page)

    await expect(await page.getByText(/click me/)).toBeVisible()
    await expect(await locateConnectionPoint(page, {id:0, type:"Output", index:0})).toBeVisible()
})