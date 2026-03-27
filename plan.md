# @koumoul/doc — Implementation Plan

## Context

Koumoul needs a lightweight CLI tool to preview and export professional A4 documents from markdown files. The existing `koumoul/docs` project (Nuxt + Vuetify + Puppeteer) works but is heavyweight. We want the ease-of-use and tech elegance of Slidev, but targeting A4 documents instead of slides.

**Goal**: `npx @koumoul/doc my-doc.md` starts a live-reloading A4 preview; `npx @koumoul/doc export my-doc.md` produces a PDF.

---

## Decisions Made

| Area | Choice |
|------|--------|
| Framework | Vite + Vue 3 |
| TypeScript | Native Node.js type stripping (Node ≥ 23.6), no tsx/tsup |
| Linting | ESLint 9 + neostandard({ ts: true }) |
| Testing | Playwright (e2e), Node built-in test runner (unit) |
| Markdown | markdown-it (like Slidev) |
| CSS | UnoCSS |
| Pagination preview | CSS A4 pages + JS refinement |
| PDF export | Puppeteer |
| Distribution | npx CLI (`@koumoul/doc`), ships .ts source directly |
| Theme architecture | Koumoul theme built-in, separated by flag |
| Frontmatter | Matches koumoul/docs: title, version, date, description, warning, toc |
| Extensions | Mermaid, Shiki syntax highlighting, custom containers |
| Headers/footers | Puppeteer footer only (not in preview) |
| Local images | Vite alias `/@doc-assets/` → document directory |
| Agent skill | Deferred to v2 |

---

## Project Structure

```
doc/
├── package.json
├── tsconfig.json
├── eslint.config.js               # neostandard({ ts: true })
├── playwright.config.ts           # e2e test config
├── bin/
│   └── cli.mjs                    # #!/usr/bin/env node shim
├── index.html                     # Vite HTML entry
├── example.md                     # Example document for testing
├── tests/
│   ├── e2e/
│   │   ├── dev-server.spec.ts     # Server starts, page loads, A4 preview
│   │   ├── rendering.spec.ts      # Markdown, frontmatter, containers
│   │   └── export.spec.ts         # PDF export produces valid file
│   └── unit/
│       ├── frontmatter.test.ts    # gray-matter extraction
│       ├── pipeline.test.ts       # markdown-it rendering
│       └── containers.test.ts     # custom container markup
├── src/
│   ├── cli/
│   │   ├── index.ts               # CLI entry (cac): dev, export, build commands
│   │   ├── dev.ts                 # Start Vite dev server
│   │   ├── export.ts              # Puppeteer PDF generation
│   │   └── build.ts               # Vite static build
│   ├── vite/
│   │   ├── plugin-markdown.ts     # virtual:doc-content — .md → Vue SFC
│   │   └── plugin-config.ts       # virtual:doc-config — resolved config
│   ├── markdown/
│   │   ├── pipeline.ts            # markdown-it factory with all plugins
│   │   ├── frontmatter.ts         # YAML extraction (gray-matter)
│   │   ├── containers.ts          # :::warning, :::info, :::tip
│   │   └── mermaid.ts             # mermaid fence → <pre class="mermaid">
│   ├── client/
│   │   ├── index.ts               # createApp + mount
│   │   ├── App.vue                # Root component
│   │   ├── DocumentRenderer.vue   # Orchestrates title + TOC + content
│   │   ├── TitlePage.vue          # Logo, title, version/date, description, warning
│   │   ├── TocPage.vue            # Auto-generated heading TOC
│   │   ├── MermaidBlock.vue       # Client-side mermaid rendering
│   │   ├── pagination.ts          # JS page-break detection for preview
│   │   └── style/
│   │       ├── base.css           # A4 dimensions, page layout
│   │       └── print.css          # @media print rules
│   ├── themes/
│   │   ├── default/
│   │   │   ├── index.ts           # Theme definition
│   │   │   └── style.css          # Minimal default styling
│   │   └── koumoul/
│   │       ├── index.ts           # Koumoul theme definition
│   │       ├── style.css          # Koumoul colors, Nunito font
│   │       └── logo.png           # Koumoul logo (from docs/nuxt/public/)
│   └── types.ts                   # Shared types: DocConfig, Frontmatter, DocTheme
```

---

## Key Dependencies

**Runtime:**
```
vue ^3.5, vite ^6.3, @vitejs/plugin-vue ^5.2
cac ^7.0 (CLI parser, same as Slidev)
markdown-it ^14.1, gray-matter ^4.0
markdown-it-container ^4.0
shiki ^3.0 (syntax highlighting)
mermaid ^11.12
unocss ^66.0
puppeteer ^24.21
```

**Dev:**
```
typescript ^5.8 (type checking only, tsc --noEmit)
vue-tsc ^2.0 (Vue SFC type checking)
eslint ^9.0, neostandard ^0.13
@playwright/test ^1.58
@types/markdown-it ^14.1, @types/node ^22.0
```

> **No tsx, no tsup.** Node ≥ 23.6 strips types natively. The CLI ships `.ts` source and runs directly.

---

## Code Recommendations

### package.json

```jsonc
{
  "name": "@koumoul/doc",
  "version": "0.1.0",
  "description": "Preview and export professional A4 documents from markdown",
  "type": "module",
  "engines": { "node": ">=23.6.0" },
  "bin": { "koumoul-doc": "./bin/cli.mjs" },
  "files": ["bin", "src", "index.html"],
  "scripts": {
    "dev": "node src/cli/index.ts dev example.md",
    "lint": "eslint",
    "typecheck": "vue-tsc --noEmit",
    "test": "node --test tests/unit/**/*.test.ts",
    "test:e2e": "playwright test"
  }
}
```

- `"type": "module"` — ESM throughout
- `"engines": ">=23.6.0"` — minimum for unflagged native TS type stripping
- `"files"` ships `.ts` source directly — no build step for the CLI
- Unit tests use Node's built-in test runner (`node --test`)

### bin/cli.mjs

```js
#!/usr/bin/env node

const [major, minor] = process.versions.node.split('.').map(Number)
if (major < 23 || (major === 23 && minor < 6)) {
  console.error('@koumoul/doc requires Node.js >= 23.6.0 (native TypeScript support)')
  console.error(`Current version: ${process.version}`)
  process.exit(1)
}

import('../src/cli/index.ts')
```

- `.mjs` extension — unambiguous ESM regardless of context
- Version guard — npm `engines` only warns, this blocks cleanly
- Directly imports `.ts` — Node 24 handles type stripping natively

### tsconfig.json

```jsonc
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```

- `verbatimModuleSyntax: true` — **critical** for native TS execution, forces `import type` for type-only imports
- `isolatedModules: true` — matches Node's per-file type stripping model
- `noEmit: true` — tsc is a linter only, never compiles
- `module: "NodeNext"` — requires explicit `.ts` extensions in imports (e.g., `import { foo } from './bar.ts'`)

Virtual module type declarations in `src/env.d.ts`:

```ts
declare module 'virtual:doc-content' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
  export const frontmatter: import('./types.ts').Frontmatter
}

declare module 'virtual:doc-config' {
  export const config: import('./types.ts').DocConfig
}
```

### eslint.config.js

```js
import neostandard from 'neostandard'

export default neostandard({ ts: true })
```

Neostandard bundles `@typescript-eslint/parser` + recommended rules + standard style (no semicolons, single quotes). Vue SFC linting can be added later with `eslint-plugin-vue` if needed.

### playwright.config.ts

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'node src/cli/index.ts dev example.md --port 5173',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000
  }
})
```

The `webServer` config auto-starts the dev server before tests and shuts it down after. E2e tests cover: dev server lifecycle, markdown rendering, theme switching, PDF export.

### Import style (TypeScript with Node native)

All `.ts` imports must use explicit `.ts` extensions:

```ts
// ✓ correct — Node resolves .ts directly
import { startDev } from './dev.ts'
import type { DocConfig } from '../types.ts'

// ✗ wrong — fails at runtime
import { startDev } from './dev'
import { startDev } from './dev.js'
```

---

## Architecture

### Data Flow

```
my-doc.md → gray-matter → {frontmatter, markdown body}
                                ↓
                          markdown-it pipeline
                          (shiki, mermaid, containers, heading anchors, hr→page-break)
                                ↓
                          HTML string
                                ↓
            Vite plugin wraps as virtual:doc-content Vue SFC
                                ↓
            Vue app imports virtual module, renders:
              TitlePage → TocPage → content (v-html)
                                ↓
            Browser shows A4-width pages with live reload
                                ↓
            Puppeteer prints to PDF (export command)
```

### Vite Plugin: plugin-markdown.ts

- Serves `virtual:doc-content` — reads the user's .md file, extracts frontmatter with gray-matter, renders body with markdown-it, returns a Vue SFC string with `v-html` and exposed frontmatter
- **Rewrites relative image paths**: `./images/arch.png` → `/@doc-assets/images/arch.png`
- Watches the .md file for changes → invalidates virtual module → triggers full reload (Vite HMR)
- Key: uses `server.config.server.fs.allow` to permit reading files outside the package root

### Local Image Serving

Images referenced in markdown (e.g., `![diagram](./arch.png)`) live alongside the `.md` file. To serve them:

1. **Vite alias**: `/@doc-assets/` maps to the parent directory of the `.md` file
2. **fs.allow**: the document directory is added to Vite's `server.fs.allow`
3. **Path rewriting**: the markdown plugin rewrites relative `src` attributes in rendered HTML: `./foo.png` → `/@doc-assets/foo.png`
4. **Build mode**: the Vite build resolves these aliases to produce correct static output
5. **PDF export**: Puppeteer loads from the Vite server, so images resolve automatically

### Vite Plugin: plugin-config.ts

- Serves `virtual:doc-config` — exports the resolved DocConfig as JSON (theme, file path, etc.)

### A4 Pagination (Preview)

Primary approach: **CSS break rules** as source of truth (identical behavior in preview and PDF).

- Render document as a single continuous flow inside an A4-width container
- Use `break-after: page` on title page + TOC page divs
- Use `break-after: avoid-page` on headings, `break-inside: avoid` on code blocks/tables/lists
- `---` (thematic break) converts to `<div style="break-before: page">`
- Manual `<!-- PAGE_BREAK -->` also supported

JS refinement for preview: scan rendered content and insert visual page-boundary indicators (subtle dashed lines) at every ~297mm interval. This is a visual aid only — not used for PDF.

### Theme System

```ts
interface DocTheme {
  name: string
  styles: string[]          // CSS files to import
  logo?: string             // Path for title page logo
  mermaidTheme?: Record<string, string>
  cssVariables?: Record<string, string>
}
```

- `--theme default` — system-ui font, neutral colors
- `--theme koumoul` — Nunito font, Koumoul brand colors (#1976D2 primary, #81D4FA secondary, #2962FF accent, #FAFAFA background), Koumoul logo
- Theme resolved by CLI flag, injected via `virtual:doc-config`
- Client dynamically loads theme CSS and applies CSS variables to `:root`

### PDF Export (src/cli/export.ts)

Reuses the proven pattern from `/home/alban/koumoul/docs/render/index.ts`:

1. Start a temporary Vite server (random port)
2. Launch Puppeteer, navigate to `http://localhost:{port}`, wait for `networkidle0`
3. Wait for mermaid diagrams (if any) to finish rendering
4. Call `page.pdf()` with: format A4, margins 1.5cm, footer template with document title + page numbers
5. Close browser + server, output file at `{input}.pdf` or `--output` path

Footer template (matching koumoul/docs exactly):
```html
<div style="font-size:10px;width:100%;margin-top:10px;margin-left:1.5cm;margin-right:1.5cm;">
  <div style="float:left;"><span>{title}</span></div>
  <div style="float:right;"><span class="pageNumber"></span>/<span class="totalPages"></span></div>
</div>
```

---

## Implementation Phases

### Phase 1: Skeleton — CLI + Vite dev server
- `package.json` with dependencies, bin entry, scripts, `"type": "module"`, `engines >= 23.6`
- `tsconfig.json` with `verbatimModuleSyntax`, `noEmit`, `NodeNext`
- `eslint.config.js` with `neostandard({ ts: true })`
- `bin/cli.mjs` shim with Node version guard
- `src/cli/index.ts` with cac, `dev` command only
- `src/cli/dev.ts` — creates Vite server with `@vitejs/plugin-vue`
- `index.html` + `src/client/index.ts` + `App.vue` — "Hello World"
- **Verify**: `node src/cli/index.ts dev` shows Vue app in browser (no tsx needed)

### Phase 2: Markdown rendering
- `src/markdown/frontmatter.ts` — gray-matter extraction
- `src/markdown/pipeline.ts` — markdown-it with basic config
- `src/vite/plugin-markdown.ts` — virtual:doc-content
- `src/vite/plugin-config.ts` — virtual:doc-config
- `src/client/DocumentRenderer.vue` — imports virtual module, renders HTML
- `example.md` with frontmatter
- **Verify**: markdown renders in browser, editing the .md triggers reload

### Phase 3: A4 layout + Title page + TOC
- `src/client/style/base.css` — A4 dimensions, page container
- `src/client/TitlePage.vue` — logo, title, version/date, description, warning (based on `/home/alban/koumoul/docs/nuxt/app/components/PageTitle.vue`)
- `src/client/TocPage.vue` — heading extraction + nested list (based on `/home/alban/koumoul/docs/nuxt/app/components/PageToc.vue`)
- CSS break rules on headings, code blocks, lists
- `---` → page break conversion in markdown pipeline
- **Verify**: document shows title page, TOC, content at A4 width

### Phase 4: Markdown extensions
- Shiki syntax highlighting in markdown-it pipeline
- `src/markdown/mermaid.ts` + `src/client/MermaidBlock.vue`
- `src/markdown/containers.ts` — :::warning, :::info, :::tip
- Heading anchor IDs for TOC linking
- UnoCSS integration
- **Verify**: code blocks highlighted, mermaid renders, containers styled

### Phase 5: Theme system
- `src/types.ts` — DocTheme interface
- `src/themes/default/` — minimal styling
- `src/themes/koumoul/` — brand colors, Nunito, logo (from koumoul/docs: primary #1976D2, background #FAFAFA, font Nunito)
- `--theme` CLI flag wired to theme resolution
- **Verify**: `--theme koumoul` applies Koumoul branding

### Phase 6: PDF export
- `src/cli/export.ts` — Puppeteer pipeline
- `export` command in CLI
- `src/client/style/print.css` — @media print rules (hide preview chrome)
- `build` command for static HTML
- **Verify**: `npx @koumoul/doc export example.md` produces correct A4 PDF

### Phase 7: Testing + Polish
- `playwright.config.ts` + `tests/e2e/` — dev server, rendering, export tests
- `tests/unit/` — frontmatter, pipeline, containers (Node built-in test runner)
- Run `eslint` + `vue-tsc --noEmit` in CI
- End-to-end test with real koumoul/docs markdown files
- README with usage

---

## Verification Plan

**Manual checks:**
1. `npm run dev` → browser opens with A4 preview of `example.md`
2. Edit `example.md` → preview updates live
3. Title page shows logo, title, version, date, description
4. TOC auto-generates from headings with correct links
5. Mermaid code block renders as diagram
6. Code blocks have syntax highlighting
7. `:::warning` blocks render as styled containers
8. Local images (e.g., `![logo](./logo.png)`) display correctly in preview and PDF
9. `---` creates a visible page break
10. `--theme koumoul` applies Koumoul branding (Nunito, blue colors, logo)
11. `npx @koumoul/doc export example.md` produces `example.pdf` with A4 pages, correct margins, footer with title + page numbers

**Automated checks:**
12. `npm run lint` — ESLint passes (neostandard + TS)
13. `npm run typecheck` — vue-tsc --noEmit passes
14. `npm test` — unit tests pass (Node built-in test runner)
15. `npm run test:e2e` — Playwright e2e tests pass (dev server, rendering, PDF export)

---

## Key Reference Files

- `/home/alban/koumoul/docs/render/index.ts` — Puppeteer PDF pattern to reuse
- `/home/alban/koumoul/docs/nuxt/app/components/PageTitle.vue` — Title page layout to replicate
- `/home/alban/koumoul/docs/nuxt/app/components/PageToc.vue` — TOC generation to replicate
- `/home/alban/koumoul/docs/nuxt/app/plugins/vuetify.ts` — Koumoul color palette to extract
