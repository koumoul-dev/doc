<template>
  <div class="title-page">
    <div v-if="hasLogo" class="title-logo">
      <img :src="logoUrl" alt="Logo">
    </div>
    <h1 class="title-heading">{{ frontmatter.title }}</h1>
    <p v-if="frontmatter.version && frontmatter.date" class="title-version">
      Version {{ frontmatter.version }} du {{ formatDate(frontmatter.date) }}
    </p>
    <div v-else class="title-draft-warning">
      Cette page n'a pas encore de numero de version ou de date. Il s'agit donc d'un brouillon.
    </div>
    <p v-if="frontmatter.description" class="title-description">
      {{ frontmatter.description }}
    </p>
    <div v-if="frontmatter.warning" class="title-warning">
      {{ frontmatter.warning }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Frontmatter } from '../types.ts'
import { config } from 'virtual:doc-config'

const { frontmatter } = defineProps<{ frontmatter: Frontmatter }>()
const hasLogo = config.hasLogo
const logoUrl = '/@doc-theme-logo'

function formatDate (dateStr: string | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR')
}
</script>

<style scoped>
.title-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250mm;
  text-align: center;
}

.title-logo {
  margin-bottom: 60px;
}

.title-logo img {
  max-width: 400px;
}

.title-heading {
  font-size: 2.2em;
  color: #414141;
  margin-bottom: 24px;
  border: none;
  padding: 0;
}

.title-version {
  font-weight: bold;
  margin-bottom: 24px;
}

.title-draft-warning {
  border: 2px solid #D50000;
  color: #D50000;
  padding: 12px 24px;
  border-radius: 4px;
  margin-bottom: 24px;
}

.title-description {
  margin-bottom: 24px;
  max-width: 80%;
}

.title-warning {
  border: 2px solid #D50000;
  color: #D50000;
  padding: 12px 24px;
  border-radius: 4px;
}
</style>
