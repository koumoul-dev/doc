<template>
  <div class="page-footer">
    <span>{{ title }}</span>
    <span>{{ page }}&thinsp;/&thinsp;{{ total }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  page: number
  total: number
}>()
</script>
