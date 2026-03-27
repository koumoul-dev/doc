import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DocTheme } from '../types.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function resolveTheme (name: string): DocTheme {
  switch (name) {
    case 'koumoul':
      return {
        name: 'koumoul',
        styles: [resolve(__dirname, 'koumoul/style.css')],
        logo: resolve(__dirname, 'koumoul/logo.png')
      }
    default:
      return {
        name: 'default',
        styles: [resolve(__dirname, 'default/style.css')]
      }
  }
}
