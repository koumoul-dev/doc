import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DocTheme } from '../types.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function resolveTheme (name: string): DocTheme {
  switch (name) {
    case 'minimal':
      return {
        name: 'minimal',
        styles: [resolve(__dirname, 'minimal/style.css')]
      }
    default:
      return {
        name: 'koumoul',
        styles: [resolve(__dirname, 'koumoul/style.css')],
        logo: resolve(__dirname, 'koumoul/logo.png')
      }
  }
}
