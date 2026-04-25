import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip', ext: '.gz' }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-router')) return 'vendor-react';
          if (id.includes('react-dom'))    return 'vendor-react';
          if (id.includes('/react/'))      return 'vendor-react';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('/axios/'))      return 'vendor-http';
          if (id.includes('react-quill'))  return 'vendor-editor';
          if (id.includes('/marked/') || id.includes('dompurify') || id.includes('gray-matter')) return 'vendor-md';
        },
      },
    },
  },
})
