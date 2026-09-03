import { expect, test } from '@playwright/test';

/**
 * Regression test for BUG-001/BUG-002 (docs/qa/AUDITORIA-6-SPRINTS.md) — the
 * header CTA "Quiero participar" used to render partially or fully outside
 * the viewport between 1280-1536px, and the "LA EXPO" nav item used to wrap
 * onto two lines at any desktop width. Fixed in Header.astro (docs/qa/PLAN-FIX.md,
 * P0-1). Runs once (desktop project) since it drives its own viewport widths.
 */
const widths = [1280, 1366, 1440, 1536];

for (const width of widths) {
  test(`header CTA stays inside the viewport at ${width}px`, async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'desktop') return;

    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const cta = page.locator('#site-header .flex.items-center.gap-3 a').first();
    await expect(cta).toBeVisible();

    const ctaBox = await cta.evaluate((el) => el.getBoundingClientRect().right);
    expect(ctaBox).toBeLessThanOrEqual(width);

    const laExpo = page.locator('#site-header nav a', { hasText: 'LA EXPO' });
    const otherItem = page.locator('#site-header nav a', { hasText: 'REGIONES' });
    const [laExpoHeight, otherHeight] = await Promise.all([
      laExpo.evaluate((el) => el.getBoundingClientRect().height),
      otherItem.evaluate((el) => el.getBoundingClientRect().height),
    ]);
    expect(laExpoHeight).toBeCloseTo(otherHeight, 0);
  });
}
