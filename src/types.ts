export interface Frontmatter {
  title?: string
  version?: string
  date?: string
  description?: string
  warning?: string
  toc?: boolean
  theme?: string
}

export interface DocConfig {
  file: string
  theme: string
  port: number
  hasLogo: boolean
}

export interface DocTheme {
  name: string
  styles: string[]
  logo?: string
  mermaidTheme?: Record<string, string>
  cssVariables?: Record<string, string>
}
