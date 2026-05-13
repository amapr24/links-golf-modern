/**
 * Automated reflow pass: target widths from P0 QA checklist + overflow probe.
 * Run: pnpm exec playwright test e2e/screenshots/reflow-audit.spec.ts
 * Report: e2e/screenshots/output/reflow-audit-report.md
 */

import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const OUTPUT_DIR = path.join(import.meta.dirname, "output");
const REPORT_PATH = path.join(OUTPUT_DIR, "reflow-audit-report.md");

const VIEWPORTS = [
  { slug: "1440", width: 1440, height: 900 },
  { slug: "1024", width: 1024, height: 800 },
  { slug: "768", width: 768, height: 1024 },
  { slug: "414", width: 414, height: 896 },
  { slug: "375", width: 375, height: 812 },
  { slug: "320", width: 320, height: 568 },
] as const;

const PATHS = ["/", "/courses"] as const;

type Row = {
  path: string;
  slug: string;
  width: number;
  phase: string;
  scrollWidth: number;
  clientWidth: number;
  overflowPx: number;
  ok: boolean;
};

const rows: Row[] = [];

function measureOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const el = document.documentElement;
    const sw = el.scrollWidth;
    const cw = el.clientWidth;
    return { scrollWidth: sw, clientWidth: cw, overflowPx: sw - cw };
  });
}

test.beforeAll(() => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
});

test.afterAll(() => {
  const lines = [
    "# Reflow audit (automated)",
    "",
    "Checks: `documentElement.scrollWidth <= clientWidth` (≤1px tolerance for rounding).",
    "Phases: **top** (after load), **#courses**, **#pricing** (home only).",
    "",
    "| Path | Viewport | Phase | overflow px | OK |",
    "|------|----------|-------|---------------:|----|",
  ];
  for (const r of rows) {
    lines.push(
      `| ${r.path} | ${r.slug} (${r.width}px) | ${r.phase} | ${r.overflowPx.toFixed(0)} | ${r.ok ? "yes" : "**no**"} |`,
    );
  }
  const failed = rows.filter((r) => !r.ok);
  lines.push("");
  if (failed.length === 0) {
    lines.push("**Result:** no horizontal overflow detected at any probe.");
  } else {
    lines.push(`**Result:** ${failed.length} probe(s) reported overflow — inspect full-page screenshots in \`e2e/screenshots/output/reflow-*.png\`.`);
  }
  fs.writeFileSync(REPORT_PATH, lines.join("\n"), "utf-8");
});

for (const vp of VIEWPORTS) {
  for (const pathname of PATHS) {
    test(`reflow ${vp.slug} ${pathname === "/" ? "home" : "courses"}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(pathname, { waitUntil: "domcontentloaded", timeout: 60_000 });

      if (pathname === "/courses") {
        await page.locator("header h1").filter({ hasText: "Course Directory" }).waitFor({
          state: "visible",
          timeout: 60_000,
        });
        await page.locator("main").waitFor({ state: "visible", timeout: 60_000 });
      } else {
        await page.locator("nav").first().waitFor({ state: "visible", timeout: 60_000 });
        await page.locator("section.min-h-screen").first().waitFor({ state: "visible", timeout: 60_000 });
      }

      const record = async (phase: string) => {
        const m = await measureOverflow(page);
        const ok = m.overflowPx <= 1;
        rows.push({
          path: pathname,
          slug: vp.slug,
          width: vp.width,
          phase,
          scrollWidth: m.scrollWidth,
          clientWidth: m.clientWidth,
          overflowPx: m.overflowPx,
          ok,
        });
        expect.soft(ok, `${pathname} ${vp.slug} ${phase}: horizontal overflow ${m.overflowPx}px`).toBe(true);
      };

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);
      await record("top");

      if (pathname === "/") {
        await page.locator("#courses").scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await record("#courses");

        await page.locator("#pricing").scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await record("#pricing");
      }

      const safeSlug = pathname === "/" ? "home" : "courses";
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `reflow-full-${safeSlug}-${vp.slug}.png`),
        fullPage: true,
      });
    });
  }
}
