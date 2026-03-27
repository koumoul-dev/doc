import matter from 'gray-matter'
import type { Frontmatter } from '../types.ts'

export interface ParsedDocument {
  frontmatter: Frontmatter
  body: string
}

export function parseDocument (raw: string): ParsedDocument {
  const { data, content } = matter(raw)
  return {
    frontmatter: data as Frontmatter,
    body: content
  }
}
