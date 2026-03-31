import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react', 'framer-motion'],
          charts: ['recharts'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
          pdf: ['jspdf', 'jspdf-autotable'],
          excel: ['xlsx'],
          toast: ['react-toastify'],
          query: ['@tanstack/react-query', '@tanstack/react-query-devtools']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    hmr: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})