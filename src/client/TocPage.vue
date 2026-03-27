<template>
  <div v-if="headings.length > 0" class="toc-page">
    <h2 v-if="showTitle" class="toc-title">Table des matières</h2>
    <ul class="toc-list">
      <li
        v-for="(heading, i) in headings"
        :key="i"
        :class="'toc-level-' + heading.level"
      >
        <a :href="'#' + heading.id">{{ heading.text }}</a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
export interface TocHeading {
  level: number
  text: string
  id: string
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
