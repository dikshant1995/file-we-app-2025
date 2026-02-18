import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  // Only build from main index.html, exclude test files
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  // Optimize dependency scanning
  optimizeDeps: {
    entries: ['./index.html']
  }
})