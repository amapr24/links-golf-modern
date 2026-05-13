import fs from "node:fs";
import path from "node:path";
import { test } from "@playwright/test";

const OUTPUT_DIR = path.join(import.meta.dirname, "output");

async function warmScrollAndReset(page: import("@playwright/test").Page) {
  await page.locator("#benefits").waitFor({ state: "visible", timeout: 60_000 });
  await page.locator("#courses").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
}

test.describe("Home marketing captures", () => {
  test.beforeAll(() => {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  test("full page — desktop width", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await warmScrollAndReset(page);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "home-full-desktop.png"),
      fullPage: true,
    });
  });

  test("full page — mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await warmScrollAndReset(page);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "home-full-mobile.png"),
      fullPage: true,
    });
  });
});
