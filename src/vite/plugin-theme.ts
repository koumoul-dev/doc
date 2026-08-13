import { readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import type { Plugin } from 'vite'
import type { DocTheme } from '../types.ts'
import { letterheadLogoPath } from '../themes/resolve.ts'

const VIRTUAL_ID = 'virtual:doc-theme-style.css'
const RESOLVED_ID = '\0virtual:doc-theme-style.css'

export function docThemePlugin (theme: DocTheme): Plugin {
  const themeDirs = theme.styles.map(s => dirname(s))
  if (theme.logo) themeDirs.push(dirname(theme.logo))
  const letterheadLogo = letterheadLogoPath(theme)
  if (letterheadLogo) themeDirs.push(dirname(letterheadLogo))

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
      if (letterheadLogo) {
        alias['/@doc-theme-letterhead-logo'] = letterheadLogo
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
      const servePng = (path: string) => (_req: unknown, res: { setHeader: (k: string, v: string) => void, end: (c: Buffer) => void }) => {
        res.setHeader('Content-Type', 'image/png')
        res.end(readFileSync(path))
      }
      if (theme.logo) server.middlewares.use('/@doc-theme-logo', servePng(theme.logo))
      if (letterheadLogo) server.middlewares.use('/@doc-theme-letterhead-logo', servePng(letterheadLogo))
    }
  }
}
