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
  // Deutsch bleibt auf der Root-Domain (kein Praefix), Englisch liegt unter
  // /en/. Bewusst kein Subdomain-/ccTLD-Aufbau, damit die gesamte Domain-
  // Autoritaet auf octastudy.com gebuendelt bleibt. Seiten fuer /en/ liegen
  // einfach unter src/pages/en/ — das Astro-Dateirouting erledigt den Rest,
  // dieser Block macht das Setup nur explizit und schaltet i18n-Hilfsfunktionen frei.
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    routing: {
      prefixDefault: false,
    },
  },
  integrations: [
    sitemap({
      // Rechtsseiten und ausgeblendete Seiten gehoeren nicht in die Sitemap
      filter: (page) =>
        !page.includes('/impressum/') &&
        !page.includes('/datenschutz/') &&
        // Vorerst ausgeblendet — Zeile entfernen, wenn /ueber-uns/ live geht
        !page.includes('/ueber-uns/'),
    }),
  ],
});
