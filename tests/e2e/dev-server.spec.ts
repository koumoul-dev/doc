import { test, expect } from '@playwright/test'

test('dev server starts and page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#app')).toBeVisible()
})

test('document has A4 preview layout', async ({ page }) => {
  await page.goto('/')
  const document = page.locator('.document')
  await expect(document).toBeVisible()
})

test('title page displays frontmatter', async ({ page }) => {
  await page.goto('/')
  const titlePage = page.locator('.title-page')
  await expect(titlePage).toBeVisible()
  await expect(titlePage.locator('.title-heading')).toContainText('Example Document')
})
