<template>
  <div v-if="headings.length > 0" class="toc-page">
    <h2 class="toc-title">Table des matières</h2>
    <ul class="toc-list">
      <li
        v-for="(heading, i) in numberedHeadings"
        :key="i"
        :class="'toc-level-' + heading.level"
      >
        <a :href="'#' + heading.id">{{ heading.number }} - {{ heading.text }}</a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface TocHeading {
  level: number
  text: string
  id: string
}

const { headings } = defineProps<{ headings: TocHeading[] }>()

const numberedHeadings = computed(() => {
  let h2 = 0, h3 = 0, h4 = 0
  return headings.map(h => {
    let number = ''
    if (h.level === 2) {
      h2++; h3 = 0; h4 = 0
      number = `${h2}`
    } else if (h.level === 3) {
      h3++; h4 = 0
      number = `${h2}.${h3}`
    } else if (h.level === 4) {
      h4++
      number = `${h2}.${h3}.${h4}`
    }
    return { ...h, number }
  })
})
</script>

<style scoped>
.toc-page {
  min-height: 100px;
}

.toc-title {
  font-size: 1.5em;
  margin-bottom: 16px;
}

.toc-list {
  list-style: none;
  padding: 0;
}

.toc-list li {
  padding: 4px 0;
}

.toc-list a {
  color: #333;
  text-decoration: none;
}

.toc-list a:hover {
  text-decoration: underline;
  color: #1976D2;
}

.toc-level-3 { padding-left: 1.5em; }
.toc-level-4 { padding-left: 3em; }
.toc-level-5 { padding-left: 4.5em; }
.toc-level-6 { padding-left: 6em; }
</style>
