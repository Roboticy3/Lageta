import type { Page } from "@playwright/test";

/**
 * Click a button... safely. Fixes main menu Continue test not working on chromium, and hopefully stabilizes other button tests too
 * 
 * https://stackoverflow.com/questions/74301319/playwright-click-button-does-not-work-reliably-flaky
 * @param page 
 * @param title 
 */
export const safeClick = async (page:Page, title:string) => {
    await page.waitForLoadState('networkidle'); // <-  until there are no network connections for at least 500 ms.
    const element = page.getByTitle(title)
    await element.waitFor()
    return element.click()
  }

export const root = 'http://localhost:5173/'