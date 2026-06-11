import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    exclude: ['node_modules/**', 'dist/**', 'e2e/**', 'playwright-report/**', 'test-results/**'],
    globals: true,
    setupFiles: './src/tests/setup.js',
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/utils/**/*.{js,jsx}',
        'src/components/common/**/*.{js,jsx}',
        'src/components/csp/**/*.{js,jsx}',
        'src/pages/admin/EnvironmentalImpactPage.jsx',
        'src/pages/admin/InstitutionalCspGeneratorPage.jsx',
      ],
      exclude: ['src/**/*.test.{js,jsx}', 'src/tests/**'],
    },
  },
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
