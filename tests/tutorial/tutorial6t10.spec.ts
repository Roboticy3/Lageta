import test, { expect, type Page } from "playwright/test";
import { gameViewComponentTitles, gotoTutorial, locateConnectionPoint } from "../resources";
import { step10, step6, step7, step8, step9 } from "./steps";


/**
 * Steps 6 and 7 expect messages
 */
test('tutorial progression 6', async ({ page }) => {
    await gotoTutorial(page);

    await step6(page);

    await expect(page.getByText('Click on any blank space')).toHaveCount(1);
});

test('tutorial progression 7', async ({ page }) => {
    await gotoTutorial(page);

    await step7(page);

    await expect(page.getByText('ready')).toHaveCount(1);
});

/**
 * Step 8 expects the gameview ui to be loaded in at some point
 */
test('tutorial progression 8', async ({ page }) => {
    await gotoTutorial(page);

    await step8(page);

    for (let title of gameViewComponentTitles) {
        await expect(page.getByTitle(title, { exact: true })).toHaveCount(1);
    }
});

/**
 * Step 9 expects a message
 */
test('tutorial progression 9', async ({ page }) => {
    await gotoTutorial(page);

    await step9(page);

    await expect(page.getByText('This is a level')).toHaveCount(1);
});

test('tutorial progression 10', async ({ page }) => {
    await gotoTutorial(page);

    await step10(page);

    await expect(page.getByText('This is a level')).toHaveCount(0);
    await expect(page.getByText('This is the signal')).toHaveCount(1);
});


