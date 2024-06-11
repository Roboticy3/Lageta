import { test, expect } from "playwright/test";
import { gotoCampaign, passTutorial } from "../resources"

test('campaign unlocked after tutorial', async ({page}) => {
    await passTutorial(page)

    await expect(page.getByText("Continue")).toHaveCount(1)
})

test('campaign accessible after tutorial', async ({page}) => {
    await gotoCampaign(page)
})