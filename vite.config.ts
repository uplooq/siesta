import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

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

export default defineConfig({
  base: '/',
  plugins: [react(), mapDirIndex()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
