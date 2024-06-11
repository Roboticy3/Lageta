import test, { expect } from "@playwright/test";
import { step26 } from "./steps";
import { gotoTutorial } from "../resources";

test('tutorial progression 26', async ({page}) => {
    await gotoTutorial(page)

    await step26(page)

    await expect(page.getByText('you win!')).toHaveCount(1);
})