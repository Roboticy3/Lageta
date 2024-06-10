import type { Page } from "playwright"
import { clickDelayMS, locateConnectionPoint, locateGridSquare } from "../resources"

export async function step1(page:Page) {
    const firstConnectionPoint = await locateConnectionPoint(page, {id:0, type:"Output", index:0})
    await firstConnectionPoint.click({force:true})
}

export async function step2(page:Page) {
    await step1(page)
    const secondConnectionPoint = await locateConnectionPoint(page, {id:1, type:"Input", index:0})
    await page.waitForTimeout(clickDelayMS)
    await secondConnectionPoint.click({force:true})
    await page.waitForTimeout(clickDelayMS)
}

//delete the wire by clicking first on the output connection point and then on the input
export async function stepm2(page:Page) {
    const secondConnectionPoint = await locateConnectionPoint(page, {id:1, type:"Input", index:0})
    await secondConnectionPoint.click({force:true})
    await page.waitForTimeout(clickDelayMS)
    const firstConnectionPoint = await locateConnectionPoint(page, {id:0, type:"Output", index:0})
    await firstConnectionPoint.click({force:true})
    await page.waitForTimeout(clickDelayMS)
}

export async function step3(page:Page) {
    await step2(page)
    await page.getByTestId("continue").click()
}

export async function step4(page:Page) {
    await step3(page)
    await page.getByRole('checkbox').click()
}

export async function step5(page:Page) {
    await step4(page)
    await page.getByTestId('continue').click()
}

export async function step6(page: Page) {
    await step5(page);
    const secondConnectionPoint = await locateConnectionPoint(page, { id: 1, type: "Input", index: 0 });
    await secondConnectionPoint.click({ force: true });
}

export async function step7(page: Page) {
    await step5(page);
    await stepm2(page);
}

export async function step8(page: Page) {
    await step7(page);

    await step2(page);
}

export async function step9(page: Page) {
    await step8(page);
    await page.waitForTimeout(3500);
}

export async function step10(page: Page) {
    await step9(page);
    await page.getByTestId('continue').click();
}

export async function step11(page: Page) {
    await step10(page);
    await page.locator('#signal-play-button').click();
}

export async function step12(page: Page) {
    await step11(page);
    await page.waitForTimeout(6000);
}

export async function step13(page: Page) {
    await step12(page);
    await page.getByTestId('continue').click();
}

export async function step14(page: Page) {
    await step13(page);

    await page.getByTestId('continue').click();
}

export async function step15(page: Page) {
    await step14(page);

    await page.getByTitle('ShelfButton.Not').click();
}

export async function step16(page: Page) {
    await step15(page);

    const offset = await locateGridSquare(page, 10, 5, 4, 1);

    await page.waitForTimeout(clickDelayMS);

    await page.mouse.click(offset[0], offset[1]);

    await page.waitForTimeout(clickDelayMS);
}

export async function step17(page: Page) {
    await step16(page);

    await page.getByTestId('continue').click();
}

export async function step18(page: Page) {
    await step17(page);
    await page.locator('#signal-play-button').click({ force: true });
}

export async function step19(page: Page) {
    await step18(page);

    await page.waitForTimeout(6000);
}

export async function step20(page: Page) {
    await step19(page);

    const firstConnectionPoint = await locateConnectionPoint(page, { id: 0, type: "Output", index: 0 });
    await firstConnectionPoint.click({ force: true });

    await page.waitForTimeout(clickDelayMS)
}

export async function step21(page: Page) {
    await step20(page)

    const thirdConnectionPoint = await locateConnectionPoint(page, { id: 2, type: "Input", index: 0 });
    await thirdConnectionPoint.click({ force: true });

    await page.waitForTimeout(clickDelayMS)
}

export async function step22(page: Page) {
    await step21(page)

    const fourthConnectionPoint = await locateConnectionPoint(page, { id: 2, type: "Output", index: 0 });
    await fourthConnectionPoint.click({ force: true });

    await page.waitForTimeout(clickDelayMS)
}

export async function step23(page: Page) {
    await step22(page)

    const secondConnectionPoint = await locateConnectionPoint(page, { id: 1, type: "Input", index: 0 });
    await secondConnectionPoint.click({ force: true });

    await page.waitForTimeout(clickDelayMS)
}

export async function step24(page: Page) {
    await step23(page)
    await page.locator('#signal-play-button').click({ force: true });
}

export async function step25(page: Page) {
    await step24(page)
    await page.waitForTimeout(8000);
}

export async function step26(page: Page) {
    await step25(page)
    await page.waitForTimeout(21000)
}