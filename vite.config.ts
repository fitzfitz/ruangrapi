import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 3,
            },
            {
              name: 'router-vendor',
              test: /node_modules[\\/]react-router/,
              priority: 2,
            },
            {
              name: 'data-vendor',
              test: /node_modules[\\/](@supabase|@tanstack)[\\/]/,
              priority: 2,
            },
            {
              name: 'form-vendor',
              test: /node_modules[\\/](@hookform|react-hook-form|zod)[\\/]/,
              priority: 2,
            },
          ],
        },
      },
    },
  },
  plugins: [react()],
})
