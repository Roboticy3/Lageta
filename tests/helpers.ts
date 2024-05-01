import { expect, type Page } from "@playwright/test";

/**
 * Click a button... safely. Fixes main menu Continue test not working on chromium, and hopefully stabilizes other button tests too
 * 
 * https://stackoverflow.com/questions/74301319/playwright-click-button-does-not-work-reliably-flaky
 * @param page 
 * @param title 
 */
export const safeClick = async (page:Page, selector:string) => {
  await page.waitForLoadState('networkidle'); // <-  until there are no network connections for at least 500 ms.
  const element = page.locator(selector)
  await element.waitFor()
  return element.click()
}

/**
 * Try to draw a wire between two connection points in a circuit.
 * 
 * Assumes that both of the connection points have their own test cases to check that they exist. 
 * If they do not, this function may produce undefined behavior.
 * @param page 
 * @param from 
 * @param to 
 */
export const tryLayConnection = async (page:Page, from:[number, number], to:[number, number]) => {
  const outputBounds = await page.locator(`#gate-${from[0]}-output-${from[1]}`)?.boundingBox()
  await page.mouse.click(outputBounds?.x || 0, outputBounds?.y || 0)

  const inputBounds = await page.locator(`#gate-${to[0]}-input-${to[1]}`)?.boundingBox()
  await page.mouse.click(inputBounds?.x || 0, inputBounds?.y || 0)
}

export const root = 'http://localhost:5173/'