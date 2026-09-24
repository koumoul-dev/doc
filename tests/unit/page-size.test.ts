import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeOrientation, pageDimensionsMm } from '../../src/page-size.ts'

describe('pageDimensionsMm', () => {
  it('portrait content area matches the page padding and footer room', () => {
    assert.deepEqual(pageDimensionsMm('portrait'), {
      width: 210,
      height: 297,
      contentWidth: 180,
      contentHeight: 261.5
    })
  })

  it('landscape swaps width and height', () => {
    assert.deepEqual(pageDimensionsMm('landscape'), {
      width: 297,
      height: 210,
      contentWidth: 267,
      contentHeight: 174.5
    })
  })

  it('defaults to portrait', () => {
    assert.deepEqual(pageDimensionsMm(), pageDimensionsMm('portrait'))
  })
})

describe('normalizeOrientation', () => {
  it('accepts landscape and falls back to portrait', () => {
    assert.equal(normalizeOrientation('landscape'), 'landscape')
    assert.equal(normalizeOrientation('portrait'), 'portrait')
    assert.equal(normalizeOrientation(undefined), 'portrait')
    assert.equal(normalizeOrientation('paysage'), 'portrait')
  })
})
