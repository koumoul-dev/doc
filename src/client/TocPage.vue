<template>
  <div v-if="headings.length > 0" class="toc-page">
    <h2 v-if="showTitle" class="toc-title">Table des matières</h2>
    <ul class="toc-list">
      <li
        v-for="(heading, i) in headings"
        :key="i"
        :class="'toc-level-' + heading.level"
      >
        <a :href="'#' + heading.id" class="toc-link">
          <span class="toc-text">{{ heading.text }}</span>
          <span class="toc-dots" />
          <span v-if="heading.pageNumber != null" class="toc-pagenum">{{ heading.pageNumber }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
export interface TocHeading {
  level: number
  text: string
  id: string
  pageNumber?: number
}

withDefaults(defineProps<{
  headings: TocHeading[]
  showTitle?: boolean
}>(), {
  showTitle: true
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
  padding: 1px 0;
  line-height: 1.3;
}

.toc-list a {
  color: #333;
  text-decoration: none;
}

.toc-list a:hover {
  text-decoration: underline;
  color: #1976D2;
}

.toc-link {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.toc-dots {
  flex: 1;
  border-bottom: 1px dotted #bbb;
  transform: translateY(-4px);
  min-width: 16px;
}

.toc-pagenum {
  font-variant-numeric: tabular-nums;
  color: #666;
}

.toc-list li.toc-level-3 { padding: 1px 0 1px 1.5em; font-size: 0.92em; }
.toc-list li.toc-level-4 { padding: 0 0 0 3em;       font-size: 0.86em; }
.toc-list li.toc-level-5 { padding: 0 0 0 4.5em;     font-size: 0.8em; }
.toc-list li.toc-level-6 { padding: 0 0 0 6em;       font-size: 0.75em; }
</style>
