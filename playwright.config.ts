import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'node src/cli/index.ts dev examples/example.md --port 5173',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000
  }
})
