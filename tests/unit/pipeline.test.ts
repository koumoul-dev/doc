import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { renderMarkdown } from '../../src/markdown/pipeline.ts'

describe('renderMarkdown', () => {
  it('renders basic markdown', async () => {
    const html = await renderMarkdown('# Hello\n\nWorld')
    assert.ok(html.includes('<h1'))
    assert.ok(html.includes('Hello'))
    assert.ok(html.includes('<p>World</p>'))
  })

  it('adds IDs to headings', async () => {
    const html = await renderMarkdown('## My Section')
    assert.ok(html.includes('id="my-section"'))
  })

  it('converts thematic breaks to page breaks', async () => {
    const html = await renderMarkdown('Before\n\n---\n\nAfter')
    assert.ok(html.includes('class="page-break"'))
    assert.ok(html.includes('break-before: page'))
  })

  it('renders code blocks with syntax highlighting', async () => {
    const html = await renderMarkdown('```javascript\nconst x = 1\n```')
    assert.ok(html.includes('shiki'))
  })

  it('renders mermaid blocks as pre.mermaid', async () => {
    const html = await renderMarkdown('```mermaid\ngraph TD\n  A --> B\n```')
    assert.ok(html.includes('class="mermaid"'))
  })
})
