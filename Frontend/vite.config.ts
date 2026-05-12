import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      shared: path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    // 🌟 TAMBAHIN LINK NGROK DI SINI BOS!
    allowedHosts: [
      '.loca.lt', 
      '.ngrok-free.dev', // <--- Jimat biar semua link ngrok diizinkan!
      'unrefined-platypus-tableful.ngrok-free.dev' 
    ]
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  }
})