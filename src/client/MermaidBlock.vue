<template>
  <div ref="container" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const container = ref<HTMLElement>()
const emit = defineEmits<{ done: [] }>()

function el (tag: string, className: string, text: string): HTMLElement {
  const node = document.createElement(tag)
  node.className = className
  node.textContent = text
  return node
}

onMounted(async () => {
  const blocks = document.querySelectorAll<HTMLElement>('pre.mermaid')
  if (blocks.length > 0) {
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({ startOnLoad: false, theme: 'default' })

    // Render each diagram individually so a single block with invalid syntax
    // does not abort the whole render (which would leave pagination waiting
    // forever). On failure the error and original source are shown inline.
    let i = 0
    for (const block of blocks) {
      const source = block.textContent ?? ''
      const id = `mermaid-svg-${i++}`
      try {
        const { svg, bindFunctions } = await mermaid.render(id, source)
        block.innerHTML = svg
        bindFunctions?.(block)
      } catch (err) {
        document.getElementById(id)?.remove() // drop mermaid's leftover temp node
        document.getElementById('d' + id)?.remove()
        const message = err instanceof Error ? err.message : String(err)
        block.closest('.mermaid-block')?.classList.add('mermaid-error')
        const content = document.createElement('div')
        content.className = 'mermaid-error-content'
        content.append(
          el('p', 'mermaid-error-title', 'Invalid mermaid syntax'),
          el('pre', 'mermaid-error-detail', message),
          el('pre', 'mermaid-error-source', source)
        )
        block.replaceWith(content)
      }
    }
  }
  emit('done')
})
</script>
