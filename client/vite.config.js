import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy /api sang backend Express (port 5555) để tránh CORS lúc dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5555',
    },
  },
});
