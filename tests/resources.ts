import type { ConnectionIndex } from "$lib/circuit_types/CircuitController";
import { CircuitRendererIDStandard } from "$lib/circuit_types/CircuitRendererIDSpace";
import type { Locator, Page } from "playwright";

export const root = 'localhost:5173/'

export async function gotoTutorial(page:Page) {
    //nav to home
    await page.goto(root);
  
    //clear local storage
    await page.evaluate(() => {localStorage.clear()})
  
    //get the tutorial button and click it to navigate to the tutorial
    await page.locator('button', {hasText: /Tutorial/}).click()
    await page.waitForURL(/Tutorial/)
}

export async function clickCircuit(page:Page, element:Locator) {
    await element.boundingBox().then((bbox) => {
        if (!bbox) return
        const center = [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2]
        page.mouse.click(center[0], center[1])
    })
    
}

export async function locateConnectionPoint(page:Page, index:ConnectionIndex) {
    const idSpace = new CircuitRendererIDStandard()
    return await page.locator(`#${idSpace.connectionPointIdString(index)}`)
}

export async function locateWire(page:Page, index:[number, number]) {
    const idSpace = new CircuitRendererIDStandard()
    return await page.locator(`#${idSpace.wireIdString(index)}`)
}