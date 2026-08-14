// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://octastudy.com',
  trailingSlash: 'always',
  build: {
    // Erzeugt /impressum/index.html statt /impressum.html
    format: 'directory',
  },
  integrations: [
    sitemap({
      // Rechtsseiten gehoeren nicht in die Sitemap
      filter: (page) =>
        !page.includes('/impressum/') && !page.includes('/datenschutz/'),
    }),
  ],
});
