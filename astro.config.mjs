// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from 'astro-sitemap';

// https://astro.build/config
export default defineConfig({
  output: "static",
  trailingSlash: "always",
  site: "https://diicsacv.com",
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-MX'
        }
      }
    })
  ],
  vite: {
    ssr: {
      external: ["svgo"]
    }
  }
});
