import type MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'

const containerTypes = ['warning', 'info', 'tip', 'danger']

export function applyContainers (md: MarkdownIt): void {
  for (const type of containerTypes) {
    md.use(container, type, {
      render (tokens: { nesting: number }[], idx: number) {
        if (tokens[idx].nesting === 1) {
          return `<div class="container container-${type}">\n`
        }
        return '</div>\n'
      }
    })
  }
}
