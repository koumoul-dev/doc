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
const measureEl = ref<HTMLElement>()
const contentEl = ref<HTMLElement>()
const tocEl = ref<HTMLElement>()
const pagination = usePagination()

const hasToc = computed(() => frontmatter.toc !== false)

let mermaidDone = false
let isMounted = false

function extractHeadings () {
  if (!contentEl.value) return
  const els = contentEl.value.querySelectorAll('h2, h3, h4, h5, h6')
  headings.value = Array.from(els).map(el => ({
    level: parseInt(el.tagName[1]),
    text: el.textContent || '',
    id: el.id
  }))
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
