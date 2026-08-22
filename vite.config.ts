import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages 部署到 /wheel-of-life/；本地开发继续使用根路径。
  base: (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.GITHUB_ACTIONS === 'true'
    ? '/wheel-of-life/'
    : '/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
