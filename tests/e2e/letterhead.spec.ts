import { test, expect } from '@playwright/test'

const LETTERHEAD = 'http://localhost:5274/'
const LETTERHEAD_LONG = 'http://localhost:5275/'

test('letterhead layout replaces the title page with a header band', async ({ page }) => {
  await page.goto(LETTERHEAD)
  await expect(page.locator('html[data-pagination-done="true"]')).toBeAttached({ timeout: 15_000 })

  await expect(page.locator('.title-page')).toHaveCount(0)
  await expect(page.locator('.toc-page')).toHaveCount(0)

  const header = page.locator('.letterhead-header')
  await expect(header).toBeVisible()
  await expect(header).toContainText('SAS Koumoul')
  await expect(header).toContainText('56000 VANNES')
  await expect(header.locator('img')).toBeVisible()
})

test('letterhead header carries reference, place, date and title', async ({ page }) => {
  await page.goto(LETTERHEAD)
  await expect(page.locator('html[data-pagination-done="true"]')).toBeAttached({ timeout: 15_000 })

  const header = page.locator('.letterhead-header')
  await expect(header).toContainText('Réf. 2026-014')
  await expect(header).toContainText('Fait à Vannes, le 13/08/2026')
  await expect(header.locator('h1')).toHaveText('Attestation de conformité')
})

test('letterhead band uses the circular logo, not the title page one', async ({ page }) => {
  await page.goto(LETTERHEAD)
  await expect(page.locator('html[data-pagination-done="true"]')).toBeAttached({ timeout: 15_000 })

  const img = page.locator('.letterhead-header img')
  await expect(img).toHaveAttribute('src', '/@doc-theme-letterhead-logo')
  // The circular logo is 250×250; the title page logo is 1696×498
  const size = await img.evaluate((el) => ({
    width: (el as HTMLImageElement).naturalWidth,
    height: (el as HTMLImageElement).naturalHeight
  }))
  expect(size).toEqual({ width: 250, height: 250 })
})

test('letterhead headings are not numbered', async ({ page }) => {
  await page.goto(LETTERHEAD)
  await expect(page.locator('html[data-pagination-done="true"]')).toBeAttached({ timeout: 15_000 })

  await expect(page.locator('h2#objet')).toHaveText('Objet')
  await expect(page.locator('h2#engagements-de-service')).toHaveText('Engagements de service')
})

test('letterhead example fits a single page without a page counter', async ({ page }) => {
  await page.goto(LETTERHEAD)
  await expect(page.locator('html[data-pagination-done="true"]')).toBeAttached({ timeout: 15_000 })

  await expect(page.locator('.a4-page')).toHaveCount(1)
  await expect(page.locator('.page-footer')).toContainText('SIREN : 828983478')
  await expect(page.locator('.page-footer-count')).toHaveCount(0)
})

test('overflowing letterhead content spills to a second page without repeating the header', async ({ page }) => {
  await page.goto(LETTERHEAD_LONG)
  await expect(page.locator('html[data-pagination-done="true"]')).toBeAttached({ timeout: 15_000 })

  const pages = page.locator('.a4-page')
  await expect(pages).toHaveCount(2)
  await expect(pages.nth(0).locator('.letterhead-header')).toHaveCount(1)
  await expect(pages.nth(1).locator('.letterhead-header')).toHaveCount(0)

  // Every page keeps the legal footer, and the counter reappears past one page
  await expect(page.locator('.page-footer')).toHaveCount(2)
  await expect(pages.nth(1).locator('.page-footer-count')).toContainText('2')
})

test('first page content stays inside the page once the header is accounted for', async ({ page }) => {
  await page.goto(LETTERHEAD_LONG)
  await expect(page.locator('html[data-pagination-done="true"]')).toBeAttached({ timeout: 15_000 })

  const firstPage = page.locator('.a4-page').first()
  const pageBox = await firstPage.boundingBox()
  const footerBox = await firstPage.locator('.page-footer').boundingBox()
  const lastBlock = firstPage.locator('.doc-content > *').last()
  const lastBox = await lastBlock.boundingBox()

  expect(pageBox).not.toBeNull()
  expect(footerBox).not.toBeNull()
  expect(lastBox).not.toBeNull()
  // Content must not run past the footer, i.e. must not bleed out of the page
  expect(lastBox!.y + lastBox!.height).toBeLessThanOrEqual(footerBox!.y + 1)
})
