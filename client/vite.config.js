import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Where the Express API lives during local development.
// Override with VITE_API_TARGET if your backend runs elsewhere.
const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:5000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['undercut-zombie-harbor.ngrok-free.dev'],
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
      '/uploads': { target: apiTarget, changeOrigin: true },
      '/robots.txt': { target: apiTarget, changeOrigin: true },
      '/sitemap.xml': { target: apiTarget, changeOrigin: true },
    },
  },
})
