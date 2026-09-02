// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://expojuy.com.ar',
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      // Editorial serif for display headlines ("JUJUY", section titles).
      provider: fontProviders.google(),
      name: 'Playfair Display',
      cssVariable: '--font-editorial',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      display: 'swap',
      fallbacks: ['Iowan Old Style', 'Georgia', 'serif'],
    },
    {
      // Geometric sans for UI / body copy.
      provider: fontProviders.google(),
      name: 'Manrope',
      cssVariable: '--font-ui',
      weights: ['400 800'],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      display: 'swap',
      fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
    },
  ],
  image: {
    // Placeholder photography is served remotely (see docs/design-spec.md).
    // Listed so Astro <Image> can be switched on once real assets exist.
    domains: ['images.unsplash.com'],
  },
});
