import { defineConfig, devices } from "@playwright/test";
import { E2E_OWNER } from "./e2e/test-owner";

const PORT = 3200;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "e2e",
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Cached data from earlier local builds would point at products this fresh database doesn't have.
    command: `node -e "require('fs').rmSync('.next/cache/fetch-cache', { recursive: true, force: true })" && npm run build && npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      // An empty value stops Next.js loading DATABASE_URL from .env.local, so tests use a fresh in-memory database.
      DATABASE_URL: "",
      SESSION_SECRET: "e2e-session-secret-only-for-browser-tests",
      ADMIN_USERNAME: E2E_OWNER.username,
      ADMIN_INITIAL_PASSWORD: E2E_OWNER.password,
      PHOTO_STORAGE_DIR: ".data/e2e-photos",
    },
  },
});
