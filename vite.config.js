import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// =====================================================================
// Configuração do Vite — dois builds separados:
// 1. Site Institucional (index.html → www.corpoeacao.com.br)
// 2. Painel do Gestor (admin.html → app.corpoeacao.com.br)
// =====================================================================
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html')
      }
    }
  },
  server: {
    open: true,
    port: 5173
  }
})
