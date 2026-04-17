# AGENTS.md

## Project

`@koumoul/doc` — A Markdown-to-PDF document processor for A4 documents. Turns single Markdown files into polished, print-ready PDFs with title pages, table of contents, syntax-highlighted code, Mermaid diagrams, and proper pagination.

## Architecture

- **CLI** (`src/cli/`): Two commands via CAC — `dev` (Vite dev server) and `export` (Puppeteer PDF generation)
- **Markdown processing** (`src/markdown/`): MarkdownIt pipeline with Shiki highlighting, frontmatter parsing, custom containers, Mermaid preprocessing
- **Vue client** (`src/client/`): Measurement-based pagination into A4 pages, rendered in browser then captured by Puppeteer
- **Vite plugins** (`src/vite/`): Virtual modules for injecting markdown content, config, and theme styles
- **Themes** (`src/themes/`): `koumoul` (default branded) and `minimal`

Key pattern: two-phase rendering — blocks are measured in a hidden container, then paginated into A4 pages. Puppeteer waits for `document.documentElement.dataset.paginationDone` before capturing PDF.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | TypeScript compilation via tsc (`tsconfig.build.json`) |
| `npm run dev` | Start dev server on `examples/example.md` |
| `npm run lint` | ESLint (neostandard, no semicolons) |
| `npm run typecheck` | vue-tsc type checking |
| `npm run test` | Unit tests (Node built-in test runner) |
| `npm run test:e2e` | Playwright E2E tests |

## Code Style

- TypeScript, strict mode, ESM only
- No semicolons (neostandard)
- Vue Composition API with `<script setup>`
- Scoped CSS in Vue components, UnoCSS for utilities

## Key Files

- `src/client/pagination.ts` — A4 measurement-based pagination logic
- `src/client/DocumentRenderer.vue` — Main layout orchestrator
- `src/vite/plugin-markdown.ts` — Markdown to HTML blocks virtual module
- `src/markdown/pipeline.ts` — MarkdownIt setup with all extensions
- `src/cli/export.ts` — Puppeteer PDF export
