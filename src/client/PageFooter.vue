<template>
  <div class="page-footer">
    <span class="page-footer-title">{{ title }}</span>
    <span v-if="legal" class="page-footer-legal">{{ legal }}</span>
    <span v-if="showCount" class="page-footer-count">{{ page }}&thinsp;/&thinsp;{{ total }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  page: number
  total: number
  /** Legal mentions printed under every page, provided by the letterhead theme */
  legal?: string
  showCount?: boolean
}>(), { legal: undefined, showCount: true })
</script>
