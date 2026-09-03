import { expect, test } from '@playwright/test';

/**
 * Sprint 6.1 — sitemap + robots indexables.
 * `@astrojs/sitemap` escribe `sitemap-index.xml` / `sitemap-0.xml` en `dist/`
 * durante `astro build`, y `public/robots.txt` se copia tal cual. El webServer
 * de Playwright sirve el build, así que estas rutas deben responder.
 */
test('robots.txt y el sitemap se sirven y son indexables', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBeTruthy();
  const robotsText = await robots.text();
  expect(robotsText).toContain('User-agent: *');
  expect(robotsText).toContain('Sitemap: https://expojuy.com.ar/sitemap-index.xml');

  const index = await request.get('/sitemap-index.xml');
  expect(index.ok()).toBeTruthy();
  expect(await index.text()).toContain('sitemap-0.xml');

  const sitemap = await request.get('/sitemap-0.xml');
  expect(sitemap.ok()).toBeTruthy();
  const sitemapText = await sitemap.text();
  // Al menos las rutas de las secciones mínimas y las noticias estáticas.
  for (const url of [
    'https://expojuy.com.ar/',
    'https://expojuy.com.ar/agenda/',
    'https://expojuy.com.ar/contacto/',
    'https://expojuy.com.ar/expositores/',
    'https://expojuy.com.ar/preguntas-frecuentes/',
    'https://expojuy.com.ar/noticias/',
    'https://expojuy.com.ar/noticias/avanzan-las-obras-y-preparativos-en-el-predio-ferial/',
  ]) {
    expect(sitemapText, `el sitemap debe incluir ${url}`).toContain(url);
  }
});
