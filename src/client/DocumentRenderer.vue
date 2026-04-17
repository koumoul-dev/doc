<template>
  <!-- Hidden measurement container — rendered first to measure block heights -->
  <div v-if="!pagination.ready.value" ref="measureEl" class="document-raw">
    <TitlePage :frontmatter="frontmatter" />
    <div v-if="hasToc" ref="tocEl">
      <TocPage :headings="headings" />
    </div>
    <div ref="contentEl" class="doc-content">
      <div v-for="(block, i) in blocks" :key="i" v-html="block" />
    </div>
    <MermaidBlock @done="onMermaidDone" />
  </div>

  <!-- Paginated output -->
  <div v-else class="document">
    <!-- Title page -->
    <div v-if="true" class="a4-page">
      <TitlePage :frontmatter="frontmatter" />
      <PageFooter :title="frontmatter.title || ''" :page="1" :total="pagination.totalPages.value" />
    </div>

    <!-- TOC pages -->
    <div v-for="(tocPage, ti) in pagination.tocPages.value" :key="'toc-' + ti" class="a4-page">
      <TocPage
        :headings="tocPage.headingIndices.map(i => headings[i])"
        :show-title="tocPage.showTitle"
      />
      <PageFooter :title="frontmatter.title || ''" :page="2 + ti" :total="pagination.totalPages.value" />
    </div>

    <!-- Content pages -->
    <div v-for="(page, pi) in pagination.contentPages.value" :key="pi" class="a4-page">
      <div class="doc-content">
        <div v-for="idx in page.blockIndices" :key="idx" v-html="blocks[idx]" />
      </div>
      <PageFooter
        :title="frontmatter.title || ''"
        :page="1 + pagination.tocPages.value.length + pi + 1"
        :total="pagination.totalPages.value"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { frontmatter, blocks } from 'virtual:doc-content'
import TitlePage from './TitlePage.vue'
import TocPage from './TocPage.vue'
import MermaidBlock from './MermaidBlock.vue'
import PageFooter from './PageFooter.vue'
import { usePagination } from './pagination.ts'
import type { TocHeading } from './TocPage.vue'

const headings = ref<TocHeading[]>([])
const headingBlockIndices: number[] = []
const measureEl = ref<HTMLElement>()
const contentEl = ref<HTMLElement>()
const tocEl = ref<HTMLElement>()
const pagination = usePagination()

const hasToc = computed(() => frontmatter.toc !== false)
const tocMaxLevel = computed(() => frontmatter.tocLevels ?? 2)

let mermaidDone = false
let isMounted = false

function extractHeadings () {
  if (!contentEl.value) return
  const max = tocMaxLevel.value + 1
  const selector = [2, 3, 4, 5, 6].filter(l => l <= max).map(l => 'h' + l).join(', ')
  if (!selector) {
    headings.value = []
    headingBlockIndices.length = 0
    return
  }
  const blockEls = Array.from(contentEl.value.children) as HTMLElement[]
  const els = contentEl.value.querySelectorAll(selector)
  headingBlockIndices.length = 0
  headings.value = Array.from(els).map(el => {
    let node: HTMLElement | null = el as HTMLElement
    while (node && node.parentElement !== contentEl.value) {
      node = node.parentElement
    }
    headingBlockIndices.push(node ? blockEls.indexOf(node) : -1)
    return {
      level: parseInt(el.tagName[1]),
      text: el.textContent || '',
      id: el.id
    }
  })
}

function stampPageNumbers () {
  const blockToPage = new Map<number, number>()
  pagination.contentPages.value.forEach((page, pi) => {
    for (const bi of page.blockIndices) blockToPage.set(bi, pi)
  })
  const base = 1 + pagination.tocPages.value.length
  headings.value = headings.value.map((h, i) => {
    const blockIdx = headingBlockIndices[i]
    const pageIdx = blockToPage.get(blockIdx)
    return pageIdx == null ? h : { ...h, pageNumber: base + pageIdx + 1 }
  })
}

async function waitForImages (): Promise<void> {
  if (!measureEl.value) return
  const images = measureEl.value.querySelectorAll('img')
  await Promise.all(Array.from(images).map(img => {
    if (img.complete) return Promise.resolve()
    return new Promise<void>(resolve => {
      img.addEventListener('load', () => resolve(), { once: true })
      img.addEventListener('error', () => resolve(), { once: true })
    })
  }))
}

async function runPagination () {
  if (!isMounted || !mermaidDone || !contentEl.value) return

  await nextTick()
  extractHeadings()
  await nextTick() // wait for TOC to render with extracted headings
  await waitForImages()

  pagination.paginate(contentEl.value, blocks, true, tocEl.value)
  stampPageNumbers()
}

function onMermaidDone () {
  // Capture mermaid-rendered SVGs back into the blocks array so the
  // paginated view (which re-renders blocks via v-html) shows the diagrams.
  if (contentEl.value) {
    const children = contentEl.value.children
    for (let i = 0; i < children.length; i++) {
      if (children[i].querySelector('.mermaid-block svg')) {
        blocks[i] = children[i].innerHTML
      }
    }
  }
  mermaidDone = true
  runPagination()
}

onMounted(() => {
  isMounted = true
  runPagination()
})
</script>
