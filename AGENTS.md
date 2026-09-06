# ExpoJuy 2026 — Frontend Agent Guide

Operating manual for AI agents working in this repository. Read this before
touching code. Recurring procedures live in `.agents/skills/` (index at the
bottom). Two directories carry their own extra rules: `src/data/AGENTS.md` and
`src/components/AGENTS.md` — read those before working inside them.

## Project Overview

Official public website for **ExpoJuy 2026** (17th edition, 9–12 October 2026,
Ciudad Cultural, San Salvador de Jujuy), built for the *Desafío Digital ExpoJuy
2026*. Static site: 15 pre-rendered HTML routes, no server runtime.

Almost all content — exhibitors, agenda, FAQ, venue map, photography — is
**static TypeScript in `src/data/`**, not fetched from an API. The backend
(`https://github.com/jlopezjuy/expojuy2026backend`) is used only for login and
account display.

## Tech Stack

Verified against `package.json`, `astro.config.mjs`, `tsconfig.json`.

| Concern | Technology | Version |
| --- | --- | --- |
| Framework | Astro (static output) | `^7.2.10` |
| Runtime | Node.js | `>=22.12.0` |
| Styling | Tailwind CSS via `@tailwindcss/vite` | `^4.3.3` |
| Islands | Preact + `@preact/signals` (`@astrojs/preact`) | `^10.29.8` / `^2.8.2` / `^6.0.5` |
| Animation | `motion` (dynamically imported as `motion/mini`) | `^13.2.0` |
| Smooth scroll | `lenis` (dynamically imported) | `^1.3.26` |
| Sitemap | `@astrojs/sitemap` | `^3.7.4` |
| Language | TypeScript, `astro/tsconfigs/strict` | `^6.0.3` |
| Tests | Playwright + `axe-core` | `^1.62.1` / `^4.13.0` |

Not present, despite being plausible for this kind of site: React, Vue, Svelte,
Anime.js, Three.js, Theatre.js, GSAP, any CSS-in-JS, any state library beyond
`@preact/signals`, any UI component library. Do not add one.

> `README.md` is out of date on two points: it claims the project has **no**
> Preact and that `index.astro` is the only page. Both were true once. Trust this
> file and the code, not the README.

## Architecture

Static Site Generation. Every route is pre-rendered at build time; there is no
SSR adapter and no server runtime in production — Nginx serves `dist/`
(`../docker/frontend/nginx.conf`).

Three tiers of interactivity, in order of preference:

```text
1. Pure Astro + Tailwind          default — zero client JS
        ↓  needs behaviour?
2. src/scripts/enhance.ts         one shared vanilla-TS bundle, progressive
                                  enhancement, couples to markup via id/data-*
        ↓  needs reactive state that survives navigation?
3. Preact island (src/components/islands/)   only for authenticated UI today
```

Tier 3 is used by exactly three components (`LoginForm`, `AccountView`,
`AuthNav`). Everything else is tier 1 or 2. Escalating a component to an island
without a reason is a regression — it ships JavaScript the rest of the site does
not pay for.

Page composition is uniform:

```text
BaseLayout.astro   <head>, SEO, JSON-LD, fonts, skip-link, loads enhance.ts
   └─ Header.astro
   └─ <main id="main">  →  one or more section components from src/components/sections/
   └─ Footer.astro
```

## Important Directories

| Path | Responsibility |
| --- | --- |
| `src/pages/` | File-based routes. One `.astro` per route; `noticias/[slug].astro` is the only dynamic one |
| `src/layouts/BaseLayout.astro` | The **only** layout. `<head>`, OG/Twitter meta, canonical, favicons, Schema.org Event JSON-LD, font preloads, skip-link |
| `src/components/sections/` | Page-sized blocks (Hero band, Agenda, Expositores, PredioMap…). See `src/components/AGENTS.md` |
| `src/components/ui/` | Primitives: `ButtonLink`, `SectionHeading`, `Icon`, `Logo`, `Photo`, `ArrowCircle` |
| `src/components/cards/` | `FeatureCard`, `ProductCard`, `RegionCard` |
| `src/components/layout/` | `Container` — the page gutter/max-width wrapper (19 usages) |
| `src/components/navigation/` | `Header`, `Footer` |
| `src/components/hero/` | `Hero`, `HeroCollage` (home only) |
| `src/components/islands/` | Preact `.tsx` islands — auth UI only |
| `src/data/` | **Source of truth for all site content.** See `src/data/AGENTS.md` |
| `src/content/noticias/` | News posts as Markdown, typed by `src/content.config.ts` |
| `src/lib/api/` | `client.ts` (fetch wrapper) + `auth.ts` (typed endpoints) |
| `src/lib/auth/session.ts` | Signal-backed session, `localStorage`/`sessionStorage` |
| `src/lib/links.ts` | `resolveHref` — rewrites `#anchor` to `/#anchor` off the home page |
| `src/scripts/enhance.ts` | All progressive enhancement (~930 lines, 13 `init*` functions) |
| `src/styles/global.css` | Tailwind 4 `@theme` design tokens, `@font-face`, base layer, `@utility` definitions |
| `src/fonts/` | Ambit woff2 (light/regular/semibold/bold), self-hosted |
| `src/assets/` | Images imported through Astro's pipeline (optimised, hashed) |
| `public/images/photos/` | 20 local `.jpg` named by Unsplash id + `home.png` — served as-is |
| `public/docs/` | Public PDFs linked from the footer |
| `docs/` | `design-spec.md` (visual source of truth), `sprint-plan.md` (backlog), QA screenshots |
| `recursos/` | Official contest assets: logos, Ambit `.otf`, bases PDF. **Read-only** |
| `tests/` | Playwright specs |

## Routing

File-based. Current 15 built routes (verified against `npm run build` output):

```text
/                       index.astro          home, the only one-page composition
/agenda                 agenda.astro
/contacto               contacto.astro
/entradas               entradas.astro
/expositores            expositores.astro
/login                  login.astro          Preact island
/mapa                   mapa.astro
/mi-cuenta              mi-cuenta.astro      Preact island
/noticias               noticias/index.astro
/noticias/<slug>        noticias/[slug].astro  ×4 from src/content/noticias/
/preguntas-frecuentes   preguntas-frecuentes.astro
/404                    404.astro
```

In-page anchors (`#la-expo`, `#territorios`, `#emprendimientos`, `#participar`)
exist **only on `/`**. Any link to one must go through `resolveHref` from
`src/lib/links.ts`, which rewrites it to `/#anchor` on other pages. `Header` and
`Footer` already do this.

`astro.config.mjs` sets `site: 'https://expojuy.com.ar'` — canonical URLs, OG
URLs and the sitemap all derive from it.

## Components

Full inventory and the reuse rules are in **`src/components/AGENTS.md`**. The
short version: there are 29 components, every one is used, and the primitives
(`Container`, `SectionHeading`, `Icon`, `ButtonLink`, `Photo`) cover most needs.
Search before you create.

Section components take a `headingLevel?: 'h1' | 'h2'` prop so the same component
can be a page's `h1` or a band on the home page. Six sections implement it; match
that when adding a new one.

## Layout System

`Container` is the only horizontal-rhythm primitive:

```astro
<Container width="wide">     <!-- max-w-[96rem], default — full-bleed bands -->
<Container width="normal">   <!-- max-w-[76rem] — reading-width content -->
```

Both apply `mx-auto w-full px-gutter`, where `--spacing-gutter` is
`clamp(1.25rem, 0.6rem + 2.7vw, 3.5rem)`. Never hand-roll `max-w-* mx-auto px-*`
— use `Container`.

Section vertical rhythm follows the existing pattern, e.g.
`pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24` (`Expositores.astro:15`). The header is
`fixed`, so any section that starts a page needs top padding of at least `pt-28`;
`html { scroll-padding-top: 6rem }` handles anchor offsets.

## Styling

Tailwind CSS 4, configured entirely in CSS. **There is no `tailwind.config.js`** —
tokens live in the `@theme` block of `src/styles/global.css`, which is what
generates the utility classes.

Use the generated utilities (`bg-night`, `text-magenta`, `text-display`,
`px-gutter`, `rounded-card`), not arbitrary values. Adding a raw hex or a
one-off `clamp()` in a component is how the design system rots.

Custom utilities defined with `@utility` in `global.css`, available everywhere:
`skip-link`, `eyebrow`, `reveal`, `rail`, and the nine `hero-animate-*` classes.

## Design System

Tokens from `src/styles/global.css`. The palette is documented as **INFERRED**
(sampled from the approved mockup `00.png`, not from a brand manual) — see
`docs/design-spec.md`.

| Token | Hex | Role |
| --- | --- | --- |
| `cream` | `#f7efe1` | Page background |
| `cream-deep` | `#ece3d4` | Alternating band background |
| `night` | `#07121e` | Dark sections, footer, cards |
| `night-soft` / `night-line` | `#0d1b2a` / `#1d2c3c` | Dark elevation / hairlines |
| `ink` | `#2f2e2f` | Body text |
| `gold` / `gold-bright` | `#dba649` / `#eab21e` | Warm accent / filled CTAs, focus ring |
| `magenta` | `#d62a79` | Heading accent **on light surfaces** |
| `teal` | `#64baba` | Heading accent **on dark surfaces only** |
| `blue` | `#1f6399` | Logo mark |
| `sand` | `#dad2c6` | Neutral swatch |

> **Contrast trap, currently failing in `main`:** `teal` on `cream` is ≈2:1 and
> fails WCAG AA. `ContactSection.astro:28` uses `accentColor="teal"` on a
> `bg-cream` section, which is why three axe tests fail today. Use `magenta` or
> `night` on light surfaces; reserve `teal` for `bg-night`.

Type: **Ambit** only, self-hosted from `src/fonts/*.woff2`, four weights
(300/400/600/700). Both `--font-display` and `--font-sans` resolve to it. No
Google Fonts, no external font requests — that is a contest requirement, not a
preference.

Fluid sizes: `text-hero`, `text-display`, `text-title`, `text-body`, all
`clamp()`-based. Radius: `rounded-card` (`0.5rem`). Easing: `--ease-out-expo`.

## Assets

**Search before adding anything.**

- **Photography** — 20 local JPGs in `public/images/photos/`, named by Unsplash
  id, catalogued in `src/data/photos.ts` with Spanish alt text and an aspect
  ratio. Render them through `<Photo photo={photos.key} />`, never a bare `<img>`
  with a hardcoded path. `scripts/download-assets.mjs` is what fetched them.
- **Pipeline images** — `src/assets/` for anything that should be optimised and
  hashed by Astro (currently the isologotipo and the CamComExt sponsor logo).
- **Icons** — `src/components/ui/Icon.astro` holds a 13-name inline SVG set
  (`briefcase`, `compass`, `culture`, `gear`, `experience`, `arrow-right`,
  `arrow-down`, `instagram`, `facebook`, `x`, `youtube`, `linkedin`, `search`).
  Add a new `name` to that component rather than inlining an SVG in a page.
- **Official assets** — `recursos/` holds the real logos (CMYK + RGB) and the
  Ambit `.otf` originals. Use them; do not recreate a logo by hand.
- **PDFs** — `public/docs/`, regenerated from `docs/*.md` by
  `npm run build:docs`.

`BaseLayout.astro:24` currently points `ogImage` at
`/images/photos/hero-crowd.jpg`, **which does not exist**. Any social preview is
a 404 today.

## API Integration

The site talks to the backend through exactly one wrapper and two endpoints.

```text
src/lib/api/client.ts     apiRequest<T>(path, { token, ... })
   ├─ base URL from import.meta.env.PUBLIC_API_BASE_URL
   ├─ sets Content-Type on bodied requests, Authorization: Bearer on token
   ├─ 204 → undefined, !ok → throws ApiError(status)
   └─ 401 with a token → global handler: clearSession() + redirect to /login

src/lib/api/auth.ts       login()      → POST /api/authenticate  → { id_token }
                          getAccount() → GET  /api/account       → UserDTO
```

`PUBLIC_API_BASE_URL` (see `.env.example`) is `http://localhost:8080` locally and
**empty in Docker**, where `resolveUrl` falls back to `window.location.origin`
and Nginx proxies `/api/` to the backend container.

Never call `fetch` directly from a component. Add a typed function to
`src/lib/api/` and go through `apiRequest`.

The forms on `/contacto`, `/entradas` and the footer newsletter are
**client-side simulations** — `enhance.ts` shows a success message via
`setTimeout` and sends nothing anywhere. Do not describe them as working
submissions.

## State Management

- **Server-time data**: plain imports from `src/data/*.ts` and
  `getCollection('noticias')`. No store.
- **DOM-local UI state** (filters, accordion, mobile nav, map selection): handled
  imperatively in `enhance.ts` against `id` / `data-*` hooks. No framework.
- **Session**: `sessionSignal` — a `@preact/signals` signal in
  `src/lib/auth/session.ts`, hydrated from `localStorage` (remember me) or
  `sessionStorage` under the key `expojuy_auth`. Every island importing that
  module shares the same instance.

There is no global store and none is needed.

## Animation Strategy

Three layers, deliberately ordered cheapest-first:

1. **CSS keyframes in `global.css`** — the hero entrance sequence
   (`hero-animate-*`) and the `reveal` scroll transition. Default choice.
2. **`IntersectionObserver`** in `enhance.ts` (`initReveals`) — adds `.is-visible`
   to `.reveal` elements once.
3. **`motion/mini`, dynamically imported** — only for filter enter/exit
   transitions, the mobile nav, the accordion and the login shake. Loaded via
   `loadMotion()` (`enhance.ts:151`) so the bundle is never in the critical path.
   `lenis` is imported the same way in `initSmoothScroll`.

Non-negotiable rules, already implemented everywhere:

- Every animation path checks
  `window.matchMedia('(prefers-reduced-motion: reduce)')` and takes a static
  branch. `global.css` also has a global `prefers-reduced-motion` block.
- Every dynamic import has a `.catch()` that degrades to the un-animated result.
  A failed chunk must never leave the UI in a broken state.
- `html:not(.js) .reveal` keeps content visible without JavaScript. `BaseLayout`
  adds `.js` to `<html>` in an inline script before first paint.

Details and the worked pattern: `.agents/skills/expojuy-interactive-behavior.md`.

## Responsive Strategy

Mobile-first Tailwind breakpoints. Tested at three viewports (see Testing).
Recurring patterns in this codebase:

- `@utility rail` — horizontal scroll-snap card strips on small screens, often
  cancelled at a breakpoint with `sm:overflow-visible [mask-image:none]`.
- The desktop nav appears at `xl:`; below that the hamburger panel is used
  (`Header.astro:27,63`).
- `html { overflow-x: clip }` — `clip`, not `hidden`, so `<html>` never becomes a
  scroll container.
- Any grid or flex child that could overflow needs `min-w-0`.

Horizontal overflow at any width from 360px to 1536px is a test failure, not a
cosmetic issue.

## Accessibility

WCAG 2.1 AA is a **tested contract**, not an aspiration — `tests/pages.spec.ts`
and `tests/homepage.spec.ts` run `axe-core` on every route at three viewports.

Conventions already in place, which new work must preserve:

- Exactly one `h1` per page, no skipped levels. Section components take
  `headingLevel` for exactly this reason.
- `<a href="#main" class="skip-link">` in `BaseLayout`; every page has
  `<main id="main">`.
- Every `<section>` carries `aria-labelledby` pointing at its heading's `id`.
- Every image has real Spanish alt text from `src/data/photos.ts`; decorative
  images pass `alt=""` explicitly.
- Filter buttons carry `aria-pressed`; the nav toggle carries `aria-expanded` +
  `aria-controls`; status messages use `role="alert"`.
- `:focus-visible` is styled globally with a `gold-bright` outline. Do not
  `outline: none` anything.
- Colour contrast ≥4.5:1 — see the `teal`/`cream` trap above.

## Performance

- Zero client JS by default. `enhance.ts` is the only always-loaded script.
- `motion` and `lenis` are dynamic imports, never in the initial bundle.
- Islands use the narrowest directive that works: `client:load` for `LoginForm`
  (needs immediate interactivity), `client:only="preact"` for `AuthNav` and
  `AccountView` (session state is browser-only, so SSR would flash wrong output).
- Fonts: only `ambit-regular` and `ambit-semibold` are `<link rel="preload">`ed;
  all four use `font-display: swap`.
- `<Photo>` sets `width`/`height` to reserve layout space, and defaults to
  `loading="lazy" decoding="async"`. Pass `priority` only for above-the-fold
  images.
- Baseline: 15 pages built in ~700 ms. If a change makes the build noticeably
  slower, say so.

## Development Commands

```bash
npm install
npm run dev          # astro dev on http://localhost:4321
npm run build        # static output to dist/
npm run preview      # serve the build
npm run check        # astro check — TypeScript + .astro diagnostics
npm test             # Playwright, builds first and previews on port 4331
npm run build:docs   # regenerate the PDFs in docs/ and public/docs/ (Playwright Chromium)
```

Baseline to preserve: `npm run check` reports **0 errors, 0 warnings** over 64
files; `npm run build` emits **15 pages**.

## Testing

Playwright, three projects — `desktop` (1440×900), `tablet` (1024×768 Chromium),
`mobile` (Pixel 7). Configured in `playwright.config.ts`.

Tests run against the **production build**, not the dev server:
`webServer.command` is `npm run build && npx astro preview --port 4331`. Do not
leave anything listening on 4331.

| Spec | Covers |
| --- | --- |
| `tests/homepage.spec.ts` | Sections render, no horizontal overflow, images load + alt, heading hierarchy, product filters, mobile nav, no console errors, axe AA, reduced-motion reveals |
| `tests/pages.spec.ts` | The same battery over every non-home route, driven by a `routes` array |
| `tests/seo.spec.ts` | `robots.txt`, sitemap, OG/Twitter/JSON-LD on the home page |
| `tests/header-regression.spec.ts` | Header CTA stays in the viewport across widths |

**Current state, verified: 213 tests — 210 pass, 3 fail.** The three failures are
`/contacto — WCAG AA con axe-core sin violaciones` on all three projects,
`color-contrast` on `.text-teal`. The README's claim of "210 tests, 100% GREEN"
is wrong. Treat 210/3 as the known baseline and do not report a green suite you
did not see.

Procedure: `.agents/skills/expojuy-frontend-testing.md`.

## Adding a New Page

Full procedure in `.agents/skills/expojuy-page.md`. Shape:

```text
1. Search for an existing route/section that already does it
2. src/data/<topic>.ts        typed content, if the page needs data
3. src/components/sections/   the section component, with headingLevel
4. src/pages/<route>.astro    BaseLayout + Header + <main id="main"> + Footer
5. src/data/site.ts           add to `nav` and/or `footerColumns` if navigable
6. tests/pages.spec.ts        add the route to the `routes` array
7. npm run check && npm run build && npm test
```

## Adding a New Component

Full procedure in `.agents/skills/expojuy-component.md` and the local rules in
`src/components/AGENTS.md`. The first three steps are always discovery:

```bash
fd . src/components --type f          # what exists
rg -n "interface Props" -A 12 src/components/ui   # what the primitives already accept
rg -n "@theme" -A 60 src/styles/global.css        # what tokens exist
```

Reuse or extend before creating. A new variant on `ButtonLink` beats a second
button component.

## Modifying Existing UI

1. Identify every usage before editing a shared component:
   `rg -n "<ComponentName" src/`.
2. Change the component, not its call sites, when the change is systemic.
3. If markup carries an `id` or `data-*` attribute, check `enhance.ts` — it is
   coupled by string. `rg -n "getElementById\('the-id'\)" src/scripts/enhance.ts`.
4. Re-run the full Playwright suite. UI changes break a11y and overflow tests in
   ways `astro check` cannot see.

## Do Not

- **Do not add a UI framework, animation library or component kit.** The stack is
  fixed: Astro + Tailwind + three Preact islands + `motion` + `lenis`.
- **Do not create a Preact island** for something that CSS or `enhance.ts` can do.
  Islands ship JavaScript to every visitor.
- **Do not use `client:visible` / `client:idle` casually.** The three existing
  islands chose `client:load` and `client:only="preact"` deliberately; changing a
  directive changes hydration and SSR behaviour.
- **Do not write arbitrary Tailwind values** (`text-[#d62a79]`,
  `max-w-[73rem]`) when a token exists. Extend `@theme` in `global.css` instead.
- **Do not use `teal` as a text colour on `cream`.** It fails WCAG AA and is
  already the cause of three failing tests.
- **Do not invent content** — company names, session times, prices, addresses,
  sponsor lists. The project convention is an explicit `TODO(Sprint X)` comment
  where real data is missing. See `src/data/AGENTS.md`.
- **Do not add a remote image or font.** Everything is local by contest
  requirement (`recursos/BASES Y CONDICIONES.pdf`).
- **Do not create a second layout.** `BaseLayout.astro` is the only one; extend it
  with props if a page genuinely needs different `<head>` output.
- **Do not edit `recursos/`.** Those are the official contest assets.
- **Do not commit generated output** — `dist/`, `.astro/`, `test-results/` are
  gitignored.
- **Do not rename an `id` or `data-*` attribute** without grepping `enhance.ts`.
  The coupling is by string literal and TypeScript will not catch it.
- **Do not claim the Playwright suite is green.** Three tests fail today.

## Cross-Repository Contract

Backend repo: `https://github.com/jlopezjuy/expojuy2026backend`, checked out at
`../backend`. A feature that spans both is not done when one side compiles.

- The only integration surface is `src/lib/api/`. Two endpoints are consumed.
- `src/lib/api/auth.ts:UserDTO` mirrors the backend's
  `../backend/server/src/service/dto/user.dto.ts`. **They disagree today**: this repo marks
  `firstName`, `lastName`, `activated`, `langKey` and `authorities` as required;
  the backend marks them optional. Keep that in mind before trusting the type.
- Login response field is `id_token` (`LoginForm.tsx:63`). Renaming it backend-side
  breaks login silently.
- A new backend endpoint needs: a typed wrapper in `src/lib/api/`, a caller
  (island or `enhance.ts`), error and loading states, and a test.
- When you change a shared shape, name the files on **both** sides in your report.

## Definition of Done

A frontend task is finished only when all of these have actually been run and
reported with their real output:

1. `npm run check` — 0 errors, 0 warnings.
2. `npm run build` — succeeds, still emits every expected route.
3. `npm test` — no **new** failures. The known baseline is 210 pass / 3 fail
   (`/contacto` axe contrast). If your count differs, explain why.
4. Visually or structurally verified at all three viewports — desktop 1440,
   tablet 1024, mobile 390.
5. No new horizontal overflow, no new axe violation, no new console error.
6. Any new image has alt text; any new section has `aria-labelledby`; heading
   hierarchy unbroken.
7. If a shared component, `id`, or `data-*` hook changed, every usage was checked.
8. If the API contract changed, the backend impact is stated.

"It builds" is not done.

## Skills Index

| Skill | Use it when |
| --- | --- |
| `.agents/skills/expojuy-page.md` | Adding or restructuring a route |
| `.agents/skills/expojuy-component.md` | Creating or extending a component |
| `.agents/skills/expojuy-interactive-behavior.md` | Any client-side behaviour or animation |
| `.agents/skills/expojuy-content-data.md` | Changing site content, data or news posts |
| `.agents/skills/expojuy-api-integration.md` | Wiring the frontend to a backend endpoint |
| `.agents/skills/expojuy-frontend-testing.md` | Writing, running or fixing Playwright/axe tests |

Directory-local rules: `src/data/AGENTS.md`, `src/components/AGENTS.md`.
