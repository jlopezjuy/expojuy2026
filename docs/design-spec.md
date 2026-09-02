# ExpoJuy 2026 — design spec

Reconstruction of **"Propuesta 1 — Jujuy Cinematográfico"**.

**Source of truth:** `00.png` (approved composite) with `02.png` used to resolve fine detail.
`01.png`, `03.png`, `04.png`, `05.png` and `06.png` are discarded alternative concepts and were
not used.

> All values marked **INFERRED** were sampled or measured off the mockup bitmap. They are visual
> matches, not numbers from a brand manual.

---

## 1. Global tokens

Defined once in `src/styles/global.css` under Tailwind v4's `@theme`. Use the generated utilities
(`bg-night`, `text-magenta`, `text-display`, `px-gutter`) rather than arbitrary values.

### Colour — INFERRED (sampled from the palette swatches in `00.png`)

| Token             | Hex       | Role                                                    |
| ----------------- | --------- | ------------------------------------------------------- |
| `gold`            | `#dba649` | Warm accent, swatch 1                                    |
| `gold-bright`     | `#eab21e` | Filled CTAs ("QUIERO EXPONER"), focus ring — sampled from the button itself |
| `magenta`         | `#d62a79` | Heading accent ("*Jujuy.*", "*hace posible.*")           |
| `teal`            | `#64baba` | Heading accent on dark ("*una misma esencia.*")          |
| `blue`            | `#1f6399` | Logo mark                                                |
| `ink`             | `#2f2e2f` | Swatch 5, body text base                                 |
| `sand`            | `#dad2c6` | Swatch 6                                                 |
| `cream`           | `#f7efe1` | Page background, "La Expo" band                          |
| `cream-deep`      | `#ece3d4` | "Emprendimientos" + feature-row band                     |
| `night`           | `#07121e` | Dark sections, footer, cards                             |
| `night-soft` / `night-line` | `#0d1b2a` / `#1d2c3c` | Dark-surface elevation and hairlines     |

### Type

Both families are self-hosted at build time through Astro's `fonts` config (`astro.config.mjs`) with
`display: swap` and optimised metric fallbacks — no third-party font requests at runtime.

- **Display:** Playfair Display (400–700). The spec panel suggests "Playfair Display / Canela";
  Playfair is the freely licensed half of that pair.
- **UI/body:** Manrope (variable 400–800). The panel suggests "Satoshi / Manrope"; Satoshi is not
  freely redistributable, so Manrope is used.

Sizes are fluid `clamp()` values reverse-engineered from the mockup at a 1440px design width:

| Token          | 390px | 1440px | Used for                                    |
| -------------- | ----- | ------ | ------------------------------------------- |
| `text-hero`    | 116px | 281px  | "JUJUY"                                     |
| `text-display` | 30px  | 45px   | Section headings                            |
| `text-title`   | 22px  | 34px   | Hero statement, feature-card titles         |
| `text-body`    | 15px  | 17px   | Body copy                                   |
| `.eyebrow`     | 11px  | 11px   | Tracked uppercase labels (0.22em)           |

### Layout & motion

- `--spacing-gutter`: `clamp(1.25rem, 0.6rem + 2.7vw, 3.5rem)` — the single page inset.
- Content width: `max-w-[96rem]` (`Container width="wide"`), `max-w-[76rem]` for `normal`.
- `--ease-out-expo`: `cubic-bezier(0.16, 1, 0.3, 1)` — every transition in the site.
- Breakpoints are Tailwind defaults; `xl` (1280px) is the desktop-nav threshold, `lg` (1024px) the
  two-column threshold.

---

## 2. Sections

Order matches `src/pages/index.astro`.

### Header — `components/navigation/Header.astro`

Fixed, transparent over the hero; picks up `data-stuck` (blur + `night/90`) past 40px of scroll.
Full nav from `xl`, hamburger panel below. The "QUIERO PARTICIPAR" pill appears from `md`.
Nav targets are in-page anchors; `VISITAR` has no designed section on this page and is an explicit
`href="#"` placeholder (`nav[].placeholder` in `src/data/site.ts`).

### Hero — `components/hero/Hero.astro`

- **Goal:** cinematic full-bleed opener; the display title crosses the photograph.
- **Layout:** `min-h-100svh` flex column. Eyebrow + `JUJUY` sit at ~10%/16% of the hero height;
  dates bottom-left, statement bottom-right, scroll cue centred — matching the mockup's measured
  positions. The three-photo collage is the one place absolute positioning is used for composition
  (`HeroCollage.astro`), shown from `lg`.
- **Images:** backdrop is `priority` (eager, `fetchpriority=high`); collage is lazy.
- **Responsive:** below `lg` the collage is dropped and the block reflows to statement → dates,
  the order shown in the phone mockup. Hero category list breaks 2 + 2 on phones.
- **Animation:** backdrop and each collage tile translate on scroll at different depths
  (`data-parallax` / `data-collage-item` + `data-depth`); scroll cue bounces.

### La Expo — `components/sections/LaExpo.astro`

38/62 split; copy left on cream, photograph bleeding to the right edge with a cream gradient
feathering its left side. Five pillar icons in a single row, then an outline CTA. Stacks to
copy-then-photo below `lg`.

### Nuestros territorios — `components/sections/Territorios.astro`

Dark band. Four region cards (`RegionCard.astro`) in a 4-up grid from `lg`, 2-up from `sm`,
horizontal snap rail on phones. Cards are `5/4` on desktop and `4/5` in the rail. Hover scales the
photo inside a clipped frame and nudges the arrow. Side blurb + circular arrow sit right of the grid
on desktop, below it on phones.

### Emprendimientos — `components/sections/Emprendimientos.astro`

Filter pills + a single continuous photo rail that runs off the right edge at every breakpoint, as
in the mockup. The pills are a `role="group"` of `aria-pressed` toggles (not a tablist — there is no
tabpanel), driven by `src/scripts/enhance.ts`; a visually hidden live region announces the count.

### Feature trio — `components/sections/FeatureTrio.astro` / `cards/FeatureCard.astro`

Three dark cards: gastronomy, stories, agenda. The photo sits behind the copy — right 64% for the
first two, full-bleed for the agenda card, always under a left-to-right scrim. The agenda card
passes its day list through the `aside` slot. Stacks to one column below `lg`.

### CTA banner — `components/sections/CtaBanner.astro`

Full-width dusk photograph with a purple-to-transparent scrim, serif heading, amber solid CTA.
Parallax at a shallow depth.

### Sponsors — `components/sections/Sponsors.astro`

**No official logo files exist in this repo.** The institutional supporters read off `00.png`
(Gobierno de Jujuy, CFI, Cámara de Comercio Exterior de Jujuy, BANCOR, Macro, YPF, JEMSE, Jujuy
Energía) render as text wordmarks. **Pending real assets** — replace with supplied SVGs.

### Footer — `components/navigation/Footer.astro`

Dark navy. Brand + tagline + socials, three link columns, newsletter form. The form has
**no backend**; its `action` is a placeholder (marked with a TODO in the component).

---

## 3. Assets — all placeholders

Photography is hot-linked from `images.unsplash.com`, catalogued in **`src/data/photos.ts`**,
and rendered through **`components/ui/Photo.astro`** (responsive `srcset` + `sizes`, lazy below the
fold, intrinsic `width`/`height` to reserve space).

Every photo is a stand-in chosen to match the mockup's framing, crop and warm documentary grade.
**Before launch, replace all of them with real ExpoJuy / Jujuy photography.** The intended path:
drop the files into `src/assets/`, then swap `Photo.astro`'s `<img>` for Astro's `<Image>` —
`astro.config.mjs` already declares the remote domain and the component isolates the change.

Two placeholders deviate most from the reference and should be prioritised:

- **`expoGate`** — the mockup shows the real ExpoJuy entrance arch with sponsor logos. The
  placeholder is a generic market street.
- **Hero backdrop and collage** — the mockup features a person in a poncho in the foreground of a
  Quebrada landscape; the placeholder is landscape-only.

The `EXPOJUY 2026` lockup in `components/ui/Logo.astro` is an **original SVG** inspired by the
coloured geometric block mark in the reference — not a trace of the mockup bitmap.

---

## 4. Copy

Every visible string is transcribed from `00.png` / `02.png` and lives in `src/data/site.ts`.
Nothing is invented. One passage — the supporting paragraph under "Lo que Jujuy hace posible." — is
illegible in the reference and renders as a marked placeholder rather than made-up marketing copy.

---

## 5. Accessibility & performance

- Landmarks: `header` / `main` / `footer` / `nav`, one `h1`, no skipped heading levels
  (asserted in `tests/homepage.spec.ts`).
- Skip link, visible `:focus-visible` ring in `gold-bright`, real `<button>` / `<a>` elements,
  `sr-only` labels on every icon-only control.
- All JavaScript is progressive enhancement (~2 KB, one module): reveals, header state, mobile nav,
  filters, parallax. Without it the page is complete and navigable — `html:not(.js) .reveal` keeps
  content visible.
- `prefers-reduced-motion: reduce` disables parallax entirely and forces every reveal to its
  resting state.
- Fonts self-hosted with `swap` and preload; `preconnect` to the image CDN; below-the-fold images
  lazy with `decoding="async"`.

---

## 6. Commands

| Command           | Purpose                                               |
| ----------------- | ----------------------------------------------------- |
| `npm run dev`     | Dev server                                            |
| `npm run build`   | Static build to `dist/`                               |
| `npm run check`   | `astro check` (TypeScript + template diagnostics)     |
| `npm test`        | Playwright smoke suite against the built output       |
