import { expect, test, type Page } from '@playwright/test';
import axe from 'axe-core';

/** Scroll the whole page so IntersectionObserver reveals fire and lazy images load. */
async function settle(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Horizontal card rails (agenda/products/sponsors, @utility rail) clip most of
    // their images off to the right of their own scroll container, independently of
    // page scroll. `el.scrollLeft = el.scrollWidth` alone is not reliable here — some
    // images never get a settled frame to recompute as visible — so scroll each
    // image individually into view with a small stagger between them instead.
    // Mirrors tests/homepage.spec.ts.
    for (const img of document.querySelectorAll<HTMLImageElement>('.rail img')) {
      img.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      await new Promise((r) => setTimeout(r, 20));
    }
    // Wait for every now-triggered image to actually finish loading (or fail)
    // instead of a fixed delay — network latency varies a lot per viewport.
    await Promise.all(
      [...document.images]
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve(), { once: true });
              img.addEventListener('error', () => resolve(), { once: true });
              setTimeout(resolve, 4000);
            }),
        ),
    );
    document.querySelectorAll<HTMLElement>('.rail').forEach((el) => {
      el.scrollLeft = 0;
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForLoadState('networkidle');
}

/**
 * Put every `.reveal` element at its resting state before an axe scan. The
 * scroll-reveal is a 0.85s opacity+translate transition; sampling it mid-fade
 * makes axe-core report a false color-contrast failure (text at a
 * semi-transparent midpoint). This only affects the test — production keeps
 * the fade (see src/styles/global.css @utility reveal). Mirrors
 * tests/homepage.spec.ts.
 */
async function settleReveals(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
      el.style.transition = 'none';
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });
}

const routes = [
  '/expositores',
  '/contacto',
  '/preguntas-frecuentes',
  '/noticias',
  '/noticias/avanzan-las-obras-y-preparativos-en-el-predio-ferial',
  '/mapa',
  '/entradas',
  '/agenda',
];

for (const route of routes) {
  test(`${route} loads with a single h1`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test(`${route} has no horizontal overflow`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });
    await settle(page);
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
  });

  test(`${route} renders images that load with alt text`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });
    await settle(page);
    const bad = await page.evaluate(() =>
      [...document.images]
        .filter((img) => img.getClientRects().length > 0)
        .filter((img) => img.naturalWidth === 0 || !img.alt.trim())
        .map((img) => img.currentSrc || img.src),
    );
    expect(bad).toEqual([]);
  });

  test(`${route} heading hierarchy starts at h1 and never skips`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });
    const levels = await page.evaluate(() =>
      [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1])),
    );
    expect(levels[0]).toBe(1);
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i]! - levels[i - 1]!).toBeLessThanOrEqual(1);
    }
  });

  test(`${route} logs no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(route, { waitUntil: 'networkidle' });
    await settle(page);
    expect(errors).toEqual([]);
  });

  test(`${route} — WCAG AA con axe-core sin violaciones`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });
    await settle(page);
    await settleReveals(page);
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const result = await (window as any).axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      });
      return result.violations.map((v: any) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        count: v.nodes.length,
        targets: v.nodes.slice(0, 3).map((n: any) => n.target.join(' ')),
      }));
    });
    expect(violations).toEqual([]);
  });
}

test('FAQ accordion toggles open/closed and syncs aria-expanded', async ({ page }) => {
  await page.goto('/preguntas-frecuentes', { waitUntil: 'networkidle' });

  const first = page.locator('details[data-accordion]').first();
  const toggle = first.locator('[data-accordion-toggle]');

  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toHaveAttribute('aria-controls', 'faq-panel-0');
  await expect(first).not.toHaveAttribute('open');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(first).toHaveAttribute('open', '');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(first).not.toHaveAttribute('open');
});

test('contact form exposes accessible fields with a honeypot', async ({ page }) => {
  await page.goto('/contacto', { waitUntil: 'networkidle' });

  // Scoped to `main`: the footer's newsletter form (Sprint P1-3) also matches
  // `form[method="POST"]` and is rendered on every page.
  const form = page.locator('main form[method="POST"]');
  await expect(form).toHaveCount(1);

  for (const name of ['nombre', 'email', 'asunto', 'mensaje']) {
    await expect(form.locator(`[name="${name}"]`)).toHaveCount(1);
  }
  await expect(form.locator('input[type="email"][name="email"]')).toHaveAttribute('required', '');
  await expect(form.locator('[name="website"]')).toHaveCount(1);

  const action = await form.evaluate((el) => el.getAttribute('action'));
  expect(action).not.toBeNull();
});

test('expositores search and rubro filter works interactively', async ({ page }) => {
  await page.goto('/expositores', { waitUntil: 'networkidle' });

  const cards = page.locator('[data-expositor-card]');
  await expect(cards).toHaveCount(18);

  // Click on 'Minería y Energía' filter button
  const mineriaBtn = page.locator('button[data-rubro-filter="Minería y Energía"]');
  await mineriaBtn.click();
  await expect(mineriaBtn).toHaveAttribute('aria-pressed', 'true');

  const visibleCards = page.locator('[data-expositor-card]:visible');
  await expect(visibleCards).toHaveCount(4);

  // Search for 'Ledesma'
  const searchInput = page.locator('#search-expositores');
  await searchInput.fill('Ledesma');

  // Reset to 'Todos'
  const todosBtn = page.locator('button[data-rubro-filter="Todos"]');
  await todosBtn.click();

  const ledesmaCard = page.locator('[data-expositor-card]:visible');
  await expect(ledesmaCard).toHaveCount(1);
  await expect(ledesmaCard).toContainText('Ledesma S.A.A.I.');

  // Counter check
  const counter = page.locator('#expositores-counter');
  await expect(counter).toContainText('Mostrando 1 de 18 expositores');
});

test('agenda filters sessions by day and track', async ({ page }) => {
  await page.goto('/agenda', { waitUntil: 'networkidle' });

  const allSessions = page.locator('#agenda-grid > li');
  await expect(allSessions).toHaveCount(18);

  // Filter day 17
  const day17Btn = page.locator('#agenda-days button[data-day="17"]');
  await day17Btn.click();
  await expect(day17Btn).toHaveAttribute('aria-pressed', 'true');

  const day17Visible = page.locator('#agenda-grid > li:not([hidden])');
  await expect(day17Visible).toHaveCount(5);

  // Filter day 18
  const day18Btn = page.locator('#agenda-days button[data-day="18"]');
  await day18Btn.click();

  const day18Visible = page.locator('#agenda-grid > li:not([hidden])');
  await expect(day18Visible).toHaveCount(4);
});

test('venue map updates detail card on zone click', async ({ page }) => {
  await page.goto('/mapa', { waitUntil: 'networkidle' });

  const detailCard = page.locator('#zone-detail-card');
  await expect(detailCard).toBeVisible();

  // Click on zone "mineria"
  const mineriaZoneBtn = page.locator('button[data-zone="mineria"]');
  await mineriaZoneBtn.click();
  await expect(mineriaZoneBtn).toHaveAttribute('aria-pressed', 'true');

  const title = page.locator('#zone-card-title');
  await expect(title).toContainText('Pabellón Minería');

  const stands = page.locator('#zone-card-stands');
  await expect(stands).toContainText('M-01');

  const expositores = page.locator('#zone-card-expositores');
  await expect(expositores).toContainText('Minera Exar');
});

test('contact form submits and renders accessible success status', async ({ page }) => {
  await page.goto('/contacto', { waitUntil: 'networkidle' });

  await page.fill('#nombre-field', 'Martina Gomez');
  await page.fill('#email-field', 'martina@example.com');
  await page.fill('#asunto-field', 'Consulta Stand Comercial');
  await page.fill('#mensaje-field', 'Buenas tardes, quisiera consultar por disponibilidad de stands en el Pabellón Agroindustrial.');

  const submitBtn = page.locator('#contacto-submit-btn');
  await submitBtn.click();

  const statusMsg = page.locator('#contacto-status');
  await expect(statusMsg).toBeVisible();
  await expect(statusMsg).toContainText('Tu mensaje fue recibido correctamente');
});

test('ticket form updates subtotal dynamically and generates reservation voucher', async ({ page }) => {
  await page.goto('/entradas', { waitUntil: 'networkidle' });

  // Select 'abono' ($10.000) and quantity 2 -> total $20.000
  const tipoSelect = page.locator('#tipo-field');
  await tipoSelect.selectOption('abono');

  const cantidadInput = page.locator('#cantidad-field');
  await cantidadInput.fill('2');

  const total = page.locator('#entradas-total');
  await expect(total).toHaveText('$20.000');

  // Fill user info
  await page.fill('#nombre-field', 'Carlos Albarracin');
  await page.fill('#email-field', 'carlos@example.com');

  const submitBtn = page.locator('#entradas-submit-btn');
  await submitBtn.click();

  const voucher = page.locator('#entradas-voucher');
  await expect(voucher).toBeVisible();

  const voucherCode = page.locator('#voucher-code');
  await expect(voucherCode).toContainText('EXP26-');

  const voucherDetails = page.locator('#voucher-details');
  await expect(voucherDetails).toContainText('2 entrada(s)');
});

test('newsletter in footer validates and shows confirmation message', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  const emailInput = page.locator('#newsletter-email');
  await emailInput.fill('visitante@expojuy.com.ar');

  const submitBtn = page.locator('#newsletter-submit-btn');
  await submitBtn.click();

  const status = page.locator('#newsletter-status');
  await expect(status).toBeVisible();
  await expect(status).toContainText('¡Gracias por suscribirte');
});
