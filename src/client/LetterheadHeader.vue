<template>
  <div class="letterhead-header">
    <div class="letterhead-band">
      <div v-if="letterhead || hasLogo" class="letterhead-identity">
        <img v-if="hasLogo" class="letterhead-logo" :src="logoUrl" alt="Logo">
        <div v-if="letterhead" class="letterhead-lines">
          <span class="letterhead-name">{{ letterhead.name }}</span>
          <span v-for="line in letterhead.lines" :key="line">{{ line }}</span>
        </div>
      </div>
      <div v-if="frontmatter.reference || dateLine" class="letterhead-meta">
        <span v-if="frontmatter.reference">Réf. {{ frontmatter.reference }}</span>
        <span v-if="dateLine">{{ dateLine }}</span>
      </div>
    </div>
    <h1 v-if="frontmatter.title" class="letterhead-title">{{ frontmatter.title }}</h1>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Frontmatter } from '../types.ts'
import { config } from 'virtual:doc-config'

const { frontmatter } = defineProps<{ frontmatter: Frontmatter }>()
const hasLogo = config.hasLetterheadLogo
const logoUrl = '/@doc-theme-letterhead-logo'
const letterhead = config.letterhead

const dateLine = computed(() => {
  const date = frontmatter.date ? new Date(frontmatter.date).toLocaleDateString('fr-FR') : ''
  if (frontmatter.place && date) return `Fait à ${frontmatter.place}, le ${date}`
  if (frontmatter.place) return `Fait à ${frontmatter.place}`
  if (date) return `Le ${date}`
  return ''
})
</script>

<style scoped>
.letterhead-header {
  margin-bottom: 1.2em;
}

.letterhead-band {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.letterhead-identity {
  display: flex;
  align-items: center;
  gap: 20px;
}

.letterhead-logo {
  max-height: 70px;
  max-width: 120px;
  object-fit: contain;
}

.letterhead-lines {
  display: flex;
  flex-direction: column;
  font-size: 0.9em;
  line-height: 1.4;
}

.letterhead-name {
  font-weight: 700;
}

.letterhead-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  font-size: 0.9em;
  white-space: nowrap;
}

.letterhead-title {
  font-size: 1.6em;
  margin: 3.2em 0 0;
  text-align: center;
}
</style>
