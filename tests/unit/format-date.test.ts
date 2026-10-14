import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatDate } from '../../src/client/format-date.ts'

describe('formatDate', () => {
  it('formats a calendar date without shifting it by the timezone', () => {
    assert.equal(formatDate('2025-01-15'), '15/01/2025')
    assert.equal(formatDate('2026-12-31'), '31/12/2026')
  })

  it('formats a full timestamp in local time', () => {
    assert.equal(formatDate('2025-01-15T12:00:00'), '15/01/2025')
  })

  it('returns an empty string when there is no date', () => {
    assert.equal(formatDate(undefined), '')
    assert.equal(formatDate(''), '')
  })

  it('keeps text that is not a date as-is', () => {
    assert.equal(formatDate('Q3 2026'), 'Q3 2026')
  })
})
