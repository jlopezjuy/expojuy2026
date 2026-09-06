# expojuy-component

## Purpose

Create or extend a component in a way that reuses the existing design system
instead of growing a parallel one. This repository has 29 components, every one
in use, and a token set that already covers most needs — the failure mode here is
duplication, not scarcity.

## When to Use

- Any task that would add a file under `src/components/`.
- Any task that would add a Tailwind class with an arbitrary value.
- Before adding a Preact island.

Also read `src/components/AGENTS.md` — it holds the full inventory and the
`enhance.ts` attribute contract.

## Preconditions — discovery is mandatory

Run all four before writing anything. Paste what you found into your reasoning.

```bash
# 1. What components exist?
fd . src/components --type f

# 2. What do the primitives already accept?
rg -n "interface Props" -A 14 src/components/ui src/components/layout

# 3. What design tokens exist?
rg -n "@theme" -A 70 src/styles/global.css

# 4. What custom utilities exist?
rg -n "@utility" src/styles/global.css
```

Then answer, explicitly: *is there a component that already does ~80% of this?*
If yes, extend it. A fifth `ButtonLink` variant beats a second button component.

## Repository Context

Reach for these before creating anything:

| Need | Existing component |
| --- | --- |
| Page gutter + max width | `layout/Container.astro` (`wide` / `normal`) |
| Eyebrow + accented display heading | `ui/SectionHeading.astro` |
| Link styled as a button | `ui/ButtonLink.astro` (`pill`/`outline`/`ghost`/`solid`) |
| An icon | `ui/Icon.astro` — 13 names, add a name here |
| A photograph | `ui/Photo.astro` + `src/data/photos.ts` |
| A repeated list item | `cards/FeatureCard`, `cards/ProductCard`, `cards/RegionCard` |
| A page-sized block | `sections/` |

Placement rules:

```text
ui/         small reusable atom, no data dependency
layout/     structural wrapper
cards/      repeated item inside a list or rail
sections/   page-sized block, takes headingLevel
navigation/ Header / Footer only
hero/       home hero only
islands/    LAST RESORT — Preact, ships JS to every visitor
```

## Workflow

### 1. Prefer extending

Adding a variant to `ButtonLink`:

```ts
const variants = {
  pill: '…',
  outline: '…',
  ghost: '…',
  solid: '…',
  <new>: '…',   // must include its own focus-visible ring for its surface
} as const;
```

Every variant defines a `focus-visible:ring-*` anchored to the surface it sits
on — that is deliberate (see the comment at `ButtonLink.astro:20-25`). A new
variant without one is an accessibility regression.

### 2. Component skeleton

```astro
---
/**
 * One line on what this is and where it appears.
 */
interface Props {
  title: string;
  tone?: 'light' | 'dark';
  class?: string;
}

const { title, tone = 'dark', class: className = '' }: Props = Astro.props;

const tones = { light: 'text-white', dark: 'text-night' } as const;
---

<div class={`… ${tones[tone]} ${className}`}>
  <slot />
</div>
```

House conventions, all observable in the existing files:

- Typed `interface Props`, defaults destructured in one statement.
- `class?: string` passthrough, appended **last** so callers can adjust spacing.
- Variant maps as `const … as const`, not ternary chains.
- `<slot />` for composition rather than a `children` prop.
- Comments explain *why*, not *what*.

### 3. Styling — tokens only

Use the utilities generated from `@theme` in `src/styles/global.css`:

`bg-night` `bg-cream` `bg-cream-deep` `text-ink` `text-magenta` `text-gold-bright`
`text-hero` `text-display` `text-title` `text-body` `px-gutter` `rounded-card`
`font-display` `font-sans`

There is **no `tailwind.config.js`**. A new token means a new line inside the
`@theme` block, which then generates its utility everywhere. That is the right
move for anything used more than twice — an arbitrary value in a component is
not.

Contrast rule that is currently being violated in `main`: `teal` (`#64baba`) on
`cream` (`#f7efe1`) is ≈2:1 and fails WCAG AA. Reserve `teal` for `bg-night`
surfaces; use `magenta` or `night` on light ones.

### 4. Animation

Attach `.reveal` (optionally with `style="--reveal-delay: 80ms"`) for scroll
entrance. Do not hand-roll transitions — see
`.agents/skills/expojuy-interactive-behavior.md` before adding any JavaScript.

### 5. Accessibility

- `<section>` gets `aria-labelledby` pointing at its heading `id`.
- Interactive elements are real `<button>` / `<a>`, never a `div` with a click
  handler.
- Toggle state is exposed: `aria-pressed` on filters, `aria-expanded` +
  `aria-controls` on disclosure triggers.
- Icon-only controls carry an `.sr-only` label (see `Header.astro:65`).
- Never `outline: none`; `:focus-visible` is styled globally.

### 6. Islands — only if you cannot avoid it

A Preact island is justified only when reactive state must survive across the
page and cannot be expressed in CSS or imperative DOM code. The three that exist
(`LoginForm`, `AccountView`, `AuthNav`) all read `sessionSignal`.

If you do add one:

- `.tsx` under `src/components/islands/`, default export.
- `class=` not `className=` (Preact in this project uses `class`, matching the
  existing files).
- Pick the hydration directive deliberately: `client:load` for immediately
  interactive UI, `client:only="preact"` when server rendering would emit the
  wrong markup (browser-only state).
- Import shared session state from `src/lib/auth/session.ts` — do not create a
  second store.

## Validation

```bash
npm run check     # 0 errors, 0 warnings
npm run build
npm test          # baseline 210 pass / 3 fail
```

If you changed a shared component, find every caller first and check them all:

```bash
rg -n "<ComponentName" src/
```

Then look at it at 1440, 1024 and 390 px.

## Common Mistakes

- Creating a component without running the inventory search.
- Re-implementing `Container`'s `mx-auto max-w-* px-*` inline.
- Inlining an SVG instead of adding a `name` to `Icon.astro`.
- `<img src="/images/photos/…">` instead of `<Photo>`, losing alt text and
  dimensions.
- Arbitrary Tailwind values (`text-[#d62a79]`, `max-w-[73rem]`) where a token
  exists.
- `accentColor="teal"` on a light surface.
- A new `ButtonLink` variant without a `focus-visible` ring.
- Dropping the `class` passthrough, forcing callers into wrapper `div`s.
- Reaching for an island when `enhance.ts` would do.
- Renaming an `id`/`data-*` attribute without grepping `src/scripts/enhance.ts`.

## Completion Criteria

- Discovery was actually run and the reuse decision is stated.
- `npm run check` clean, `npm run build` succeeds, `npm test` shows no new
  failures.
- Only design tokens and existing utilities were used, or a new token was added
  to `@theme` with a reason.
- Accessibility: labelled section, real interactive elements, exposed state,
  visible focus, ≥4.5:1 contrast.
- Verified at all three viewports.
- If a shared component changed, every call site was checked and listed.
