import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:5183' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ],
  webServer: {
    command: './node_modules/.bin/vite --port 5183',
    url: 'http://127.0.0.1:5183',
    reuseExistingServer: false
  }
})
