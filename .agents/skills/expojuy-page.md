# expojuy-page

## Purpose

Add a new route to the ExpoJuy site so it matches the other 15 in structure, SEO,
accessibility, navigation and test coverage — without duplicating a section that
already exists.

## When to Use

- A task asks for a new page or URL.
- A page-sized block on `/` needs to be promoted to its own route.
- A news post needs to become a route (it does so automatically — see step 2).

## Preconditions

1. **Check the route does not already exist.**
   ```bash
   fd . src/pages --type f
   rg -n "href: '/" src/data/site.ts
   ```
2. **Check whether the content already exists as a section.** Six section
   components already power both a page and a home-page band via `headingLevel`.
   If the "new page" is one of those, it is a routing change, not new UI.
   ```bash
   rg -n "headingLevel" src/components/sections
   ```
3. Read one existing page end to end — `src/pages/agenda.astro` is the canonical
   minimal case (12 lines), `src/pages/login.astro` the island case.

## Repository Context

| File | Role |
| --- | --- |
| `src/pages/<route>.astro` | the route |
| `src/layouts/BaseLayout.astro` | the only layout — `<head>`, OG, canonical, JSON-LD, fonts, skip-link |
| `src/components/sections/` | where the page body should live |
| `src/data/site.ts` | `nav` and `footerColumns` — add the route if it is navigable |
| `src/lib/links.ts` | `resolveHref` for `#anchor` links |
| `tests/pages.spec.ts` | the `routes` array at line 63 |

`astro.config.mjs` sets `site: 'https://expojuy.com.ar'`; canonical, OG URL and
the sitemap all derive from it automatically. No per-page sitemap work is needed.

## Workflow

### 1. Content first

If the page needs data, add it to `src/data/` following `src/data/AGENTS.md`.
Do not put content literals in the page.

### 2. News posts need no page

A Markdown file in `src/content/noticias/` whose frontmatter satisfies
`src/content.config.ts` (`title`, `date`, `description`; optional `image`,
`category`) automatically produces `/noticias/<filename>` via
`src/pages/noticias/[slug].astro`. Stop here for those — only add the route to
the test array.

### 3. Section component

Put the body in `src/components/sections/<Name>.astro`, not in the page:

```astro
---
interface Props {
  /** Heading level, since this section is its own page (h1) yet reuse-safe. */
  headingLevel?: 'h1' | 'h2';
}
const { headingLevel = 'h1' } = Astro.props;
---

<section class="bg-cream pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24" aria-labelledby="<name>-title">
  <Container width="normal">
    <div class="reveal">
      <SectionHeading
        eyebrow="…"
        title="…"
        accent="…"
        accentColor="magenta"
        as={headingLevel}
        id="<name>-title"
      />
    </div>
  </Container>
</section>
```

Non-negotiables in that snippet:

- `aria-labelledby` on the `<section>` pointing at the heading `id`.
- `as={headingLevel}` — never a hardcoded `h1`.
- `pt-28` or greater; the header is `fixed` and will otherwise overlap.
- `accentColor="teal"` is **forbidden on light backgrounds** — it fails WCAG AA
  contrast. Use `magenta` or `gold` on `bg-cream`.
- `Container`, not a hand-rolled `mx-auto max-w-*`.

### 4. The page

```astro
---
import Footer from '../components/navigation/Footer.astro';
import Header from '../components/navigation/Header.astro';
import <Name>Section from '../components/sections/<Name>Section.astro';
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="<Page> — ExpoJuy 2026"
  description="… del 9 al 12 de octubre de 2026 en Ciudad Cultural."
>
  <Header />

  <main id="main">
    <<Name>Section headingLevel="h1" />
  </main>

  <Footer />
</BaseLayout>
```

- Title format is `"<Page> — ExpoJuy 2026"`, matching every existing page.
- `description` is Spanish, one sentence, and mentions the event dates/venue the
  way the others do. Keep it in sync with `src/data/site.ts` `event`.
- `<main id="main">` is required — the skip-link in `BaseLayout` targets it.
- `BaseLayout` emits Schema.org `Event` JSON-LD **only on `/`**; do not add
  structured data to a sub-page unless the task asks for it.

### 5. Navigation

If the page should be reachable, add it to `nav` and/or `footerColumns` in
`src/data/site.ts`. `Header` filters out entries with `placeholder: true`, so an
unfinished destination can be staged rather than linked to a 404.

If the page links to a home-page anchor, route it through `resolveHref` —
`Header` and `Footer` already do; a page doing it by hand must too.

### 6. Test coverage

Add the route to the `routes` array in `tests/pages.spec.ts:63`. That single line
gives the route six tests per viewport: status 200 + single `h1`, no horizontal
overflow, images load with alt text, heading hierarchy, no console errors, and
axe WCAG 2.1 AA.

Skipping this step means the page ships untested. `/login`, `/mi-cuenta` and
`/404` are currently missing from that array — do not add to that gap.

## Validation

```bash
npm run check     # 0 errors, 0 warnings
npm run build     # route appears in the generated list
npm test          # known baseline: 210 pass / 3 fail (/contacto axe contrast)
```

Then look at it:

```bash
npm run dev       # http://localhost:4321/<route>
```

Check desktop 1440, tablet 1024 and mobile 390 — the three viewports the suite
uses.

## Common Mistakes

- Putting markup directly in the page instead of a section component — it then
  cannot be reused on `/` and cannot take `headingLevel`.
- Hardcoding `<h1>` in the section, producing two `h1`s when it is also used on
  the home page.
- Forgetting `<main id="main">`, which breaks the skip-link on that page.
- Forgetting `aria-labelledby`, which axe flags.
- Insufficient top padding under the fixed header.
- Linking to `#la-expo` from a non-home page without `resolveHref` — a silent
  no-op.
- Forgetting the `routes` array, so the page has zero coverage.
- Writing a description with dates that contradict `src/data/site.ts`.

## Completion Criteria

- `npm run check` clean, `npm run build` lists the new route.
- `npm test` shows no *new* failures versus the 210/3 baseline.
- The route is in `tests/pages.spec.ts`'s `routes` array.
- Exactly one `h1`; heading levels never skip.
- Reachable from `nav` or `footerColumns`, or the report says why it is not.
- Verified at all three viewports with no horizontal overflow.
