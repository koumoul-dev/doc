<template>
  <div ref="container" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const container = ref<HTMLElement>()
const emit = defineEmits<{ done: [] }>()

onMounted(async () => {
  const blocks = document.querySelectorAll<HTMLElement>('pre.mermaid')
  if (blocks.length > 0) {
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({ startOnLoad: false, theme: 'default' })
    await mermaid.run({ nodes: blocks })
  }
  emit('done')
})
</script>
