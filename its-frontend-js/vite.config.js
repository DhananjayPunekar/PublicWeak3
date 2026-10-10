import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The browser calls relative URLs like /api/users.
// The dev server forwards every /api request to the API Gateway on port 8080,
// so the back end needs no CORS configuration.
const proxy = {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, proxy },
  preview: { port: 3000, proxy },
});
