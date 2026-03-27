import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { renderMarkdown } from '../../src/markdown/pipeline.ts'

describe('custom containers', () => {
  it('renders :::info container', async () => {
    const html = await renderMarkdown(':::info\nSome info\n:::')
    assert.ok(html.includes('container-info'))
  })

  it('renders :::warning container', async () => {
    const html = await renderMarkdown(':::warning\nBe careful\n:::')
    assert.ok(html.includes('container-warning'))
  })

  it('renders :::tip container', async () => {
    const html = await renderMarkdown(':::tip\nA helpful tip\n:::')
    assert.ok(html.includes('container-tip'))
  })

  it('renders :::danger container', async () => {
    const html = await renderMarkdown(':::danger\nDangerous!\n:::')
    assert.ok(html.includes('container-danger'))
  })
})
