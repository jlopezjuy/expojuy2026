// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://expojuy.com.ar',
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // Placeholder photography is served remotely (see docs/design-spec.md).
    // Listed so Astro <Image> can be switched on once real assets exist.
    domains: ['images.unsplash.com'],
  },
});
