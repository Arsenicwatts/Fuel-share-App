import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy API calls to PHP backend during development if needed
    // proxy: {
    //   '/api': 'http://localhost/fuelshare-backend/api'
    // }
  }
})