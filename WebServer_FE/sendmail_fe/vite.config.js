import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 80, // hoặc 80 nếu không bị xung đột cổng fix: 5173
    host: "localhost",
    https: false // hoặc true nếu bạn đang test https bằng cert giả
  }
})
