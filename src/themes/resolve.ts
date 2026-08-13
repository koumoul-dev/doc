import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DocTheme, Letterhead } from '../types.ts'

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
        logo: resolve(themesDir, 'koumoul/logo.png'),
        letterhead: {
          logo: resolve(themesDir, 'koumoul/logo-circle.png'),
          name: 'SAS Koumoul',
          lines: [
            '5, rue Joseph le Brix - Quai Ouest',
            '56000 VANNES',
            'contact@koumoul.com',
            '02 97 26 22 41'
          ],
          legal: 'SAS au capital de 7 000 € — RCS Vannes — SIREN : 828983478 — NIF : FR38828983478'
        }
      }
  }
}

/** Letterhead identity as sent to the browser — filesystem paths stripped out */
export function clientLetterhead (theme: DocTheme): Letterhead | undefined {
  if (!theme.letterhead) return undefined
  const { logo, ...letterhead } = theme.letterhead
  return letterhead
}

/** Logo served to the letterhead header band, falling back to the theme logo */
export function letterheadLogoPath (theme: DocTheme): string | undefined {
  return theme.letterhead?.logo || theme.logo
}
