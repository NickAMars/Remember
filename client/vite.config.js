import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      include: /\.(js|jsx)$/,
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5001',
      '/auth': 'http://localhost:5001',
    },
  },
  build: {
    outDir: 'build',
  },
});
