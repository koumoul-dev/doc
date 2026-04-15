import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { renderMarkdown } from '../../src/markdown/pipeline.ts'

const cases: Array<{ type: 'info' | 'warning' | 'tip' | 'danger', inner: string }> = [
  { type: 'info', inner: 'Some info' },
  { type: 'warning', inner: 'Be careful' },
  { type: 'tip', inner: 'A helpful tip' },
  { type: 'danger', inner: 'Dangerous!' }
]

describe('custom containers', () => {
  for (const { type, inner } of cases) {
    it(`renders :::${type} with wrapping div and inner content`, async () => {
      const html = await renderMarkdown(`:::${type}\n${inner}\n:::`)
      assert.ok(
        html.includes(`<div class="container container-${type}">`),
        `expected opening div for container-${type}`
      )
      assert.ok(html.includes(inner), 'expected inner markdown content to render')
      assert.ok(html.includes('</div>'), 'expected container to close with </div>')
    })
  }

  it('renders inner markdown (paragraphs) inside a container', async () => {
    const html = await renderMarkdown(':::info\nFirst line\n\nSecond line\n:::')
    assert.ok(html.includes('<div class="container container-info">'))
    assert.ok(html.includes('<p>First line</p>'))
    assert.ok(html.includes('<p>Second line</p>'))
  })
})
