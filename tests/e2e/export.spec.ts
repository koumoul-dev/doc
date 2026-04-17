import { test, expect } from '@playwright/test'
import { execSync } from 'node:child_process'
import { existsSync, unlinkSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const outputPath = resolve('test-output.pdf')

test.beforeAll(() => {
  if (existsSync(outputPath)) unlinkSync(outputPath)
})

test.afterAll(() => {
  if (existsSync(outputPath)) unlinkSync(outputPath)
})

test('PDF export produces a valid file', async () => {
  execSync(`node src/cli/index.ts export examples/example.md --output ${outputPath}`, {
    timeout: 30_000,
    stdio: 'pipe'
  })

  expect(existsSync(outputPath)).toBe(true)
  const stat = statSync(outputPath)
  expect(stat.size).toBeGreaterThan(1000)
})
