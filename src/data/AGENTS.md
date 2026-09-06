# Data — local rules

`src/data/` is the **source of truth for everything the site says**. It is also
the single highest-risk place in this repository for an agent to fabricate
information that then gets published as official communication from a
provincial government event.

These rules are in addition to the repository's `AGENTS.md`.

## The one rule

**Never invent content.** No company names, session times, prices, addresses,
speakers, sponsor lists, contact details, stand numbers or dates.

The established convention when real data is missing is an explicit TODO, not a
plausible placeholder:

```ts
 * TODO(Sprint 5.2): logos reales de los otros sponsors pendientes de
 * confirmación de la organización. Mantener wordmarks de texto para ellos,
 * no inventar el set.
```

That comment is real — `site.ts:120-122`. Follow it. If a task asks for data you
do not have, add the entry with a TODO and say so in your report; do not fill the
gap with something that reads convincingly.

## Files

| File | Holds | Consumed by |
| --- | --- | --- |
| `site.ts` | Event identity, nav, hero categories, pillars, regions, product filters/products, agenda day strip, sponsors, footer columns, socials, legal links | `Header`, `Footer`, `Hero`, `LaExpo`, `Territorios`, `Emprendimientos`, `Sponsors`, `BaseLayout` |
| `expositores.ts` | `Expositor[]` — 18 entries, `rubrosExpositores` union | `Expositores.astro`, `plano.ts` (by name) |
| `agenda.ts` | `AgendaTrack[]`, `AgendaItem[]` — 4 days × sessions | `AgendaSection.astro` |
| `faq.ts` | `FaqItem[]` | `FaqSection.astro` |
| `plano.ts` | `PlanoZone[]` — 8 venue zones with marker `x`/`y` percentages and SVG rects | `PredioMap.astro` |
| `photos.ts` | `photos` record — Unsplash id, Spanish alt, aspect ratio | `Photo.astro` |

News posts are **not** here — they are Markdown in `src/content/noticias/`,
schema-validated by `src/content.config.ts`.

## Conventions

- **Typed first.** Every file exports an `interface` (or a `const ... as const`
  union) before its data. New fields go on the interface, and TypeScript strict
  mode will point at every incomplete record.
- **Closed unions for anything filterable.** `Expositor.rubro`,
  `productFilters`, `agendaTracks`, `RubroExpositor`. Adding a value means
  updating the union — a free-form string breaks the filter UI silently.
- **`as const` on arrays** that feed a derived type, e.g.
  `export type RubroExpositor = (typeof rubrosExpositores)[number]`.
- **Spanish for content, English for identifiers.** Field names and interfaces
  are English (`nombre`, `rubro`, `pabellon` are the exception — they were
  named in Spanish and are consistent within `expositores.ts`; match the file
  you are in). Prose values are Spanish (`es-AR`).
- **A file-top docblock** stating what the data is and where it came from. Every
  existing file has one. Keep the provenance claim honest.
- **Photography is referenced by key**, never by path:
  `<Photo photo={photos.regionPuna} />`. A photo with no local file in
  `public/images/photos/<id>.jpg` renders a broken image.

## Event facts — one source, and it is `site.ts`

```ts
export const event = {
  name: 'ExpoJuy', year: '2026', edition: '17°',
  datesShort: '9 — 12', datesLong: 'OCTUBRE 2026',
  venue: 'CIUDAD CULTURAL', city: 'SAN SALVADOR DE JUJUY',
  tagline: 'Conectando países, creando oportunidades.',
} as const;
```

Dates and venue were corrected in commit `8c130d9`. **Several places still carry
the old values** and are known to be stale:

- The root `README.md` and `frontend/README.md` say "17 al 20 de septiembre" and
  "Predio Ferial Jujuy".
- `plano.ts`'s docblock still says "Predio Ferial Jujuy".
- Page `<title>`/`description` strings and the JSON-LD dates in
  `BaseLayout.astro` are hand-written copies of these facts, not derived from
  `event`.

So: if a task changes the date or the venue, **grep for the old value across the
whole repo**, do not just edit `site.ts`.

```bash
rg -n "octubre|OCTUBRE|Ciudad Cultural|CIUDAD CULTURAL|Predio Ferial|septiembre" src/ docs/ README.md
```

## Workflow for a data change

1. **Find the file and read its interface** before adding a record.
2. **Check for a duplicate** — exhibitors, agenda sessions and FAQ entries are
   easy to add twice:
   ```bash
   rg -n "id: '" src/data/expositores.ts
   rg -n "question:" src/data/faq.ts
   ```
3. **Add the record complete.** TypeScript strict will reject a missing required
   field; do not make a field optional just to get past it.
4. **Check downstream coupling.** Adding an `Expositor` with a new `rubro`
   requires that value to exist in `rubrosExpositores`, or the filter chip never
   appears. Adding a zone to `plano.ts` requires matching `x`/`y` and `svg`
   coordinates that fall inside the map viewBox in `PredioMap.astro`.
5. **Adding a photo** means three steps, in order: put the `.jpg` in
   `public/images/photos/`, add the entry to `photos.ts` with real Spanish alt
   text and the true aspect ratio, then reference it by key.
6. **Adding a news post** means a Markdown file in `src/content/noticias/` whose
   frontmatter satisfies `src/content.config.ts`: `title`, `date`, `description`
   required; `image`, `category` optional. The filename becomes the slug and the
   route is generated automatically.
7. Run `npm run check`, `npm run build`, `npm test`. A new route from a news post
   should also be added to the `routes` array in `tests/pages.spec.ts`.

## Do Not

- **Do not invent** a company, a speaker, a price, a time, an address, a phone
  number or a sponsor. Use a `TODO(...)` comment instead and flag it.
- **Do not change `event` dates or venue** without grepping the whole repo for
  the previous values — they are duplicated in page copy, JSON-LD and docs.
- **Do not widen a closed union to `string`** to make a record fit. Add the value
  to the union.
- **Do not add a photo entry** without the corresponding file in
  `public/images/photos/`.
- **Do not write empty or generic alt text.** `alt=""` is only for genuinely
  decorative images, and it must be deliberate.
- **Do not move content out of `src/data/` into a component.** Components read
  data; they do not hold it.
- **Do not add a remote image URL.** All assets are local by contest requirement.
