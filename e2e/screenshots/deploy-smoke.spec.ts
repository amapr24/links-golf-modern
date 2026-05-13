import { test, expect } from "@playwright/test";

/**
 * Sprint B — ensure marketing routes do not force a client navigation to Manus OAuth
 * on first load (complements `main.tsx` public-path guard for tRPC UNAUTHORIZED).
 */
const OAUTH_HOST_MARKERS = ["oauth.manus.im", "portal.manus.im"];

test.describe("deploy smoke — public pages (no OAuth redirect on load)", () => {
  for (const path of ["/", "/courses", "/login"] as const) {
    test(`stays on app origin: ${path}`, async ({ page, baseURL }) => {
      expect(baseURL, "PLAYWRIGHT_BASE_URL / webServer must be set").toBeTruthy();
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(800);
      const url = page.url();
      const origin = new URL(baseURL!).origin;
      expect(url.startsWith(origin), `expected URL under ${origin}, got ${url}`).toBe(
        true
      );
      for (const frag of OAUTH_HOST_MARKERS) {
        expect(
          url,
          `unexpected OAuth-related navigation (${frag})`
        ).not.toContain(frag);
      }
      await expect(page.locator("#root")).toBeVisible();
    });
  }
});
