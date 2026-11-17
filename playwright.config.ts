import { defineConfig, devices } from '@playwright/test';

// End-to-end suite: real browser engines (Chromium, Firefox, WebKit) on emulated desktop, tablet and phone screens.
// It runs against a production build, so what it checks is what gets deployed.
const PORT = 3200;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts', // not *.test.ts / *.spec.ts, so Vitest never picks these up
  outputDir: './e2e/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 6,
  timeout: 60_000,
  expect: { timeout: 7_000 },
  reporter: [['list'], ['html', { outputFolder: 'e2e/report', open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    // CI has already built in its own step (.github/workflows/ci.yml); locally, build first so the tests see the latest code.
    command: `${process.env.CI ? '' : 'npm run build && '}npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-safari', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    { name: 'laptop-small', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } } },
    { name: 'ipad-portrait', use: { ...devices['iPad (gen 7)'] } },
    { name: 'ipad-landscape', use: { ...devices['iPad (gen 7) landscape'] } },
    { name: 'iphone-14', use: { ...devices['iPhone 14'] } },
    { name: 'iphone-se', use: { ...devices['iPhone SE'] } },
    { name: 'pixel-7', use: { ...devices['Pixel 7'] } },
    { name: 'galaxy-s9', use: { ...devices['Galaxy S9+'] } },
  ],
});
