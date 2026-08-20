// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://petrkovickelurdy.cz',
  integrations: [sitemap({
    i18n: {
      defaultLocale: 'cs',
      locales: {
        cs: 'cs-CZ',
        en: 'en-GB',
      },
    },
  })],
  i18n: {
    defaultLocale: 'cs',
    locales: ['cs', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
