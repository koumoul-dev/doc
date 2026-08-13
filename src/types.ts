/** Page layout: `report` opens on a title page, `letterhead` on a compact header band */
export type DocLayout = 'report' | 'letterhead'

/** Issuer identity printed by the `letterhead` layout, as sent to the browser */
export interface Letterhead {
  /** Issuer name, printed in bold next to the logo */
  name: string
  /** Address, mail, phone… one line each */
  lines: string[]
  /** Legal mentions printed in the footer of every page */
  legal?: string
}

/** Letterhead identity as declared by a theme, filesystem paths included */
export interface ThemeLetterhead extends Letterhead {
  /** Logo for the header band — falls back to the theme logo when absent */
  logo?: string
}

export interface Frontmatter {
  title?: string
  version?: string
  date?: string
  description?: string
  warning?: string
  toc?: boolean
  tocLevels?: number
  theme?: string
  layout?: DocLayout
  /** Document reference, `letterhead` layout only */
  reference?: string
  /** Place of writing — "Fait à <place>, le <date>", `letterhead` layout only */
  place?: string
}

export interface DocConfig {
  file: string
  theme: string
  port: number
  hasLogo: boolean
  hasLetterheadLogo: boolean
  letterhead?: Letterhead
}

export interface DocTheme {
  name: string
  styles: string[]
  logo?: string
  mermaidTheme?: Record<string, string>
  cssVariables?: Record<string, string>
  letterhead?: ThemeLetterhead
}
