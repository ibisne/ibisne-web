import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Solo se usan src/ y public/. Los .html de la raiz pertenecen al sitio viejo
// y Astro no los procesa (las paginas salen de src/pages).
export default defineConfig({
  site: 'https://www.ibisne.com',
  output: 'static',
  trailingSlash: 'always',
  publicDir: './public',
  srcDir: './src',
  build: {
    format: 'directory',
    inlineStylesheets: 'never',
  },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
  integrations: [
    sitemap({
      filter: (page) => !/\/404\/?$/.test(page),
    }),
  ],
});
