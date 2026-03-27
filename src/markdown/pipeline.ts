import MarkdownIt from 'markdown-it'
import Token from 'markdown-it/lib/token.mjs'
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

  // Add IDs and section numbers to headings
  const headingCounters = { h2: 0, h3: 0, h4: 0 }

  const defaultHeadingOpen = md.renderer.rules.heading_open ||
    function (tokens, idx, options, _env, self) { return self.renderToken(tokens, idx, options) }

  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const level = parseInt(token.tag[1])
    const contentToken = tokens[idx + 1]

    // Compute section number
    let number = ''
    if (level === 2) {
      headingCounters.h2++; headingCounters.h3 = 0; headingCounters.h4 = 0
      number = `${headingCounters.h2}`
    } else if (level === 3) {
      headingCounters.h3++; headingCounters.h4 = 0
      number = `${headingCounters.h2}.${headingCounters.h3}`
    } else if (level === 4) {
      headingCounters.h4++
      number = `${headingCounters.h2}.${headingCounters.h3}.${headingCounters.h4}`
    }

    if (contentToken && contentToken.children) {
      const text = contentToken.children
        .filter(t => t.type === 'text' || t.type === 'code_inline')
        .map(t => t.content)
        .join('')
      const id = slugify(text)
      token.attrSet('id', id)

      // Prepend section number to heading content
      if (number && contentToken.children.length > 0) {
        const numberToken = new Token('text', '', 0)
        numberToken.content = `${number} - `
        contentToken.children.unshift(numberToken)
      }
    }
    return defaultHeadingOpen(tokens, idx, options, env, self)
  }

  // Wrap images with alt text in <figure> with <figcaption>
  const defaultImage = md.renderer.rules.image ||
    function (tokens, idx, options, _env, self) { return self.renderToken(tokens, idx, options) }

  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const alt = token.children?.reduce((text, t) => text + t.content, '') || ''
    const img = defaultImage(tokens, idx, options, env, self)
    if (alt) {
      return `<figure>${img}<figcaption>${md.utils.escapeHtml(alt)}</figcaption></figure>`
    }
    return img
  }

  // Unwrap <p> tags that only contain a <figure> (block-in-inline is invalid HTML)
  const originalRender = md.render.bind(md)
  md.render = (src: string, env?: any) => {
    let html = originalRender(src, env)
    html = html.replace(/<p>(<figure>[\s\S]*?<\/figure>)<\/p>/g, '$1')
    return html
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
