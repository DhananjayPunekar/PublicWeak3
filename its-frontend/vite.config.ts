import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration.
 *
 * All browser calls go to relative URLs such as `/api/users`. The dev server
 * (and `vite preview`) forwards them to the Spring Cloud API Gateway, so the
 * browser never makes a cross-origin request and no CORS setup is needed on
 * the back end. Change the target with VITE_GATEWAY_URL in a `.env.local` file.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  /** URL of the API Gateway that routes to user-, project- and issue-service. */
  const gatewayUrl = env.VITE_GATEWAY_URL || 'http://localhost:8080';

  const proxy = {
    '/api': {
      target: gatewayUrl,
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    server: { port: 3000, proxy },
    preview: { port: 3000, proxy },
  };
});
