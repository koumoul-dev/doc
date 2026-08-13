import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { resolveTheme, clientLetterhead, letterheadLogoPath } from '../../src/themes/resolve.ts'

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

  it('exposes the koumoul letterhead identity', () => {
    const theme = resolveTheme('koumoul')
    assert.ok(theme.letterhead, 'koumoul theme should expose a letterhead block')
    assert.equal(theme.letterhead!.name, 'SAS Koumoul')
    assert.ok(theme.letterhead!.lines.length > 0)
    assert.match(theme.letterhead!.legal!, /SIREN/)
  })

  it('leaves the minimal theme without a letterhead identity', () => {
    const theme = resolveTheme('minimal')
    assert.equal(theme.letterhead, undefined)
  })

  it('gives the koumoul letterhead its own circular logo', () => {
    const theme = resolveTheme('koumoul')
    assert.match(theme.letterhead!.logo!, /koumoul\/logo-circle\.png$/)
  })
})

describe('clientLetterhead', () => {
  it('drops the filesystem logo path from the identity sent to the browser', () => {
    const letterhead = clientLetterhead(resolveTheme('koumoul'))
    assert.equal(letterhead!.name, 'SAS Koumoul')
    assert.ok(letterhead!.lines.length > 0)
    assert.equal('logo' in letterhead!, false)
  })

  it('returns undefined for a theme without a letterhead identity', () => {
    assert.equal(clientLetterhead(resolveTheme('minimal')), undefined)
  })
})

describe('letterheadLogoPath', () => {
  it('prefers the letterhead logo over the title page one', () => {
    assert.match(letterheadLogoPath(resolveTheme('koumoul'))!, /logo-circle\.png$/)
  })

  it('falls back to the theme logo when the letterhead has none', () => {
    const theme = { ...resolveTheme('koumoul') }
    theme.letterhead = { name: 'X', lines: [] }
    assert.match(letterheadLogoPath(theme)!, /koumoul\/logo\.png$/)
  })

  it('returns undefined when the theme has no logo at all', () => {
    assert.equal(letterheadLogoPath(resolveTheme('minimal')), undefined)
  })

  it('falls back to the koumoul theme for unknown names', () => {
    const theme = resolveTheme('does-not-exist')
    assert.equal(theme.name, 'koumoul')
    assert.match(theme.styles[0], /koumoul\/style\.css$/)
    assert.ok(theme.logo)
  })
})
