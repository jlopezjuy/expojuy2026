// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  site: 'https://expojuy.com.ar',
  integrations: [
    // Sprint 6.1: generates sitemap-index.xml / sitemap-0.xml from the final
    // route tree, using `site` as the canonical origin. Pre-rendered routes
    // (including the static /noticias/[slug] posts) are included automatically.
    sitemap(),
    // Login / mi-cuenta islands only — the rest of the site stays plain Astro/SSG.
    preact(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // Placeholder photography is served remotely (see docs/design-spec.md).
    // Listed so Astro <Image> can be switched on once real assets exist.
    domains: ['images.unsplash.com'],
  },
});
