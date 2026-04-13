import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// React Compiler (build-time memoization) via official preset + Rolldown Babel bridge (Vite 8+).
export default defineConfig({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('motion')) return 'motion'
            if (id.includes('lucide-react')) return 'icons'
            if (id.includes('react-dom') || id.includes('react/')) return 'react-vendor'
          }
        },
      },
    },
  },
})
