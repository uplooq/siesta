import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const mapDirIndex = (): Plugin => {
  const rewrite = (req: { url?: string }) => {
    const match = (req.url ?? '').match(/^(.*\/map)\/?$/)
    if (match) req.url = `${match[1]}/index.html`
  }
  return {
    name: 'map-dir-index',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req)
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req)
        next()
      })
    },
  }
}

// Content-Security-Policy через <meta>: GitHub Pages не позволяет задавать HTTP-заголовки.
// Вставляется только в build — dev-сервер Vite инжектит инлайновые стили для HMR.
// Внешние источники: Google Fonts (CSS + файлы шрифтов) и тайлы OpenFreeMap для MapLibre.
// MapLibre запускает воркер из blob: и создаёт картинки тайлов через blob:/data:.
const cspFor = (page: 'main' | 'map') =>
  [
    "default-src 'self'",
    "script-src 'self'",
    // страница карты рисует инспектор через innerHTML с атрибутами style="…"
    page === 'map'
      ? "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
      : "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://tiles.openfreemap.org",
    "worker-src blob:",
    "child-src blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    'upgrade-insecure-requests',
  ].join('; ')

const cspMeta = (): Plugin => ({
  name: 'csp-meta',
  apply: 'build',
  transformIndexHtml(_html, ctx) {
    const page = ctx.path.startsWith('/map/') ? 'map' : 'main'
    return [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: cspFor(page) },
        injectTo: 'head-prepend',
      },
    ]
  },
})

export default defineConfig({
  base: '/',
  plugins: [react(), mapDirIndex(), cspMeta()],
  resolve: {
    alias: {
      '@': fromRoot('./src'),
    },
  },
  build: {
    rollupOptions: {
      // две страницы: лендинг и конструктор маршрутов
      input: {
        main: fromRoot('./index.html'),
        map: fromRoot('./map/index.html'),
      },
    },
  },
})
