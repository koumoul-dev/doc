import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DocTheme } from '../types.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(__dirname, '../..')
const themesDir = resolve(packageRoot, 'src/themes')

export function resolveTheme (name: string): DocTheme {
  switch (name) {
    case 'minimal':
      return {
        name: 'minimal',
        styles: [resolve(themesDir, 'minimal/style.css')]
      }
    default:
      return {
        name: 'koumoul',
        styles: [resolve(themesDir, 'koumoul/style.css')],
        logo: resolve(themesDir, 'koumoul/logo.png')
      }
  }
}
