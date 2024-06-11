import test, { expect, type Page } from "playwright/test";
import { gotoTutorial } from "../resources";
import { step11, step12, step13, step14, step15 } from "./steps";

test('tutorial progression 11', async ({ page }) => {
    await gotoTutorial(page);

    await step11(page);

    await expect(page.getByText('This is the signal')).toHaveCount(0);
    await expect(page.getByText('As the signal changes')).toHaveCount(0);
});


/**
 * Step 12 is just waiting for the signal
 */
test('tutorial progression 12', async ({ page }) => {
    await gotoTutorial(page);

    await step12(page);

    await expect(page.getByText('As the signal changes')).toHaveCount(1);
});

test('tutorial progression 13', async ({ page }) => {
    await gotoTutorial(page);

    await step13(page);

    await expect(page.getByText('As the signal changes')).toHaveCount(0);
    await expect(page.getByText("Looks like this circuit isn't correct")).toHaveCount(1);
});

test('tutorial progression 14', async ({ page }) => {
    await gotoTutorial(page);

    await step14(page);

    await expect(page.getByText("Looks like this circuit isn't correct")).toHaveCount(0);
    await expect(page.getByText("click me")).toHaveCount(2); //two indicators should exist now. Though only one is visible there's no good way to check this.
});

test('tutorial progression 15', async ({ page }) => {
    await gotoTutorial(page);

    await step15(page);

    await expect(page.getByText("picked up a gate")).toHaveCount(1);
});


