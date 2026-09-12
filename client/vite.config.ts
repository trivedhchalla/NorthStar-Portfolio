import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Read the project-root .env (one directory up) so the API port is defined
  // in a single place shared with docker-compose, rather than hardcoded here.
  const rootDir = fileURLToPath(new URL('..', import.meta.url))
  const env = loadEnv(mode, rootDir, '')
  const apiPort = env.API_PORT || '3001'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': `http://localhost:${apiPort}`,
      },
    },
  }
})
