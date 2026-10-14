import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseDocument } from '../../src/markdown/frontmatter.ts'

describe('parseDocument', () => {
  it('extracts frontmatter from markdown', () => {
    const raw = `---
title: Test Document
version: "1.0"
date: "2025-01-01"
---

# Hello World`

    const result = parseDocument(raw)
    assert.equal(result.frontmatter.title, 'Test Document')
    assert.equal(result.frontmatter.version, '1.0')
    assert.equal(result.frontmatter.date, '2025-01-01')
    assert.ok(result.body.includes('# Hello World'))
  })

  it('handles missing frontmatter', () => {
    const raw = '# No frontmatter'
    const result = parseDocument(raw)
    assert.deepEqual(result.frontmatter, {})
    assert.ok(result.body.includes('# No frontmatter'))
  })

  it('extracts optional fields', () => {
    const raw = `---
title: Test
description: A test document
warning: Draft only
toc: false
---

Content`

    const result = parseDocument(raw)
    assert.equal(result.frontmatter.description, 'A test document')
    assert.equal(result.frontmatter.warning, 'Draft only')
    assert.equal(result.frontmatter.toc, false)
  })

  it('keeps an unquoted date as a string', () => {
    const result = parseDocument('---\ndate: 2025-01-15\n---\n')
    assert.equal(result.frontmatter.date, '2025-01-15')
  })

  it('strips a BOM and handles CRLF line endings', () => {
    const result = parseDocument('\uFEFF---\r\ntitle: Test\r\n---\r\nBody')
    assert.deepEqual(result.frontmatter, { title: 'Test' })
    assert.equal(result.body, 'Body')
  })

  it('treats an empty or comment-only block as no frontmatter', () => {
    assert.deepEqual(parseDocument('---\n---\nBody'), { frontmatter: {}, body: 'Body' })
    assert.deepEqual(parseDocument('---\n# note\n---\nBody'), { frontmatter: {}, body: 'Body' })
  })

  it('does not treat a longer dash line as a delimiter', () => {
    const raw = '----\ntitle: Test\n----'
    assert.deepEqual(parseDocument(raw), { frontmatter: {}, body: raw })
  })
})
