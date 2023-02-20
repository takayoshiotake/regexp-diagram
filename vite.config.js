import { defineConfig } from 'vite';

export default defineConfig({
  base: '/regexp-diagram/',
  root: 'src',
  build: {
    outDir: '../dist',
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
