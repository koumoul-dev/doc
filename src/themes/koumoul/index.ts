import type { DocTheme } from '../../types.ts'

const theme: DocTheme = {
  name: 'koumoul',
  styles: [new URL('./style.css', import.meta.url).pathname],
  logo: new URL('./logo.png', import.meta.url).pathname,
  cssVariables: {
    '--doc-primary': '#1976D2',
    '--doc-primary-light': '#81D4FA',
    '--doc-accent': '#2962FF',
    '--doc-background': '#FAFAFA',
    '--doc-text': '#424242',
    '--doc-font': "'Nunito', system-ui, sans-serif"
  },
  mermaidTheme: {
    theme: 'base',
    themeVariables: JSON.stringify({
      primaryColor: '#1976D2',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#1565C0',
      lineColor: '#424242',
      secondaryColor: '#81D4FA',
      tertiaryColor: '#E3F2FD'
    })
  }
}

export default theme
