import type { Plugin } from 'vite'
import type { DocConfig } from '../types.ts'

const VIRTUAL_ID = 'virtual:doc-config'
const RESOLVED_ID = '\0' + VIRTUAL_ID

export function docConfigPlugin (config: DocConfig): Plugin {
  return {
    name: 'koumoul-doc-config',

    resolveId (id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },

    load (id) {
      if (id !== RESOLVED_ID) return
      return `export const config = ${JSON.stringify(config)}`
    }
  }
}
