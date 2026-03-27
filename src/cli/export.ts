import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import puppeteer from 'puppeteer'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { docMarkdownPlugin } from '../vite/plugin-markdown.ts'
import { docConfigPlugin } from '../vite/plugin-config.ts'
import { docThemePlugin } from '../vite/plugin-theme.ts'
import { resolveTheme } from '../themes/resolve.ts'
import { parseDocument } from '../markdown/frontmatter.ts'
import { readFileSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(__dirname, '../..')

interface ExportOptions {
  file: string
  output?: string
}

export async function exportPdf (options: ExportOptions) {
  const docFile = resolve(process.cwd(), options.file)

  // Read frontmatter for the footer title and theme
  const raw = readFileSync(docFile, 'utf-8')
  const { frontmatter } = parseDocument(raw)
  const title = frontmatter.title || basename(docFile, '.md')
  const theme = resolveTheme(frontmatter.theme || 'default')

  // Start a temporary Vite server
  const port = 15173 + Math.floor(Math.random() * 1000)
  const server = await createServer({
    root: packageRoot,
    plugins: [
      UnoCSS(),
      vue(),
      docMarkdownPlugin(docFile),
      docConfigPlugin({
        file: docFile,
        theme: theme.name,
        port,
        hasLogo: !!theme.logo
      }),
      docThemePlugin(theme)
    ],
    server: { port },
    logLevel: 'silent'
  })

  await server.listen()
  console.log(`Vite server started on port ${port}`)

  // Launch Puppeteer
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  const page = await browser.newPage()

  console.log('Loading document...')
  await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle0' })

  // Wait for JS pagination to complete (handles mermaid + images internally)
  await page.waitForFunction(
    () => document.documentElement.dataset.paginationDone === 'true',
    { timeout: 30000 }
  )

  const outputPath = options.output || options.file.replace(/\.md$/, '.pdf')

  // Fix the last page: use flexbox to push footer to the bottom,
  // with height just under the actual page height to prevent the extra blank page.
  await page.evaluate(() => {
    const pages = document.querySelectorAll('.a4-page')
    if (pages.length < 2) return
    // Measure the actual rendered height of a full page
    const refPage = pages[0] as HTMLElement
    const fullHeight = refPage.getBoundingClientRect().height
    const last = pages[pages.length - 1] as HTMLElement
    const reduction = 8
    last.style.height = (fullHeight - reduction) + 'px'
    const footer = last.querySelector('.page-footer') as HTMLElement
    if (footer) {
      // Compensate the footer position for the height reduction
      footer.style.bottom = `calc(0.5cm - ${reduction}px)`
    }
  })

  console.log(`Generating PDF: ${outputPath}`)
  await page.pdf({
    path: outputPath,
    width: '210mm',
    height: '297mm',
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    printBackground: true
  })

  await browser.close()
  await server.close()

  console.log(`PDF exported: ${outputPath}`)
}
