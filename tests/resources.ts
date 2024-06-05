import type { ConnectionIndex } from "$lib/circuit_types/CircuitController";
import { CircuitRendererIDStandard } from "$lib/circuit_types/CircuitRendererIDSpace";
import type { Locator, Page } from "playwright";
import { expect } from "playwright/test";

export const root = 'localhost:5173/'

export const gameViewComponentTitles = [
    "Nav",
    "Sandbox",
    "Editor",
    "Instructions",
    "Signal Player",
    "Shelf",
    "Circuit",
    "ShelfButton.Not"
]

export const clickDelayMS = 500

export async function gotoTutorial(page:Page) {
    //nav to home
    await page.goto(root);
  
    //clear local storage
    await page.evaluate(() => {localStorage.clear()})
  
    //get the tutorial button and click it to navigate to the tutorial
    await page.locator('button', {hasText: /Tutorial/}).click()
    await page.waitForURL(/Tutorial/)
}

export async function locateConnectionPoint(page:Page, index:ConnectionIndex) {
    const idSpace = new CircuitRendererIDStandard()
    return await page.locator(`#${idSpace.connectionPointIdString(index)}`)
}

export async function locateWire(page:Page, index:[number, number]) {
    const idSpace = new CircuitRendererIDStandard()
    return await page.locator(`#${idSpace.wireIdString(index)}`)
}

export async function locateGate(page:Page, id:number) {
    const idSpace = new CircuitRendererIDStandard() 
    return await page.locator(`#${idSpace.gateIdString(id)}`)
}

export async function circuitBBox(page:Page) {
    const idSpace = new CircuitRendererIDStandard()
    return (await page.locator(`#${idSpace.headIdString()}`)).boundingBox()
}

export async function locateGridSquare(
    page:Page, 
    sizeX:number, 
    sizeY:number, 
    x:number, 
    y:number, 
    gridOffsetX:number = 0, 
    gridOffsetY:number = 0
): Promise<[number, number]> {
    const bbox = await circuitBBox(page)
    if (!bbox) return [0, 0]
    const cX = bbox.width / sizeX
    const cY = bbox.height / sizeY
    return [
        bbox.x + cX * (x - 10 * gridOffsetX), 
        bbox.y + cY * (y - 10 * gridOffsetY)
    ]
}
