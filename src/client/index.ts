import 'virtual:uno.css'
import 'virtual:doc-theme-style.css'
import { createApp } from 'vue'
import App from './App.vue'
import './style/base.css'
import './style/print.css'

// Preserve scroll position across full-reload HMR
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeFullReload', () => {
    sessionStorage.setItem('__doc_scroll', String(window.scrollY))
  })
}

const savedScroll = sessionStorage.getItem('__doc_scroll')
if (savedScroll) {
  sessionStorage.removeItem('__doc_scroll')
  const y = parseInt(savedScroll)
  // Restore after the app has rendered and pagination is complete
  const observer = new MutationObserver(() => {
    if (document.querySelector('.document')) {
      observer.disconnect()
      requestAnimationFrame(() => window.scrollTo(0, y))
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

const app = createApp(App)
app.mount('#app')
