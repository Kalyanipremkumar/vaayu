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
    port: 5173,
  },
});
