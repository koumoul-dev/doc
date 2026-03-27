import type MarkdownIt from 'markdown-it'

export function applyMermaid (md: MarkdownIt): void {
  const defaultFence = md.renderer.rules.fence ||
    function (tokens, idx, options, _env, self) { return self.renderToken(tokens, idx, options) }

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    if (token.info.trim() === 'mermaid') {
      const escaped = md.utils.escapeHtml(token.content)
      return `<div class="mermaid-block"><pre class="mermaid">${escaped}</pre></div>\n`
    }
    return defaultFence(tokens, idx, options, env, self)
  }
}
