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

/** A TOC page holds a range of heading indices and whether to show the title */
export interface TocPageAssignment {
  headingIndices: number[]
  showTitle: boolean
}

export interface PaginationState {
  /** Reactive array of content page assignments (excludes title/toc pages) */
  contentPages: Ref<PageAssignment[]>
  /** Reactive array of TOC page assignments */
  tocPages: Ref<TocPageAssignment[]>
  /** Total page count including title and toc */
  totalPages: Ref<number>
  /** Whether pagination has been computed */
  ready: Ref<boolean>
  /** Run pagination measurement. Call after mermaid + images are ready. */
  paginate: (contentEl: HTMLElement, blocks: string[], hasTitlePage: boolean, tocEl?: HTMLElement) => void
}

export function usePagination (): PaginationState {
  const contentPages = ref<PageAssignment[]>([])
  const tocPages = ref<TocPageAssignment[]>([])
  const totalPages = ref(0)
  const ready = ref(false)

  function paginate (contentEl: HTMLElement, blocks: string[], hasTitlePage: boolean, tocEl?: HTMLElement): void {
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

    // Paginate TOC if present
    const tocPagesResult: TocPageAssignment[] = []
    if (tocEl) {
      const titleEl = tocEl.querySelector('.toc-title')
      const listItems = Array.from(tocEl.querySelectorAll('.toc-list li'))

      if (listItems.length > 0) {
        tocPagesResult.push({ headingIndices: [], showTitle: true })

        // Clone title into measurer for first page
        if (titleEl) {
          measurer.appendChild(titleEl.cloneNode(true))
        }

        // Create a ul to accumulate items for measurement
        let currentUl = document.createElement('ul')
        currentUl.className = 'toc-list'
        copyComputedListStyles(tocEl.querySelector('.toc-list'), currentUl)
        measurer.appendChild(currentUl)

        for (let i = 0; i < listItems.length; i++) {
          const clone = listItems[i].cloneNode(true) as HTMLElement
          currentUl.appendChild(clone)

          if (measurer.scrollHeight > maxH) {
            currentUl.removeChild(clone)

            if (tocPagesResult[tocPagesResult.length - 1].headingIndices.length > 0) {
              // Start new TOC page
              tocPagesResult.push({ headingIndices: [], showTitle: false })
              clearChildren(measurer)
              currentUl = document.createElement('ul')
              currentUl.className = 'toc-list'
              copyComputedListStyles(tocEl.querySelector('.toc-list'), currentUl)
              measurer.appendChild(currentUl)
              i-- // retry this item on the new page
            } else {
              // First item on fresh page — accept even if too tall
              currentUl.appendChild(clone)
              tocPagesResult[tocPagesResult.length - 1].headingIndices.push(i)
              clearChildren(measurer)
              currentUl = document.createElement('ul')
              currentUl.className = 'toc-list'
              copyComputedListStyles(tocEl.querySelector('.toc-list'), currentUl)
              measurer.appendChild(currentUl)
            }
          } else {
            tocPagesResult[tocPagesResult.length - 1].headingIndices.push(i)
          }
        }

        clearChildren(measurer)
      }
    }

    // Distribute content blocks into pages by measurement
    const pages: number[][] = [[]]

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i]

      // Page break forces a new page (page-break class may be on the element
      // itself or on the first child when blocks are wrapped by the renderer)
      if (el.classList.contains('page-break') || el.firstElementChild?.classList.contains('page-break')) {
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
    tocPages.value = tocPagesResult.filter(p => p.headingIndices.length > 0)

    let count = 0
    if (hasTitlePage) count++
    count += tocPages.value.length
    count += filtered.length
    totalPages.value = count

    ready.value = true

    // Signal for Puppeteer
    document.documentElement.dataset.paginationDone = 'true'
  }

  return { contentPages, tocPages, totalPages, ready, paginate }
}

function copyComputedListStyles (source: Element | null, target: HTMLElement): void {
  target.style.listStyle = 'none'
  target.style.padding = '0'
  target.style.margin = '0'
  if (source) {
    const computed = window.getComputedStyle(source)
    target.style.fontSize = computed.fontSize
    target.style.lineHeight = computed.lineHeight
  }
}

function clearChildren (el: HTMLElement): void {
  while (el.firstChild) {
    el.removeChild(el.firstChild)
  }
}
