import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expandIncludes } from '../../src/markdown/includes.ts'

describe('expandIncludes', () => {
  let dir: string

  before(() => {
    dir = mkdtempSync(join(tmpdir(), 'doc-includes-'))
  })

  after(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('returns body unchanged for a file with no includes', () => {
    const file = join(dir, 'plain.md')
    writeFileSync(file, '---\ntitle: T\n---\n\n# Hello\n![](./img.png)\n')
    const result = expandIncludes(file)
    assert.equal(result.frontmatter.title, 'T')
    assert.ok(result.body.includes('# Hello'))
    assert.ok(result.body.includes('![](./img.png)'))
    assert.deepEqual(result.files, [file])
  })

  it('inlines a one-level include and rewrites sub-doc image paths to root-relative', () => {
    const root = join(dir, 'main.md')
    const partsDir = join(dir, 'parts')
    mkdirSync(partsDir, { recursive: true })
    const sub = join(partsDir, 'intro.md')
    writeFileSync(root, '# Main\n@./parts/intro.md\n')
    writeFileSync(sub, '## Intro\n![](./diagram.png)\n')
    const result = expandIncludes(root)
    assert.ok(result.body.includes('## Intro'))
    assert.ok(result.body.includes('![](./parts/diagram.png)'))
    assert.deepEqual(result.files.sort(), [root, sub].sort())
  })

  it('recurses through nested includes and anchors all paths at root', () => {
    const root = join(dir, 'nested-root.md')
    const l1 = join(dir, 'a', 'level1.md')
    const l2 = join(dir, 'a', 'b', 'level2.md')
    mkdirSync(join(dir, 'a', 'b'), { recursive: true })
    writeFileSync(root, '@./a/level1.md\n')
    writeFileSync(l1, '# L1\n@./b/level2.md\n')
    writeFileSync(l2, '# L2\n![](./pic.png)\n')
    const result = expandIncludes(root)
    assert.ok(result.body.includes('# L1'))
    assert.ok(result.body.includes('# L2'))
    assert.ok(result.body.includes('![](./a/b/pic.png)'))
  })

  it('resolves ../ paths in sub-docs correctly', () => {
    const root = join(dir, 'up-root.md')
    const sub = join(dir, 'deep', 'page.md')
    mkdirSync(join(dir, 'deep'), { recursive: true })
    writeFileSync(root, '@./deep/page.md\n')
    writeFileSync(sub, '![](../shared.png)\n')
    const result = expandIncludes(root)
    assert.ok(result.body.includes('![](./shared.png)'))
  })

  it('leaves absolute URLs in sub-doc images alone', () => {
    const root = join(dir, 'ext-root.md')
    const sub = join(dir, 'ext-sub.md')
    writeFileSync(root, '@./ext-sub.md\n')
    writeFileSync(sub, '![](https://example.com/a.png)\n![](/abs.png)\n![](data:image/png;base64,AAA)\n')
    const result = expandIncludes(root)
    assert.ok(result.body.includes('https://example.com/a.png'))
    assert.ok(result.body.includes('/abs.png'))
    assert.ok(result.body.includes('data:image/png;base64,AAA'))
  })

  it('does not rewrite image syntax inside fenced code blocks', () => {
    const root = join(dir, 'fence-root.md')
    const sub = join(dir, 'subdir', 'fence.md')
    mkdirSync(join(dir, 'subdir'), { recursive: true })
    writeFileSync(root, '@./subdir/fence.md\n')
    writeFileSync(sub, '```md\n![](./x.png)\n```\n![](./y.png)\n')
    const result = expandIncludes(root)
    assert.ok(result.body.includes('![](./x.png)'), 'fenced image must not be rewritten')
    assert.ok(result.body.includes('![](./subdir/y.png)'), 'unfenced image must be rewritten')
  })

  it('does not trigger includes inside fenced code blocks', () => {
    const root = join(dir, 'fence-inc-root.md')
    writeFileSync(root, '```\n@./never.md\n```\n')
    const result = expandIncludes(root)
    assert.ok(result.body.includes('@./never.md'))
    assert.deepEqual(result.files, [root])
  })

  it('detects a cycle and throws with a chain message', () => {
    const a = join(dir, 'cycle-a.md')
    const b = join(dir, 'cycle-b.md')
    writeFileSync(a, '@./cycle-b.md\n')
    writeFileSync(b, '@./cycle-a.md\n')
    assert.throws(() => expandIncludes(a), /Circular include:.*cycle-a\.md.*cycle-b\.md.*cycle-a\.md/)
  })

  it('rejects include paths that escape the doc root', () => {
    const root = join(dir, 'esc-root.md')
    writeFileSync(root, '@../../etc/passwd\n')
    assert.throws(() => expandIncludes(root), /escapes doc root/)
  })

  it('rejects image paths in sub-docs that escape the doc root', () => {
    const root = join(dir, 'esc-img-root.md')
    const sub = join(dir, 'esc-img-sub.md')
    writeFileSync(root, '@./esc-img-sub.md\n')
    writeFileSync(sub, '![](../../outside.png)\n')
    assert.throws(() => expandIncludes(root), /escapes doc root/)
  })

  it('strips frontmatter from included sub-docs silently', () => {
    const root = join(dir, 'fm-root.md')
    const sub = join(dir, 'fm-sub.md')
    writeFileSync(root, '---\ntitle: Root\n---\n\n@./fm-sub.md\n')
    writeFileSync(sub, '---\ntitle: Sub\n---\n\n# Sub body\n')
    const result = expandIncludes(root)
    assert.equal(result.frontmatter.title, 'Root')
    assert.ok(result.body.includes('# Sub body'))
    assert.ok(!result.body.includes('title: Sub'))
  })

  it('ignores non-include lines that start with @', () => {
    const root = join(dir, 'at-root.md')
    writeFileSync(root, 'Email me @alice or check @github.com/example.\n')
    const result = expandIncludes(root)
    assert.ok(result.body.includes('@alice'))
    assert.ok(result.body.includes('@github.com/example'))
  })
})
