import { defineConfig } from '@playwright/test'

// Dedicated ports, away from the default Vite 5173 that other projects use
const EXAMPLE_PORT = 5273
const LETTERHEAD_PORT = 5274
const LETTERHEAD_LONG_PORT = 5275

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: `http://localhost:${EXAMPLE_PORT}`,
    screenshot: 'only-on-failure'
  },
  webServer: [
    {
      command: `node src/cli/index.ts dev examples/example.md --port ${EXAMPLE_PORT}`,
      port: EXAMPLE_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 15_000
    },
    {
      command: `node src/cli/index.ts dev examples/letterhead.md --port ${LETTERHEAD_PORT}`,
      port: LETTERHEAD_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 15_000
    },
    {
      command: `node src/cli/index.ts dev tests/e2e/fixtures/letterhead-long.md --port ${LETTERHEAD_LONG_PORT}`,
      port: LETTERHEAD_LONG_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 15_000
    }
  ]
})
