import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('html2pdf.js')) return 'pdf'
          if (id.includes('react') || id.includes('react-router-dom') || id.includes('zustand')) return 'react'
          if (id.includes('axios') || id.includes('react-hot-toast') || id.includes('lucide-react')) return 'vendor'
          return 'vendor-misc'
        },
      },
    },
  },
})
