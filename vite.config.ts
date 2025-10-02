import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      // Output assets to a sub-directory to prevent conflicts with server build
      outDir: 'dist/public',
    },
    server: {
      proxy: {
        // Proxy API requests to the local backend server during development
        '/api': {
          target: 'http://localhost:10000', // Default port for our Express server
          changeOrigin: true,
        },
      },
    },
  }
})