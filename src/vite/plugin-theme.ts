import { readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import type { Plugin } from 'vite'
import type { DocTheme } from '../types.ts'

const VIRTUAL_ID = 'virtual:doc-theme-style.css'
const RESOLVED_ID = '\0virtual:doc-theme-style.css'

export function docThemePlugin (theme: DocTheme): Plugin {
  const themeDirs = theme.styles.map(s => dirname(s))
  if (theme.logo) themeDirs.push(dirname(theme.logo))

  return {
    name: 'koumoul-doc-theme',

    resolveId (id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },

    load (id) {
      if (id !== RESOLVED_ID) return
      return theme.styles.map(s => readFileSync(s, 'utf-8')).join('\n')
    },

    config () {
      const alias: Record<string, string> = {}
      if (theme.logo) {
        alias['/@doc-theme-logo'] = theme.logo
      }

      return {
        resolve: { alias },
        server: {
          fs: {
            allow: [...new Set(themeDirs)]
          }
        }
      }
    },

    configureServer (server) {
      if (!theme.logo) return
      server.middlewares.use('/@doc-theme-logo', (_req, res) => {
        const content = readFileSync(theme.logo!)
        res.setHeader('Content-Type', 'image/png')
        res.end(content)
      })
    }
  }
}
