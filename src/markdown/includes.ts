import { readFileSync } from 'node:fs'
import { resolve, dirname, relative, sep } from 'node:path'
import { parseDocument } from './frontmatter.ts'
import type { Frontmatter } from '../types.ts'

export interface ExpandResult {
  frontmatter: Frontmatter
  body: string
  files: string[]
}

const INCLUDE_LINE = /^@(\S+)\s*$/
const IMAGE = /(!\[[^\]]*\]\()([^)\s]+)(\s+"[^"]*")?(\))/g
const FENCE = /^(?:```|~~~)/
const MAX_DEPTH = 16

function isExternalUrl (url: string): boolean {
  return /^(?:https?:|data:|mailto:|\/)/i.test(url)
}

function toRootRelative (rootDir: string, absPath: string, requested: string, fromFile: string): string {
  const rel = relative(rootDir, absPath).split(sep).join('/')
  if (rel.startsWith('../') || rel === '..') {
    throw new Error(`Path escapes doc root: "${requested}" (in ${relative(rootDir, fromFile) || '.'})`)
  }
  return './' + rel
}

function rewriteImages (line: string, subDir: string, rootDir: string, fromFile: string): string {
  return line.replace(IMAGE, (match, open, url, title, close) => {
    if (isExternalUrl(url)) return match
    const abs = resolve(subDir, url)
    const newUrl = toRootRelative(rootDir, abs, url, fromFile)
    return `${open}${newUrl}${title ?? ''}${close}`
  })
}

function expand (absPath: string, rootDir: string, stack: string[], files: Set<string>): string {
  if (stack.includes(absPath)) {
    const chain = [...stack, absPath].map(p => relative(rootDir, p) || '.').join(' -> ')
    throw new Error(`Circular include: ${chain}`)
  }
  if (stack.length >= MAX_DEPTH) {
    throw new Error(`Include depth exceeded (>${MAX_DEPTH}) at ${relative(rootDir, absPath)}`)
  }

  files.add(absPath)
  const raw = readFileSync(absPath, 'utf-8')
  const { body } = parseDocument(raw)
  const subDir = dirname(absPath)
  const isRoot = stack.length === 0

  const out: string[] = []
  let inFence = false
  for (const line of body.split('\n')) {
    if (FENCE.test(line.trim())) {
      inFence = !inFence
      out.push(line)
      continue
    }
    if (inFence) {
      out.push(line)
      continue
    }

    const includeMatch = INCLUDE_LINE.exec(line)
    if (includeMatch) {
      const requested = includeMatch[1]
      if (isExternalUrl(requested)) {
        throw new Error(`Include path must be relative: "${requested}" (in ${relative(rootDir, absPath) || '.'})`)
      }
      const target = resolve(subDir, requested)
      if (target !== rootDir && !target.startsWith(rootDir + sep)) {
        throw new Error(`Include path escapes doc root: "${requested}" (in ${relative(rootDir, absPath) || '.'})`)
      }
      out.push(expand(target, rootDir, [...stack, absPath], files))
      continue
    }

    out.push(isRoot ? line : rewriteImages(line, subDir, rootDir, absPath))
  }
  return out.join('\n')
}

export function expandIncludes (rootFile: string): ExpandResult {
  const absRoot = resolve(rootFile)
  const rootDir = dirname(absRoot)
  const raw = readFileSync(absRoot, 'utf-8')
  const { frontmatter } = parseDocument(raw)
  const files = new Set<string>()
  const body = expand(absRoot, rootDir, [], files)
  return { frontmatter, body, files: [...files] }
}
