declare module 'markdown-it-container' {
  import type MarkdownIt from 'markdown-it'
  const container: MarkdownIt.PluginWithOptions
  export default container
}

declare module 'virtual:doc-content' {
  export const frontmatter: import('./types.ts').Frontmatter
  export const blocks: string[]
}

declare module 'virtual:doc-config' {
  export const config: import('./types.ts').DocConfig
}

declare module 'virtual:doc-theme-style.css' {}
declare module 'virtual:uno.css' {}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
