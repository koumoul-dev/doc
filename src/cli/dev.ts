import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { docMarkdownPlugin } from '../vite/plugin-markdown.ts'
import { docConfigPlugin } from '../vite/plugin-config.ts'
import { docThemePlugin } from '../vite/plugin-theme.ts'
import { resolveTheme } from '../themes/resolve.ts'
import { parseDocument } from '../markdown/frontmatter.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(__dirname, '../..')

interface DevOptions {
  file: string
  port: number
}

export async function startDev (options: DevOptions) {
  const docFile = resolve(process.cwd(), options.file)
  const raw = readFileSync(docFile, 'utf-8')
  const { frontmatter } = parseDocument(raw)
  const theme = resolveTheme(frontmatter.theme || 'koumoul')

  const server = await createServer({
    root: packageRoot,
    plugins: [
      UnoCSS({ configFile: resolve(packageRoot, 'uno.config.ts') }),
      vue(),
      docMarkdownPlugin(docFile),
      docConfigPlugin({
        file: docFile,
        theme: theme.name,
        port: options.port,
        hasLogo: !!theme.logo
      }),
      docThemePlugin(theme)
    ],
    server: {
      port: options.port,
      open: true,
      fs: {
        allow: [packageRoot]
      }
    }
  })

  await server.listen()
  server.printUrls()
  server.bindCLIShortcuts({ print: true })
}
