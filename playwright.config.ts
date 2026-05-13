import { defineConfig, devices } from "@playwright/test";

/**
 * Dedicated port so `pnpm screenshots` can start its own dev server without
 * fighting whatever is already on PORT=3000.
 */
const SCREENSHOT_PORT = process.env.SCREENSHOT_DEV_PORT ?? "3210";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${SCREENSHOT_PORT}`;

export default defineConfig({
  testDir: "./e2e/screenshots",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    trace: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `PORT=${SCREENSHOT_PORT} pnpm dev`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
