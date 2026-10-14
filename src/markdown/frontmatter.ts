import { load } from 'js-yaml'
import type { Frontmatter } from '../types.ts'

export interface ParsedDocument {
  frontmatter: Frontmatter
  body: string
}

const OPEN = '---'
const CLOSE = '\n---'

// Same splitting rules as gray-matter, which this replaces: the opening line must be
// exactly `---` (optionally followed by a language tag, ignored), an unclosed block
// swallows the whole document, and one line break after the closing delimiter is dropped.
export function parseDocument (raw: string): ParsedDocument {
  const str = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw
  if (!str.startsWith(OPEN) || str.charAt(OPEN.length) === '-') {
    return { frontmatter: {}, body: str }
  }

  let rest = str.slice(OPEN.length)
  const firstLineEnd = rest.search(/\r?\n/)
  if (firstLineEnd > 0) rest = rest.slice(firstLineEnd)

  const closeIndex = rest.indexOf(CLOSE)
  const matter = closeIndex === -1 ? rest : rest.slice(0, closeIndex)
  let body = ''
  if (closeIndex !== -1) {
    body = rest.slice(closeIndex + CLOSE.length)
    if (body[0] === '\r') body = body.slice(1)
    if (body[0] === '\n') body = body.slice(1)
  }

  const isEmpty = matter.replace(/^\s*#[^\n]+/gm, '').trim() === ''
  const frontmatter = isEmpty ? {} : load(matter) as Frontmatter
  return { frontmatter, body }
}
