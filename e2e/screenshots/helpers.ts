import path from "node:path";
import type { Page } from "@playwright/test";

export type CaptureLang = "en" | "es";

export const OUTPUT_DIR = path.join(import.meta.dirname, "output");

/** Viewports for design review: desktop, tablet, iPhone 16 Pro logical CSS size */
export const VIEWPORTS = [
  { slug: "desktop1440", width: 1440, height: 900 },
  { slug: "tablet834", width: 834, height: 1194 },
  { slug: "iphone16pro402", width: 402, height: 874 },
] as const;

export async function warmScrollHome(page: Page) {
  await page.locator("#benefits").waitFor({ state: "visible", timeout: 60_000 });
  await page.locator("#courses").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
}

export async function setLanguageAndReload(page: Page, lang: CaptureLang) {
  await page.evaluate((l) => localStorage.setItem("language", l), lang);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(150);
}

/** Land on home with language applied (default `en` needs no localStorage dance). */
export async function gotoHomeWithLang(page: Page, lang: CaptureLang) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  if (lang === "es") {
    await setLanguageAndReload(page, "es");
  }
}

export async function gotoPathWithLang(
  page: Page,
  pathname: string,
  lang: CaptureLang,
) {
  await page.goto(pathname, { waitUntil: "domcontentloaded" });
  if (lang === "es") {
    await setLanguageAndReload(page, "es");
  }
}

export function outFile(name: string) {
  return path.join(OUTPUT_DIR, name);
}
