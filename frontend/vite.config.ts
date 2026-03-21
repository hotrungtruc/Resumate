import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  // For Docker: use 'backend' hostname, for local dev: use 'localhost'
  // process.env reads from system environment variables (set by docker-compose)
  const apiTarget = process.env.VITE_API_BASE_URL || 'http://localhost:8000';

  console.log('Vite proxy target:', apiTarget);

  return {
    server: {
      host: '0.0.0.0',  // Allow external connections (Docker)
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          // Better error handling for proxy
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Proxying:', req.method, req.url, '→', apiTarget);
            });
          },
        }
      }
    },
    plugins: [react()],
  };
});
