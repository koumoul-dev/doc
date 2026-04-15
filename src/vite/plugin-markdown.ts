import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { parseDocument } from '../markdown/frontmatter.ts'
import { renderMarkdown } from '../markdown/pipeline.ts'
import type { Plugin } from 'vite'

/**
 * Split rendered HTML into top-level block elements.
 * Uses a simple depth-tracking parser that handles nested tags correctly.
 */
export function splitHtmlBlocks (html: string): string[] {
  const blocks: string[] = []
  const parser = /<!--[\s\S]*?-->|<\/([\w-]+)\s*>|<([\w-]+)(?:\s[^>]*)?\/?>/g
  let depth = 0
  let blockStart = 0
  let match

  // Skip leading whitespace
  const trimmed = html.trim()
  if (!trimmed) return blocks

  while ((match = parser.exec(trimmed)) !== null) {
    if (match[0].startsWith('<!--')) {
      // Comment — ignore for depth tracking
      continue
    } else if (match[1]) {
      // Closing tag
      depth--
      if (depth === 0) {
        const block = trimmed.slice(blockStart, match.index + match[0].length).trim()
        if (block) blocks.push(block)
        blockStart = match.index + match[0].length
      }
    } else if (match[2]) {
      // Opening tag — check if self-closing
      const isSelfClosing = match[0].endsWith('/>') ||
        ['br', 'hr', 'img', 'input', 'meta', 'link'].includes(match[2].toLowerCase())
      if (isSelfClosing) {
        if (depth === 0) {
          const block = trimmed.slice(blockStart, match.index + match[0].length).trim()
          if (block) blocks.push(block)
          blockStart = match.index + match[0].length
        }
      } else {
        depth++
      }
    }
  }

  // Remaining text (shouldn't happen with well-formed HTML)
  const remainder = trimmed.slice(blockStart).trim()
  if (remainder) blocks.push(remainder)

  return blocks
}

const VIRTUAL_ID = 'virtual:doc-content'
const RESOLVED_ID = '\0' + VIRTUAL_ID

export function docMarkdownPlugin (docFile: string): Plugin {
  const absolutePath = resolve(docFile)
  const docDir = dirname(absolutePath)

  return {
    name: 'koumoul-doc-markdown',

    resolveId (id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },

    async load (id) {
      if (id !== RESOLVED_ID) return

      const raw = readFileSync(absolutePath, 'utf-8')
      const { frontmatter, body } = parseDocument(raw)
      let html = await renderMarkdown(body)

      // Rewrite relative image paths to use the doc-assets alias
      html = html.replace(
        /(<img\s+[^>]*src=")\.\/([^"]+)(")/g,
        '$1/@doc-assets/$2$3'
      )

      // Split HTML into top-level block elements for per-element pagination
      const blocks = splitHtmlBlocks(html)

      const blocksJson = JSON.stringify(blocks)
      const fmJson = JSON.stringify(frontmatter)

      return `
export const frontmatter = ${fmJson}
export const blocks = ${blocksJson}
`
    },

    configureServer (server) {
      server.watcher.add(absolutePath)
      server.watcher.on('change', (path) => {
        if (path === absolutePath) {
          const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
          if (mod) {
            server.moduleGraph.invalidateModule(mod)
            server.ws.send({ type: 'full-reload' })
          }
        }
      })
    },

    config () {
      return {
        resolve: {
          alias: {
            '/@doc-assets/': docDir + '/'
          }
        },
        server: {
          fs: {
            allow: [docDir]
          }
        }
      }
    }
  }
}
