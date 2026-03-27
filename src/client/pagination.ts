/**
 * Measurement-based A4 pagination composable.
 *
 * Measures block elements in an off-screen div matching A4 content dimensions,
 * then returns reactive page assignments so Vue can render .a4-page wrappers.
 *
 * Inspired by https://github.com/ntua-el21661/md-a4
 */

import { ref, type Ref } from 'vue'

/** Usable content height inside an A4 page (297mm - 15mm top - 20.5mm bottom for footer) */
const CONTENT_HEIGHT_MM = 261.5
/** Usable content width (210mm - 2 × 15mm) */
const CONTENT_WIDTH_MM = 180

/** A page is an array of block indices (into the blocks array) */
export interface PageAssignment {
  blockIndices: number[]
}

export interface PaginationState {
  /** Reactive array of content page assignments (excludes title/toc pages) */
  contentPages: Ref<PageAssignment[]>
  /** Total page count including title and toc */
  totalPages: Ref<number>
  /** Whether pagination has been computed */
  ready: Ref<boolean>
  /** Run pagination measurement. Call after mermaid + images are ready. */
  paginate: (contentEl: HTMLElement, blocks: string[], hasTitlePage: boolean, hasTocPage: boolean) => void
}

export function usePagination (): PaginationState {
  const contentPages = ref<PageAssignment[]>([])
  const totalPages = ref(0)
  const ready = ref(false)

  function paginate (contentEl: HTMLElement, blocks: string[], hasTitlePage: boolean, hasTocPage: boolean): void {
    // Get all rendered block elements from the content container
    const elements = Array.from(contentEl.children) as HTMLElement[]

    // Create off-screen measurer matching A4 content area width
    const measurer = document.createElement('div')
    measurer.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: ${CONTENT_WIDTH_MM}mm;
      visibility: hidden;
    `
    document.body.appendChild(measurer)

    // Get max content height in pixels
    const heightRef = document.createElement('div')
    heightRef.style.height = `${CONTENT_HEIGHT_MM}mm`
    measurer.appendChild(heightRef)
    const maxH = heightRef.getBoundingClientRect().height
    measurer.removeChild(heightRef)

    // Distribute blocks into pages by measurement
    const pages: number[][] = [[]]

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i]

      // Page break forces a new page
      if (el.classList.contains('page-break')) {
        if (pages[pages.length - 1].length > 0) {
          pages.push([])
        }
        continue
      }

      // Clone into measurer and check height
      const clone = el.cloneNode(true) as HTMLElement
      measurer.appendChild(clone)

      if (measurer.scrollHeight > maxH) {
        // Doesn't fit
        measurer.removeChild(clone)

        if (pages[pages.length - 1].length > 0) {
          // Flush current page, clear measurer, retry on new page
          pages.push([])
          clearChildren(measurer)
          i-- // retry this element
        } else {
          // First element on fresh page — accept even if too tall
          pages[pages.length - 1].push(i)
          clearChildren(measurer)
        }
      } else {
        // Fits on current page
        pages[pages.length - 1].push(i)
      }
    }

    // Prevent orphan headings (a heading left alone at the bottom of a page)
    for (let p = 0; p < pages.length - 1; p++) {
      const indices = pages[p]
      if (indices.length < 2) continue
      const lastIdx = indices[indices.length - 1]
      const el = elements[lastIdx]
      const tag = el?.firstElementChild?.tagName || el?.tagName
      if (tag && /^H[1-6]$/.test(tag)) {
        // Move the heading to the next page
        indices.pop()
        pages[p + 1].unshift(lastIdx)
      }
    }

    // Clean up
    document.body.removeChild(measurer)

    // Filter empty pages and build assignments
    const filtered = pages.filter(p => p.length > 0)
    contentPages.value = filtered.map(indices => ({ blockIndices: indices }))

    let count = 0
    if (hasTitlePage) count++
    if (hasTocPage) count++
    count += filtered.length
    totalPages.value = count

    ready.value = true

    // Signal for Puppeteer
    document.documentElement.dataset.paginationDone = 'true'
  }

  return { contentPages, totalPages, ready, paginate }
}

function clearChildren (el: HTMLElement): void {
  while (el.firstChild) {
    el.removeChild(el.firstChild)
  }
}
