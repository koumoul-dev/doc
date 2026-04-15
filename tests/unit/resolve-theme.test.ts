import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { resolveTheme } from '../../src/themes/resolve.ts'

describe('resolveTheme', () => {
  it('returns the minimal theme when asked by name', () => {
    const theme = resolveTheme('minimal')
    assert.equal(theme.name, 'minimal')
    assert.equal(theme.styles.length, 1)
    assert.match(theme.styles[0], /minimal\/style\.css$/)
    assert.equal(theme.logo, undefined)
  })

  it('returns the koumoul theme with logo when asked by name', () => {
    const theme = resolveTheme('koumoul')
    assert.equal(theme.name, 'koumoul')
    assert.equal(theme.styles.length, 1)
    assert.match(theme.styles[0], /koumoul\/style\.css$/)
    assert.ok(theme.logo, 'koumoul theme should expose a logo path')
    assert.match(theme.logo!, /koumoul\/logo\.png$/)
  })

  it('falls back to the koumoul theme for unknown names', () => {
    const theme = resolveTheme('does-not-exist')
    assert.equal(theme.name, 'koumoul')
    assert.match(theme.styles[0], /koumoul\/style\.css$/)
    assert.ok(theme.logo)
  })
})
