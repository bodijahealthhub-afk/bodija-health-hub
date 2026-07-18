import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['undercut-zombie-harbor.ngrok-free.dev'],
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
