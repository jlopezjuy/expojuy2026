# expojuy-frontend-testing

## Purpose

Run, extend and fix the ExpoJuy Playwright suite correctly — including its
accessibility contract, its three viewports, its build-not-dev-server setup, and
its two non-obvious settling helpers.

## When to Use

- Before declaring any frontend task done (this is step 3 of the Definition of
  Done in `AGENTS.md`).
- Adding a route, component or behaviour that needs coverage.
- A test fails and you need to know whether it is your change or the known
  baseline.

## Preconditions — know the baseline

**Verified current state: 213 tests, 210 pass, 3 fail.**

The three failures are all the same defect:

```text
[desktop|tablet|mobile] › tests/pages.spec.ts › /contacto — WCAG AA con axe-core sin violaciones
  color-contrast, impact: serious, target: .text-teal
```

Root cause: `src/components/sections/ContactSection.astro:28` passes
`accentColor="teal"` to `SectionHeading` on a `bg-cream` section. `teal`
(`#64baba`) on `cream` (`#f7efe1`) is ≈2:1 against a 4.5:1 requirement.

`README.md` claims "210 tests, 100% GREEN". That is wrong. Report what you
actually observe.

## Repository Context

`playwright.config.ts`:

| Setting | Value |
| --- | --- |
| `testDir` | `./tests` |
| Projects | `desktop` 1440×900, `tablet` 1024×768 (Chromium, `hasTouch`), `mobile` Pixel 7 |
| `webServer.command` | `npm run build && npx astro preview --port 4331` |
| Port | `4331` (or `PREVIEW_PORT`) — deliberately **not** Astro's 4321 |
| `reuseExistingServer` | `false` |
| `timeout` | 180 s for the server to come up |
| `env` | `ASTRO_PREVIEW_BACKGROUND: '1'` — keeps preview in the foreground so Playwright owns its lifecycle |

Tests run against the **production build**, not the dev server. Leave nothing
listening on 4331.

Only WebKit-free Chromium is installed; the tablet project emulates a tablet
*viewport* in Chromium rather than using the iPad Pro device profile, which
would need WebKit.

| Spec | Covers |
| --- | --- |
| `tests/homepage.spec.ts` | 9 tests: sections render, no horizontal overflow, images load + alt, heading hierarchy, product filters, mobile nav + Escape, no console errors, axe AA, reduced-motion reveals |
| `tests/pages.spec.ts` | a 6-test battery per route from the `routes` array (line 63), plus the FAQ accordion |
| `tests/seo.spec.ts` | `robots.txt`, sitemap, OG/Twitter/JSON-LD on `/` |
| `tests/header-regression.spec.ts` | header CTA stays inside the viewport across widths |

**Coverage gap:** `/login`, `/mi-cuenta` and `/404` are **not** in the `routes`
array. The two island pages have no test coverage at all. Do not widen that gap.

## The two settling helpers

Both live at the top of `tests/pages.spec.ts` and are mirrored in
`tests/homepage.spec.ts`. Any new spec that scans the page needs them, and
understanding why matters:

### `settle(page)`

Scrolls the whole page in 80%-viewport steps so `IntersectionObserver` reveals
fire and lazy images load. It then scrolls each `.rail img` individually into
view — a `@utility rail` is its own horizontal scroll container, so its images
never enter the viewport through page scroll alone, and setting `scrollLeft`
in one jump does not give them a settled frame. Finally it awaits every
still-loading image (with a 4 s per-image cap) rather than using a fixed delay.

### `settleReveals(page)`

Forces every `.reveal` element to its resting state before an axe scan:

```ts
el.style.transition = 'none';
el.style.opacity = '1';
el.style.transform = 'none';
```

Without it, axe samples mid-fade and reports a **false** `color-contrast`
violation on semi-transparent text. This only affects the test; production keeps
the fade.

So the order in an axe test is always: `goto` → `settle` → `settleReveals` →
inject axe → run.

## Workflow

### Covering a new route

One line, six tests per viewport:

```ts
const routes = [
  '/expositores',
  …
  '/nueva-ruta',
];
```

### Covering a new behaviour

Add a targeted test near the related ones. Follow the existing style: real user
actions, assertions on ARIA state and visible outcome, not implementation
details.

```ts
test('thing filter narrows the list and stays in sync', async ({ page }) => {
  await page.goto('/thing', { waitUntil: 'networkidle' });
  await settle(page);

  await page.locator('[data-thing-filter="alimentos"]').click();

  await expect(page.locator('[data-thing-filter="alimentos"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-thing-card]:visible')).toHaveCount(3);
});
```

### Running

```bash
npm test                                        # everything, all 3 projects
npx playwright test tests/pages.spec.ts         # one file
npx playwright test --project=desktop           # one viewport
npx playwright test -g "contacto"               # by title
npx playwright test --reporter=list             # default locally; CI uses 'github'
```

Each invocation rebuilds and starts its own preview server — a full run takes
around a minute.

### Reading a failure

Failures write to `test-results/<test-name>/error-context.md`. An axe failure
prints the rule `id`, `impact`, and up to three CSS `targets` — the target is
usually enough to find the offending element.

## Validation

Before reporting done:

```bash
npm run check     # must be 0 errors, 0 warnings
npm run build
npm test
```

Compare against the baseline. Acceptable: 210 pass / 3 fail. Anything else needs
an explanation — either you fixed the `/contacto` contrast (good, say so) or you
introduced something.

## Common Mistakes

- **Reporting a green suite.** Three tests fail today.
- Running an agent's own preview server on 4331 and confusing Playwright, which
  sets `reuseExistingServer: false` and expects to own the port.
- Testing against `npm run dev`. The suite tests the built output; dev-server
  behaviour differs (no minification, different asset URLs).
- Writing an axe test without `settle` + `settleReveals`, producing a false
  `color-contrast` failure on a mid-fade element.
- Adding a route without adding it to the `routes` array.
- Asserting on Tailwind class names instead of user-visible outcomes.
- Using `waitForTimeout` instead of `settle` or a proper `expect` retry.
- Adding a WebKit or Firefox project — only Chromium is installed.
- Ignoring the console-error test: any new `console.error` on any route fails the
  suite.

## Completion Criteria

- `npm run check` reports 0 errors and 0 warnings.
- `npm run build` succeeds and emits every expected route.
- `npm test` was actually run and its real counts are in the report.
- No new failures relative to 210 pass / 3 fail; if the count changed, the report
  says exactly why.
- New routes are in the `routes` array; new interactive behaviour has a test that
  fails when the behaviour is reverted.
- No new axe violation, horizontal overflow, or console error at any of the three
  viewports.
