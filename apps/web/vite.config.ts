import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite config for the Vaayu web app.
 * The `@vaayu/*` workspace packages are consumed as raw TypeScript source, so
 * no extra alias config is needed — pnpm + Vite resolve them via package.json
 * `main`/`exports`. Vite transpiles their TS on the fly.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    // Honour PORT when set (e.g. by the preview tooling); default to 5173.
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    // Bind all interfaces (IPv4 + IPv6) so http://localhost AND http://127.0.0.1
    // both resolve — Windows often points `localhost` at IPv4, which a v6-only
    // bind would miss.
    host: true,
  },
});
