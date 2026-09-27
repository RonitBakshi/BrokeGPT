import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/auth': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/threads': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/chat': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/integrations': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
