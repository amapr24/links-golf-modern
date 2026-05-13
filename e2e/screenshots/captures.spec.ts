import fs from "node:fs";
import { test } from "@playwright/test";
import {
  OUTPUT_DIR,
  VIEWPORTS,
  gotoHomeWithLang,
  gotoPathWithLang,
  outFile,
  warmScrollHome,
  type CaptureLang,
} from "./helpers";

const LANGS: CaptureLang[] = ["en", "es"];

test.beforeAll(() => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
});

for (const vp of VIEWPORTS) {
  for (const lang of LANGS) {
    const langSuffix = lang;

    test(`home full-page ${vp.slug} ${langSuffix}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoHomeWithLang(page, lang);
      await warmScrollHome(page);
      await page.screenshot({
        path: outFile(`home-full-${vp.slug}-${langSuffix}.png`),
        fullPage: true,
      });
    });

    test(`home above-the-fold ${vp.slug} ${langSuffix}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoHomeWithLang(page, lang);
      await page.locator("nav").first().waitFor({ state: "visible", timeout: 30_000 });
      // Sonner mounts a hidden <section> for toasts before the hero — target the hero shell.
      await page
        .locator("section.min-h-screen")
        .first()
        .waitFor({ state: "visible", timeout: 30_000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await page.screenshot({
        path: outFile(`home-hero-${vp.slug}-${langSuffix}.png`),
        fullPage: false,
      });
    });

    test(`home pricing section in view ${vp.slug} ${langSuffix}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoHomeWithLang(page, lang);
      await warmScrollHome(page);
      await page.locator("#pricing").scrollIntoViewIfNeeded();
      await page.locator("#pricing").waitFor({ state: "visible", timeout: 30_000 });
      await page.waitForTimeout(300);
      await page.screenshot({
        path: outFile(`home-pricing-${vp.slug}-${langSuffix}.png`),
        fullPage: false,
      });
    });

    test(`login email step ${vp.slug} ${langSuffix}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoPathWithLang(page, "/login", lang);
      const ready = page
        .locator('input[type="email"]')
        .or(page.getByText("Supabase is not configured"));
      await ready.first().waitFor({ state: "visible", timeout: 30_000 });
      await page.waitForTimeout(200);
      await page.screenshot({
        path: outFile(`login-email-${vp.slug}-${langSuffix}.png`),
        fullPage: true,
      });
    });

    test(`courses directory ${vp.slug} ${langSuffix}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoPathWithLang(page, "/courses", lang);
      await page.getByRole("heading", { name: /Course Directory/i }).waitFor({
        state: "visible",
        timeout: 30_000,
      });
      await page.locator("main").waitFor({ state: "visible", timeout: 30_000 });
      await page.waitForTimeout(200);
      await page.screenshot({
        path: outFile(`courses-directory-${vp.slug}-${langSuffix}.png`),
        fullPage: true,
      });
    });
  }
}
