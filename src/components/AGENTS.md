# Components — local rules

These rules apply to everything under `src/components/`. They are **in addition
to** the repository's `AGENTS.md`, and exist because this is where duplication
happens fastest.

## The one rule

**Search before you create.** Every component in this directory is used; nothing
here is dead. If you are about to write a button, a heading, a card or a
container, one already exists.

```bash
fd . src/components --type f                        # full inventory
rg -n "interface Props" -A 14 src/components/ui     # what the primitives accept
rg -n "<ComponentName" src/                         # who uses a component
```

## Inventory

29 components in seven folders. Reuse counts are current.

### `ui/` — primitives, reach for these first

| Component | Used | Props worth knowing |
| --- | --- | --- |
| `Icon.astro` | 13× | `name` — a closed union of 13 names. Add a name here, never inline an SVG elsewhere |
| `SectionHeading.astro` | 13× | `eyebrow`, `title`, `accent`, `accentColor` (`magenta`/`teal`/`gold`), `tone` (`light`/`dark`), `as` (`h1`/`h2`/`h3`), `breakBeforeAccent`, `id` |
| `Photo.astro` | 7× | `photo` (from `src/data/photos.ts`), `sizes`, `ratio`, `maxWidth`, `priority`, `alt` override |
| `ButtonLink.astro` | 6× | `href`, `variant` (`pill`/`outline`/`ghost`/`solid`), `ariaLabel` |
| `Logo.astro` | 2× | `href`, `tone` |
| `ArrowCircle.astro` | 2× | — |

### `layout/` and `navigation/`

| Component | Used | Notes |
| --- | --- | --- |
| `Container.astro` | 19× | `as`, `width` (`wide` = `max-w-[96rem]`, `normal` = `max-w-[76rem]`) |
| `Header.astro` | 13× | Fixed, `data-stuck` toggled by `enhance.ts`. Contains the `AuthNav` island |
| `Footer.astro` | 12× | Newsletter form, socials, legal links, sponsor logo |

### `sections/` — page-sized blocks, one per feature

`AgendaSection`, `ContactSection`, `CtaBanner`, `Emprendimientos`,
`EntradasSection`, `Expositores`, `FaqSection`, `FeatureTrio`, `LaExpo`,
`PredioMap`, `Sponsors`, `Territorios`.

Six of them (`AgendaSection`, `ContactSection`, `EntradasSection`,
`Expositores`, `FaqSection`, `PredioMap`) accept `headingLevel?: 'h1' | 'h2'`
so the same component can be a standalone page's `h1` or a band on the home
page. **A new section that can appear on more than one page must implement it.**

### `cards/`

`FeatureCard`, `ProductCard`, `RegionCard` — used once each, by
`FeatureTrio`, `Emprendimientos` and `Territorios` respectively.

### `hero/`

`Hero`, `HeroCollage` — home page only. Driven by the `hero-animate-*`
utilities in `src/styles/global.css`.

### `islands/` — Preact, `.tsx`

`LoginForm`, `AccountView`, `AuthNav`. **This is the whole island budget.** They
exist because session state must be reactive and browser-only. Do not add a
fourth without a reason that CSS and `enhance.ts` genuinely cannot cover.

## Decide before you build

```text
Is there a component that already does ~80% of this?
  yes → extend it (a new variant, a new prop with a default) — preferred
  no  ↓
Is it a page-sized block?      → sections/, with headingLevel
Is it a small reusable atom?   → ui/
Is it a repeated item in a list? → cards/
Does it need reactive state that survives navigation? → islands/  (last resort)
```

Extending beats creating. A fifth `ButtonLink` variant is better than a second
button component.

## Conventions every component follows

- `.astro` unless it must hydrate. Only `islands/` is `.tsx`.
- A typed `interface Props` in the frontmatter, with defaults destructured:
  ```astro
  const { as: Tag = 'div', width = 'wide', class: className = '' }: Props = Astro.props;
  ```
- `class?: string` passthrough appended last, so callers can adjust spacing
  without a wrapper `<div>`.
- Variants as a `const ... as const` lookup object, not a chain of ternaries.
  See `ButtonLink.astro:26-34`.
- Tailwind tokens only — `bg-night`, `text-magenta`, `px-gutter`,
  `rounded-card`. No raw hex, no arbitrary `max-w-[...]` where `Container` fits.
- Comments explain *why*, in the style already present (see the focus-ring
  rationale in `ButtonLink.astro:20-25`). Keep them in English or match the
  file's existing language.
- `<section>` elements carry `aria-labelledby` pointing at their heading `id`.
- Anything animated is wrapped in `.reveal` or a `hero-animate-*` utility, never
  hand-rolled inline transitions.

## The `enhance.ts` coupling

`src/scripts/enhance.ts` reaches into this markup by **string literal**. These
attributes are a contract, not decoration:

`id`: `site-header`, `nav-toggle`, `mobile-nav`, `product-filters`,
`product-grid`, `product-count`, `agenda-days`, `agenda-tracks`, `agenda-grid`,
`agenda-count`, `search-expositores`, `expositores-counter`, `no-expositores`,
`plano-info`, `zone-card-*`, `contacto-form`, `contacto-status`,
`contacto-submit-btn`, `contacto-btn-text`, `entradas-form`, `tipo-field`,
`cantidad-field`, `entradas-total`, `entradas-voucher`, `voucher-code`,
`voucher-details`, `entradas-submit-btn`, `entradas-btn-text`,
`newsletter-form`, `newsletter-email`, `newsletter-status`.

`data-*`: `data-filter`, `data-category`, `data-day`, `data-track`,
`data-rubro`, `data-rubro-filter`, `data-search-text`, `data-expositor-card`,
`data-zone`, `data-zone-name`, `data-zone-note`, `data-zone-badge`,
`data-zone-stands`, `data-zone-expositores`, `data-venue-map`,
`data-venue-path`, `data-accordion`, `data-accordion-toggle`, `data-parallax`,
`data-depth`, `data-collage-item`.

Classes with behaviour: `.reveal` (+ `--reveal-delay`), `.rail`.

Before renaming or removing any of these:

```bash
rg -n "the-id-or-attribute" src/scripts/enhance.ts
```

TypeScript will not catch a mismatch. The Playwright suite usually will — but
only if the behaviour is covered.

## Do Not

- Do not create a component without running the inventory search first.
- Do not duplicate `Container`'s `mx-auto max-w-* px-*` by hand.
- Do not inline an SVG icon — add a `name` to `Icon.astro`.
- Do not use a bare `<img src="/images/photos/...">` — use `<Photo>` so the alt
  text, dimensions and loading strategy come from `src/data/photos.ts`.
- Do not hardcode a heading level in a section that could appear on two pages.
- Do not add `accentColor="teal"` to a `SectionHeading` on a light background —
  it fails WCAG AA contrast (this is a live test failure in
  `ContactSection.astro:28`).
- Do not add a Preact island without justifying why tiers 1 and 2 are
  insufficient.
- Do not remove a `class` passthrough prop; call sites rely on them.
