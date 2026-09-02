import { expect, test, type Page } from '@playwright/test';

/** Scroll the whole page so IntersectionObserver reveals fire and lazy images load. */
async function settle(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForLoadState('networkidle');
}

const routes = [
  '/expositores',
  '/contacto',
  '/preguntas-frecuentes',
  '/noticias',
  '/noticias/se-lanza-el-desafio-digital',
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

  const form = page.locator('form[method="POST"]');
  await expect(form).toHaveCount(1);

  for (const name of ['nombre', 'email', 'asunto', 'mensaje']) {
    await expect(form.locator(`[name="${name}"]`)).toHaveCount(1);
  }
  await expect(form.locator('input[type="email"][name="email"]')).toHaveAttribute('required', '');
  await expect(form.locator('[name="website"]')).toHaveCount(1);

  const action = await form.evaluate((el) => el.getAttribute('action'));
  expect(action).not.toBeNull();
});
