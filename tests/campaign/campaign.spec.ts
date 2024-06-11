import { test, expect } from "playwright/test";
import { passTutorial } from "../resources"

test('campaign unlocked after tutorial', async ({page}) => {
    await passTutorial(page)

    await expect(page.getByText("Continue")).toHaveCount(1)
})