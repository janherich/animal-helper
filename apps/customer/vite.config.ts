import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import type { Connect, Plugin } from 'vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons-ng'
import { defineConfig } from 'vitest/config'

const apiProxy = {
  '/commands': { target: 'http://127.0.0.1:8787', changeOrigin: false },
  '/status': { target: 'http://127.0.0.1:8787', changeOrigin: false },
  '/guidance': { target: 'http://127.0.0.1:8787', changeOrigin: false }
} as const

function readBody(request: Connect.IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = []
    request.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    request.on('error', reject)
  })
}

// Browser tests have no API. This accepts the same command envelope the client sends
// and echoes public case status, so the walk adapter can proceed without Postgres.
function stubCommandApi(): Plugin {
  return {
    name: 'customer-command-stub',
    apply: 'serve',
    configureServer(server) {
      if (process.env.E2E_STUB_COMMANDS !== '1') return
      server.middlewares.use((request, response, next) => {
        const path = request.url?.split('?')[0]
        if (path !== '/commands' || request.method !== 'POST') {
          next()
          return
        }
        void readBody(request)
          .then(raw => {
            const command = JSON.parse(raw) as { type?: string; expectedVersion?: number }
            response.statusCode = 200
            response.setHeader('content-type', 'application/json')
            response.end(
              JSON.stringify({
                ok: true,
                value: {
                  outcome: 'applied',
                  committedVersion: (command.expectedVersion ?? 0) + 1,
                  publicState: command.type === 'submit_draft' ? 'received' : 'draft'
                }
              })
            )
          })
          .catch(next)
      })
    }
  }
}

export default defineConfig({
  plugins: [
    stubCommandApi(),
    vue(),
    tailwindcss(),
    createSvgIconsPlugin({
      iconDirs: [fileURLToPath(new URL('./src/assets/icons', import.meta.url))],
      symbolId: 'icon-[name]',
      htmlMode: 'inline',
      failOnError: true,
      strokeOverride: false,
      bakerOptions: { optimize: false }
    })
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    include: ['src/**/__tests__/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/__tests__/**', 'src/**/*.d.ts']
    }
  },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    ...(process.env.E2E_STUB_COMMANDS === '1' ? {} : { proxy: apiProxy })
  },
  preview: {
    host: 'localhost',
    port: 4173,
    strictPort: true,
    ...(process.env.E2E_STUB_COMMANDS === '1' ? {} : { proxy: apiProxy })
  }
})
