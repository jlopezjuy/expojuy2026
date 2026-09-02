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
  });
  await page.waitForLoadState('networkidle');
}

/**
 * Put every `.reveal` element at its resting state before an axe scan. The
 * scroll-reveal is a 0.85s opacity+translate transition; sampling it mid-fade
 * makes axe-core report a false color-contrast failure (text at a
 * semi-transparent midpoint). This only affects the test — production keeps
 * the fade (see src/styles/global.css @utility reveal).
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

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
});

test('renders every homepage section', async ({ page }) => {
  for (const id of ['top', 'la-expo', 'territorios', 'emprendimientos', 'agenda', 'participar']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('JUJUY');
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
});

test('has no horizontal overflow', async ({ page }) => {
  await settle(page);
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
});

test('every rendered image loads and carries alt text', async ({ page }) => {
  await settle(page);
  const bad = await page.evaluate(() =>
    [...document.images]
      // Images inside display:none containers legitimately never load.
      .filter((img) => img.getClientRects().length > 0)
      .filter((img) => img.naturalWidth === 0 || !img.alt.trim())
      .map((img) => img.currentSrc || img.src),
  );
  expect(bad).toEqual([]);
});

test('heading hierarchy starts at h1 and never skips a level', async ({ page }) => {
  const levels = await page.evaluate(() =>
    [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1])),
  );
  expect(levels[0]).toBe(1);
  expect(levels.filter((l) => l === 1)).toHaveLength(1);
  for (let i = 1; i < levels.length; i += 1) {
    expect(levels[i]! - levels[i - 1]!).toBeLessThanOrEqual(1);
  }
});

test('product filters narrow the list and stay in sync', async ({ page }) => {
  const grid = page.locator('#product-grid');
  const total = await grid.locator(':scope > li').count();

  const textiles = page.locator('#product-filters [data-filter="textiles"]');
  await textiles.click();
  await expect(textiles).toHaveAttribute('aria-pressed', 'true');
  await expect(grid.locator(':scope > li:visible')).toHaveCount(2);

  const todos = page.locator('#product-filters [data-filter="todos"]');
  await todos.click();
  await expect(grid.locator(':scope > li:visible')).toHaveCount(total);
});

test('mobile navigation opens, closes with Escape and is hidden on desktop', async ({
  page,
}, testInfo) => {
  const toggle = page.locator('#nav-toggle');
  const panel = page.locator('#mobile-nav');

  if (testInfo.project.name === 'desktop') {
    await expect(toggle).toBeHidden();
    return;
  }

  await expect(panel).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('the page logs no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.reload({ waitUntil: 'networkidle' });
  await settle(page);
  expect(errors).toEqual([]);
});

test('WCAG AA con axe-core — la home no tiene violaciones', async ({ page }) => {
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

test('reveals resolve even with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('.reveal')].filter(
      (el) => Number(getComputedStyle(el).opacity) < 1,
    ).length,
  );
  expect(hidden).toBe(0);
});
