import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { splitHtmlBlocks } from '../../src/vite/plugin-markdown.ts'

describe('splitHtmlBlocks', () => {
  it('returns an empty array for empty or whitespace-only input', () => {
    assert.deepEqual(splitHtmlBlocks(''), [])
    assert.deepEqual(splitHtmlBlocks('   \n\t  '), [])
  })

  it('splits two sibling top-level blocks', () => {
    const blocks = splitHtmlBlocks('<p>one</p>\n<p>two</p>')
    assert.equal(blocks.length, 2)
    assert.equal(blocks[0], '<p>one</p>')
    assert.equal(blocks[1], '<p>two</p>')
  })

  it('keeps nested elements as a single block', () => {
    const html = '<div><p>x</p><p>y</p></div>'
    const blocks = splitHtmlBlocks(html)
    assert.equal(blocks.length, 1)
    assert.equal(blocks[0], html)
  })

  it('treats self-closing and void tags at depth 0 as standalone blocks', () => {
    const blocks = splitHtmlBlocks('<img src="a.png" />\n<hr>\n<p>after</p>')
    assert.equal(blocks.length, 3)
    assert.equal(blocks[0], '<img src="a.png" />')
    assert.equal(blocks[1], '<hr>')
    assert.equal(blocks[2], '<p>after</p>')
  })

  it('ignores HTML comments for depth tracking so following blocks still split', () => {
    // Comments are not counted toward depth, so the <p> after the comment is
    // still recognised as a top-level block rather than being swallowed.
    const blocks = splitHtmlBlocks('<p>one</p><!-- note --><p>two</p>')
    assert.equal(blocks.length, 2)
    assert.equal(blocks[0], '<p>one</p>')
    assert.ok(blocks[1].includes('<p>two</p>'))
  })

  it('does not treat tags inside comments as real opening tags', () => {
    // A comment containing <div> must not bump the depth counter.
    const blocks = splitHtmlBlocks('<p>one</p><!-- <div> --><p>two</p>')
    assert.equal(blocks.length, 2)
    assert.equal(blocks[0], '<p>one</p>')
    assert.ok(blocks[1].includes('<p>two</p>'))
  })

  it('trims leading and trailing whitespace around the input', () => {
    const blocks = splitHtmlBlocks('\n  <p>hi</p>  \n')
    assert.equal(blocks.length, 1)
    assert.equal(blocks[0], '<p>hi</p>')
  })
})
