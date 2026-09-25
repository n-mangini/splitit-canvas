import { defineConfig, devices } from '@playwright/test'

// Mobile primero: el prototipo se revisa a 390px antes que en desktop.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000/inicio',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
