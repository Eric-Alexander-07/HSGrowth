import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    port: 81,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://10.10.100.110:80', // oder http://10.10.100.110:80
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
