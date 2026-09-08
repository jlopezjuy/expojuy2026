import { expect, test, type Page } from '@playwright/test';

/**
 * Asistente de visita — búsqueda, intención y enlaces profundos.
 *
 * Se ejecuta contra el build de producción (ver `playwright.config.ts`), así
 * que también verifica que `dist/search-index.json` se haya emitido.
 */

const results = '[data-assistant-results] > li';

async function openAssistant(page: Page) {
  await page.locator('[data-assistant-open]').click();
  await expect(page.locator('[data-assistant-panel]')).toHaveAttribute('data-open', '');
}

/**
 * Escribe la consulta y espera a que el panel llegue a un estado terminal.
 *
 * No se espera la respuesta de red: el `fetch` del índice arranca en el mismo
 * click que abre el panel, así que un `waitForResponse` registrado después
 * llega tarde y expira. Esperar el estado del DOM es la condición real.
 */
async function search(page: Page, query: string) {
  await page.locator('[data-assistant-input]').fill(query);

  await expect
    .poll(
      async () => {
        const [count, empty, suggestions] = await Promise.all([
          page.locator(results).count(),
          page.locator('[data-assistant-empty]').isVisible(),
          page.locator('[data-assistant-suggestions]').isVisible(),
        ]);
        return count > 0 || empty || suggestions;
      },
      // La primera consulta paga la descarga del motor y del índice.
      { timeout: 20_000, message: `el asistente no respondió a "${query}"` },
    )
    .toBe(true);
}

test.describe('Asistente de visita', () => {
  test('el índice de búsqueda se emite en el build', async ({ request }) => {
    const response = await request.get('/search-index.json');
    expect(response.ok()).toBe(true);

    const payload = await response.json();
    expect(Array.isArray(payload.documents)).toBe(true);
    expect(payload.documents.length).toBeGreaterThan(50);

    // Cada documento debe poder navegarse: sin `url` la tarjeta no lleva a nada.
    for (const doc of payload.documents) {
      expect(doc.url, `documento sin url: ${doc.id}`).toBeTruthy();
    }
  });

  test('no carga el motor hasta que se abre el panel', async ({ page }) => {
    const engineRequests: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('search-index.json')) engineRequests.push(r.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(engineRequests).toHaveLength(0);

    await openAssistant(page);
    await expect.poll(() => engineRequests.length, { timeout: 20_000 }).toBeGreaterThan(0);
  });

  test('responde las consultas del visitante', async ({ page }) => {
    await page.goto('/');
    await openAssistant(page);

    // Vocabulario del visitante, no del sistema: "comer" → patio gastronómico.
    await search(page, '¿Dónde puedo comer?');
    await expect(page.locator(results).first()).toContainText('Patio Gastronómico');

    await search(page, '¿Dónde están los baños?');
    await expect(page.locator(results).first()).toContainText('Sanitarios');

    await search(page, '¿Dónde puedo estacionar?');
    await expect(page.locator(results).first()).toContainText('Estacionamiento');

    await search(page, '¿Qué empresas de tecnología hay?');
    await expect(page.locator(results).first()).toContainText('ClusteAR');

    await search(page, '¿Dónde está el stand de Ledesma?');
    await expect(page.locator(results).first()).toContainText('Ledesma');
  });

  test('tolera errores de tipeo y lo avisa', async ({ page }) => {
    await page.goto('/');
    await openAssistant(page);

    for (const [typo, expected] of [
      ['gastrnomia', 'Gastronómico'],
      ['estacionamieto', 'Estacionamiento'],
    ] as const) {
      await search(page, typo);
      await expect(page.locator(results).first()).toContainText(expected);
      await expect(page.locator('[data-assistant-notice]')).toBeVisible();
    }
  });

  test('aclara que "hoy" está fuera de las fechas del evento', async ({ page }) => {
    await page.goto('/');
    await openAssistant(page);
    await search(page, '¿Qué actividades hay hoy?');

    // El sitio se construye antes del 9 de octubre de 2026: el asistente debe
    // decirlo en vez de presentar la jornada de apertura como si fuera hoy.
    const notice = page.locator('[data-assistant-notice]');
    await expect(notice).toBeVisible();
    await expect(notice).toContainText('9 al 12 de octubre');
  });

  test('filtra la agenda por jornada', async ({ page }) => {
    await page.goto('/');
    await openAssistant(page);
    await search(page, '¿Qué actividades hay el sábado?');

    await expect(page.locator('[data-assistant-context]')).toContainText('Sábado 10');
    await expect(page.locator(results).first()).toBeVisible();
  });

  test('estado vacío cuando no hay dato, sin inventar', async ({ page }) => {
    await page.goto('/');
    await openAssistant(page);
    await search(page, 'zzzqqqxxx');

    await expect(page.locator('[data-assistant-empty]')).toBeVisible();
    await expect(page.locator(results)).toHaveCount(0);
    await expect(page.locator('[data-assistant-notice]')).toBeHidden();
  });

  test('una consulta vacía vuelve a las sugerencias', async ({ page }) => {
    await page.goto('/');
    await openAssistant(page);

    await search(page, 'baño');
    await expect(page.locator(results).first()).toBeVisible();

    await search(page, '   ');
    await expect(page.locator('[data-assistant-suggestions]')).toBeVisible();
    await expect(page.locator(results)).toHaveCount(0);
  });

  test('el contenido del modal scrollea con la rueda del mouse', async ({ page }) => {
    await page.goto('/');
    await openAssistant(page);

    // Una consulta con muchos resultados garantiza contenido desbordado.
    await search(page, 'stand');

    const body = page.locator('[data-assistant-body]');
    await expect
      .poll(async () => body.evaluate((el) => el.scrollHeight - el.clientHeight))
      .toBeGreaterThan(50);

    // Regresión de `data-lenis-prevent`. `initSmoothScroll()` monta Lenis con
    // `smoothWheel` en escritorio y Lenis captura el wheel a nivel documento:
    // sin la marca, el contenedor scrollea por código pero la rueda no hace
    // nada. Por eso la prueba usa la rueda real y no `el.scrollTop = n`.
    const box = await body.boundingBox();
    if (!box) throw new Error('el cuerpo del asistente no tiene caja');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 400);

    await expect.poll(async () => body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);

    // Y la página de atrás no se movió: el modal contiene su propio scroll.
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('se cierra con Escape y devuelve el foco', async ({ page }) => {
    await page.goto('/');
    await openAssistant(page);

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-assistant-panel]')).not.toHaveAttribute('data-open', '');
    await expect(page.locator('[data-assistant-open]')).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('Enlaces profundos del asistente', () => {
  test('/mapa?zona= selecciona la zona', async ({ page }) => {
    await page.goto('/mapa?zona=gastronomico');
    await expect(page.locator('[data-zone="gastronomico"]')).toHaveAttribute('aria-current', 'true');
    await expect(page.locator('#zone-card-title')).toContainText('Patio Gastronómico');
  });

  test('/agenda?dia= filtra la jornada', async ({ page }) => {
    await page.goto('/agenda?dia=11');
    await expect(page.locator('#agenda-days [data-day="11"]')).toHaveAttribute('aria-pressed', 'true');

    await expect(page.locator('#agenda-grid > [data-day="11"]:not([hidden])').first()).toBeVisible();

    // Aserción sobre el conjunto, no iterando: la transición de salida va
    // ocultando tarjetas mientras corre y un `for` sobre una foto de la lista
    // consulta elementos que ya no están.
    await expect(
      page.locator('#agenda-grid > [data-day]:not([hidden]):not([data-day="11"])'),
    ).toHaveCount(0);
  });

  test('/expositores?q= precarga el buscador del directorio', async ({ page }) => {
    await page.goto('/expositores?q=Nubeliu%20Cloud%20Solutions');
    await expect(page.locator('#search-expositores')).toHaveValue('Nubeliu Cloud Solutions');
    await expect(page.locator('#expositores-counter')).toContainText('Mostrando 1 de 18');
  });
});
