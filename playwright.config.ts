import { defineConfig, devices } from '@playwright/test';

// Deliberately not Astro's default 4321: the preview server must be this
// project's build, not whatever else happens to be listening.
const PORT = Number(process.env.PREVIEW_PORT ?? 4331);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  // Tests run against the built output, not the dev server.
  webServer: {
    command: `npm run build && npx astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
    // Astro daemonises `preview` when it detects an agentic environment, which
    // makes Playwright think the server exited. Opting in explicitly keeps the
    // process in the foreground so Playwright can own its lifecycle.
    env: { ASTRO_PREVIEW_BACKGROUND: '1' },
  },
});
