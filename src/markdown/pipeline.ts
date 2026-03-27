import MarkdownIt from 'markdown-it'
import { applyContainers } from './containers.ts'
import { applyMermaid } from './mermaid.ts'

function slugify (text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createMarkdownPipeline (): Promise<MarkdownIt> {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
  })

  // Shiki syntax highlighting
  const { createHighlighter } = await import('shiki')
  const highlighter = await createHighlighter({
    themes: ['github-light'],
    langs: ['javascript', 'typescript', 'json', 'html', 'css', 'bash', 'yaml', 'markdown', 'python', 'sql']
  })

  md.options.highlight = (code, lang) => {
    if (!lang || lang === 'mermaid') return ''
    try {
      return highlighter.codeToHtml(code, { lang, theme: 'github-light' })
    } catch {
      return ''
    }
  }

  // Convert thematic breaks (---) to page breaks
  md.renderer.rules.hr = () => {
    return '<div class="page-break" style="break-before: page"></div>\n'
  }

  // Add IDs to headings for TOC linking
  const defaultHeadingOpen = md.renderer.rules.heading_open ||
    function (tokens, idx, options, _env, self) { return self.renderToken(tokens, idx, options) }

  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const contentToken = tokens[idx + 1]
    if (contentToken && contentToken.children) {
      const text = contentToken.children
        .filter(t => t.type === 'text' || t.type === 'code_inline')
        .map(t => t.content)
        .join('')
      const id = slugify(text)
      token.attrSet('id', id)
    }
    return defaultHeadingOpen(tokens, idx, options, env, self)
  }

  // Apply extensions
  applyContainers(md)
  applyMermaid(md)

  return md
}

export async function renderMarkdown (body: string): Promise<string> {
  const md = await createMarkdownPipeline()
  return md.render(body)
}
