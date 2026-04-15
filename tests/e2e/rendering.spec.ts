import { test, expect } from '@playwright/test'

test('markdown content renders', async ({ page }) => {
  await page.goto('/')
  const content = page.locator('.doc-content')
  await expect(content).toBeVisible()
  await expect(content.locator('h2#introduction')).toBeVisible()
})

test('headings have IDs for TOC linking', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h2#features')).toBeVisible()
  await expect(page.locator('h3#markdown-support')).toBeVisible()
})

test('TOC is generated from headings', async ({ page }) => {
  await page.goto('/')
  const toc = page.locator('.toc-page')
  await expect(toc).toBeVisible()
  await expect(toc.locator('a[href="#introduction"]')).toBeVisible()
})

test('custom containers render', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.container-info')).toBeVisible()
  await expect(page.locator('.container-tip')).toBeVisible()
  await expect(page.locator('.container-warning')).toBeVisible()
  await expect(page.locator('.container-danger')).toBeVisible()
})

test('code blocks have syntax highlighting', async ({ page }) => {
  await page.goto('/')
  // Shiki wraps code in a <pre> with a specific class
  await expect(page.locator('.shiki')).toHaveCount(2)
})

test('mermaid diagram renders', async ({ page }) => {
  await page.goto('/')
  // Wait for mermaid to render SVG
  await expect(page.locator('.mermaid-block svg')).toBeVisible({ timeout: 10_000 })
})

test('thematic break (---) forces a page break', async ({ page }) => {
  await page.goto('/')
  // Wait for pagination to finish
  await expect(page.locator('html[data-pagination-done="true"]')).toBeAttached({ timeout: 15_000 })

  // The a4-page containing the Conclusion heading must not contain the
  // mermaid diagram that precedes the thematic break in example.md.
  const conclusionPage = page.locator('.a4-page', { has: page.locator('h2#conclusion') })
  await expect(conclusionPage).toHaveCount(1)
  await expect(conclusionPage.locator('.mermaid-block')).toHaveCount(0)
})
