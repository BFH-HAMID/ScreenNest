import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  webServer: process.env.TEST_BASE_URL
    ? undefined
    : {
        command: "npm run start",
        url: "http://127.0.0.1:3000/api/catalog",
        reuseExistingServer: !process.env.CI,
        timeout: 60000,
      },
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://127.0.0.1:3000",
    headless: true,
    launchOptions: process.env.CHROMIUM_PATH
      ? {
          executablePath: process.env.CHROMIUM_PATH,
          args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
        }
      : {},
  },
});
