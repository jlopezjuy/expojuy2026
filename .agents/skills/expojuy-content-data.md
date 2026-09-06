# expojuy-content-data

## Purpose

Change what the ExpoJuy site says — exhibitors, agenda, FAQ, venue zones,
photography, news posts, navigation, footer — without fabricating information
and without breaking the typed couplings between data and UI.

## When to Use

- Adding, editing or removing an exhibitor, agenda session, FAQ entry, venue
  zone, sponsor, nav item or news post.
- Adding a photograph.
- Changing event facts (dates, venue, edition).

Also read `src/data/AGENTS.md` — it holds the per-file rules.

## Preconditions

**This is the highest-risk directory in the repository.** The site is official
communication for a provincial government event. Fabricated company names,
session times or prices would be published as fact.

Before writing anything:

1. **Confirm you have a real source** for the data. If the task does not provide
   one and the repo does not contain one, you do not have it.
2. **Check for a duplicate.**
   ```bash
   rg -n "id: '" src/data/expositores.ts
   rg -n "question:" src/data/faq.ts
   rg -n "id: '" src/data/agenda.ts src/data/plano.ts
   fd . src/content/noticias --type f
   ```
3. **Read the file's interface** before adding a record.

The project's convention for a missing fact is an explicit TODO, and it is used
in the real code (`site.ts:120-122`, `site.ts:140-142`, `site.ts:169-170`):

```ts
 * TODO(Sprint 5.2): logos reales de los otros sponsors pendientes de
 * confirmación de la organización. Mantener wordmarks de texto para ellos,
 * no inventar el set.
```

## Repository Context

| File | Shape | Rendered by |
| --- | --- | --- |
| `src/data/site.ts` | `event`, `nav`, `pillars`, `regions`, `productFilters`, `products`, `agendaDays`, `sponsors`, `footerColumns`, `socials`, `legalLinks` | `Header`, `Footer`, `Hero`, `LaExpo`, `Territorios`, `Emprendimientos`, `Sponsors`, `BaseLayout` |
| `src/data/expositores.ts` | `Expositor[]` (18), `rubrosExpositores` | `Expositores.astro` |
| `src/data/agenda.ts` | `AgendaTrack[]`, `AgendaItem[]` | `AgendaSection.astro` |
| `src/data/faq.ts` | `FaqItem[]` | `FaqSection.astro` |
| `src/data/plano.ts` | `PlanoZone[]` (8) | `PredioMap.astro` |
| `src/data/photos.ts` | `photos` record | `Photo.astro` |
| `src/content/noticias/*.md` | frontmatter per `src/content.config.ts` | `noticias/index.astro`, `noticias/[slug].astro` |

## Workflow

### Adding an exhibitor

```ts
{
  id: 'kebab-case-unique',
  nombre: 'Razón social real',
  rubro: 'Agroindustria',        // MUST be a member of rubrosExpositores
  pabellon: 'Pabellón …',
  stand: 'X-00',
  descripcion: '…',
  contacto: 'www.…',
}
```

`rubro` is a closed union. A new sector means adding it to `rubrosExpositores`
**and** to the `Expositor['rubro']` union — otherwise the filter chip never
renders and TypeScript fails the build.

If the exhibitor belongs in a venue zone, add its `nombre` to that zone's
`expositores` array in `plano.ts`. The link is by string; a typo silently
de-links them.

### Adding an agenda session

`AgendaItem` requires `id`, `day`, `month`, `trackId`, `time`, `title`,
`location`, `note`; `speaker` is optional. `trackId` must exist in
`agendaTracks`, and `day`/`month` must match an entry in `agendaDays`
(`site.ts`) or the day filter will not show it.

### Adding a venue zone

`PlanoZone` needs both coordinate systems and they are independent:

- `x` / `y` — percentages (0-100) positioning the interactive marker.
- `svg: { x, y, width, height, color }` — the vector rectangle, in the SVG
  viewBox coordinate space defined in `PredioMap.astro`.

Read that component before choosing numbers; values outside the viewBox render
off-canvas with no error. `color` uses a CSS variable
(`'var(--color-teal)'`), not a hex.

### Adding a photograph

Three steps, in order:

1. Put the file at `public/images/photos/<id>.jpg`. `Photo.astro` builds the path
   as `/images/photos/${photo.id}.jpg` — an entry without a file is a broken
   image, and the Playwright suite fails on `naturalWidth === 0`.
2. Add the entry to `photos.ts` with **real Spanish alt text** and the true
   aspect ratio:
   ```ts
   nuevaFoto: p('<id>', 'Descripción real de lo que se ve en la imagen', 3 / 2),
   ```
3. Reference it by key: `<Photo photo={photos.nuevaFoto} sizes="…" />`.

`alt=""` is only for genuinely decorative images and must be deliberate.
`scripts/download-assets.mjs` is the existing fetch script if the source is
Unsplash.

### Adding a news post

Create `src/content/noticias/<slug>.md`:

```md
---
title: 'Título del artículo'
date: 2026-03-14
description: 'Una frase de resumen.'
category: 'Institucional'
---

Cuerpo en Markdown.
```

`title`, `date` and `description` are required by `src/content.config.ts`;
`image` and `category` are optional. The filename becomes the slug and
`/noticias/<slug>` is generated automatically — no page file needed.

Then add the route to the `routes` array in `tests/pages.spec.ts:63` if it should
be covered (one representative post already is).

### Changing event facts

`event` in `site.ts` is the nominal source of truth, but **the dates and venue
are duplicated by hand** in page `<title>`/`description` strings, the JSON-LD in
`BaseLayout.astro:30-31`, `agendaDays`, `faq.ts` answers and several docblocks.
They are not derived.

So a date or venue change means a repo-wide sweep:

```bash
rg -n "octubre|OCTUBRE|Ciudad Cultural|CIUDAD CULTURAL|Predio Ferial|septiembre|2026-10|2026-09" src/ docs/ README.md
```

Known stale copies today: root `README.md`, `frontend/README.md`, and the
docblock at the top of `src/data/plano.ts`.

## Validation

```bash
npm run check     # strict TypeScript catches missing/misspelled fields
npm run build     # new news posts must appear as routes
npm test          # image-loads-with-alt-text and axe tests cover new content
```

Then look at the affected page in `npm run dev` at all three viewports. New list
items commonly break `rail` layouts or push a grid into horizontal overflow.

## Common Mistakes

- **Inventing data.** A plausible-looking company, price or session time is worse
  than a TODO, because nobody will catch it.
- Adding an `Expositor` with a `rubro` not present in `rubrosExpositores`.
- Adding an agenda item whose `trackId` or `day` does not match its filter source.
- Adding a `photos.ts` entry with no file in `public/images/photos/`.
- Empty or lazy alt text (`alt="imagen"`, `alt="foto"`).
- Widening a closed union to `string` to make a record compile.
- Editing `event` dates without sweeping the rest of the repository.
- Adding a nav entry that points at a route that does not exist — use
  `placeholder: true`, which `Header` filters out.
- Putting content literals in a component instead of `src/data/`.
- Adding a remote image URL. Everything is local by contest requirement.

## Completion Criteria

- Every added fact is traceable to a real source, or carries an explicit
  `TODO(...)` and is flagged in the report.
- `npm run check` clean; `npm run build` succeeds and lists any new route.
- `npm test` shows no new failures (baseline 210 pass / 3 fail).
- Closed unions, filter sources and cross-file string links were all updated
  together.
- New images load and carry meaningful Spanish alt text.
- The affected pages were checked at 1440, 1024 and 390 px for overflow.
