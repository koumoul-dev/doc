import type { DocTheme } from '../../types.ts'

const theme: DocTheme = {
  name: 'minimal',
  styles: [new URL('./style.css', import.meta.url).pathname],
  cssVariables: {
    '--doc-primary': '#333333',
    '--doc-primary-light': '#666666',
    '--doc-background': '#ffffff',
    '--doc-text': '#333333',
    '--doc-font': 'system-ui, -apple-system, sans-serif'
  }
}

export default theme
