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

describe('renderMarkdown — heading numbering', () => {
  it('numbers sequential h2 headings and prefixes the title with "N - "', async () => {
    const html = await renderMarkdown('## First\n\n## Second')
    assert.match(html, /<h2[^>]*id="first"[^>]*>1 - First<\/h2>/)
    assert.match(html, /<h2[^>]*id="second"[^>]*>2 - Second<\/h2>/)
  })

  it('numbers h3 headings hierarchically under h2', async () => {
    const html = await renderMarkdown('## Top\n\n### Sub A\n\n### Sub B')
    assert.match(html, /<h3[^>]*id="sub-a"[^>]*>1\.1 - Sub A<\/h3>/)
    assert.match(html, /<h3[^>]*id="sub-b"[^>]*>1\.2 - Sub B<\/h3>/)
  })

  it('numbers h4 headings hierarchically under h3', async () => {
    const html = await renderMarkdown('## Top\n\n### Sub\n\n#### Leaf')
    assert.match(html, /<h4[^>]*id="leaf"[^>]*>1\.1\.1 - Leaf<\/h4>/)
  })

  it('resets h3 and h4 counters when a new h2 appears', async () => {
    const md = '## One\n\n### A\n\n#### a1\n\n## Two\n\n### A2'
    const html = await renderMarkdown(md)
    assert.match(html, /<h3[^>]*>1\.1 - A<\/h3>/)
    assert.match(html, /<h4[^>]*>1\.1\.1 - a1<\/h4>/)
    // After second h2, h3 counter must restart at 1, not continue to 2
    assert.match(html, /<h3[^>]*>2\.1 - A2<\/h3>/)
  })

  it('does not number h1 headings', async () => {
    const html = await renderMarkdown('# Title\n\n## Section')
    assert.doesNotMatch(html, /<h1[^>]*>1 - Title<\/h1>/)
    assert.ok(html.includes('Title'))
    assert.match(html, /<h2[^>]*>1 - Section<\/h2>/)
  })

  it('slugifies headings with special characters', async () => {
    const html = await renderMarkdown('## Hello, World! (2026)')
    assert.match(html, /id="hello-world-2026"/)
  })
})

describe('renderMarkdown — image figures', () => {
  it('wraps an image with alt text in <figure><figcaption>', async () => {
    const html = await renderMarkdown('![A caption](/img.png)')
    assert.match(html, /<figure><img[^>]*src="\/img\.png"[^>]*><\/figure>|<figure><img[^>]*><figcaption>A caption<\/figcaption><\/figure>/)
    assert.ok(html.includes('<figcaption>A caption</figcaption>'))
  })

  it('does not wrap an image without alt text in a figure', async () => {
    const html = await renderMarkdown('![](/img.png)')
    assert.ok(!html.includes('<figure>'))
    assert.ok(!html.includes('<figcaption'))
    assert.ok(html.includes('<img'))
  })

  it('escapes HTML special characters inside figcaption', async () => {
    const html = await renderMarkdown('![a <b> & "c"](/img.png)')
    assert.ok(html.includes('<figcaption>'))
    assert.ok(html.includes('&lt;b&gt;'))
    assert.ok(html.includes('&amp;'))
    assert.ok(html.includes('&quot;'))
    // The raw unescaped version must not leak in the figcaption
    assert.ok(!html.includes('<figcaption>a <b>'))
  })

  it('does not wrap the figure in a <p> paragraph', async () => {
    const html = await renderMarkdown('![caption](/img.png)')
    assert.ok(!/<p>\s*<figure>/.test(html))
  })
})
