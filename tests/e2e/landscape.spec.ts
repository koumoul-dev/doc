import { test, expect } from '@playwright/test'

const LANDSCAPE = 'http://localhost:5276/'

test('landscape document renders 297 × 210 mm pages', async ({ page }) => {
  await page.goto(LANDSCAPE)
  await expect(page.locator('html[data-pagination-done="true"]')).toBeAttached({ timeout: 15_000 })

  const box = await page.locator('.a4-page').first().boundingBox()
  expect(box).not.toBeNull()
  // 297mm ≈ 1122.5px and 210mm ≈ 793.7px at 96dpi, with a small tolerance
  expect(box!.width).toBeGreaterThan(1120)
  expect(box!.width).toBeLessThan(1125)
  expect(box!.height).toBeGreaterThan(791)
  expect(box!.height).toBeLessThan(796)
})

test('landscape document appends the landscape print rule', async ({ page }) => {
  await page.goto(LANDSCAPE)
  await expect(page.locator('html[data-pagination-done="true"]')).toBeAttached({ timeout: 15_000 })

  const found = await page.evaluate(() =>
    Array.from(document.querySelectorAll('style'))
      .some(s => s.textContent?.includes('size: A4 landscape'))
  )
  expect(found).toBe(true)
})
