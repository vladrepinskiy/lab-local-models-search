import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/lab-local-models-search/' : '/',
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    exclude: ['@electric-sql/pglite', '@electric-sql/pglite/vector'],
  },
  build: {
    target: 'esnext',
  },
}));
