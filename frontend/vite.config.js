import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load every env key (not just VITE_*) so API_BASE_URL can be configured from .env.
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = (
    env.API_BASE_URL ||
    env.VITE_API_BASE_URL ||
    env.VITE_API_URL ||
    'http://localhost:4000/api'
  ).replace(/\/$/, '')

  return {
    plugins: [react()],
    // Makes API_BASE_URL available as a compile-time constant in frontend code.
    define: {
      API_BASE_URL: JSON.stringify(apiBaseUrl),
    },
    server: {
      port: 5173,
      host: true,
    },
  }
})
