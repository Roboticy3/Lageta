import { test, expect } from "playwright/test";
import { gotoTutorial, locateConnectionPoint } from "../resources";
import { step20, step21, step22, step23 } from "./steps";

test('tutorial progression 21', async ({page}) => {
    await gotoTutorial(page)

    await step21(page)

    await expect(page.getByText("still not working")).toHaveCount(1);
    await expect(page.getByText("affect the circuit")).toHaveCount(0);
    await expect(page.getByText("second wire")).toHaveCount(1);
})

test('tutorial progression 21A', async ({page}) => {
    await gotoTutorial(page)

    await step20(page)

    const firstConnectionPoint = await locateConnectionPoint(page, { id: 0, type: "Output", index: 0 });
    await firstConnectionPoint.click({ force: true });

    await expect(page.getByText("still not working")).toHaveCount(1);
    await expect(page.getByText("affect the circuit")).toHaveCount(0);
    await expect(page.getByText("second wire")).toHaveCount(0);
})

test('tutorial progression 22', async ({page}) => {
    await gotoTutorial(page)

    await step22(page)

    await expect(page.getByText("still not working")).toHaveCount(1);
    await expect(page.getByText("second wire")).toHaveCount(1);
})

test('tutorial progression 23', async ({page}) => {
    await gotoTutorial(page)

    await step23(page)

    await expect(page.getByText("still not working")).toHaveCount(0);
    await expect(page.getByText("second wire")).toHaveCount(0);
    await expect(page.getByText("much better")).toHaveCount(1);
})