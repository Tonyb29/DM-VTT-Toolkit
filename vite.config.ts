import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main:       resolve(__dirname, 'index.html'),
        campaign:   resolve(__dirname, 'campaign.html'),
        pathfinder: resolve(__dirname, 'pathfinder.html'),
        drawsteel:  resolve(__dirname, 'drawsteel.html'),
        cyberpunk:  resolve(__dirname, 'cyberpunk-red.html'),
      }
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: false,
    watch: {
      usePolling: true,
      interval: 1000,
    }
  }
})
