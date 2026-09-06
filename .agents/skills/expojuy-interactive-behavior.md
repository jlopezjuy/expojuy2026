# expojuy-interactive-behavior

## Purpose

Add or change client-side behaviour — filters, toggles, maps, forms, scroll
effects, animations — inside `src/scripts/enhance.ts`, respecting the
progressive-enhancement contract, the reduced-motion contract and the string
coupling between the script and the markup.

## When to Use

- Anything that needs to respond to a click, scroll, input or intersection.
- Any animation beyond a CSS keyframe or the `.reveal` utility.
- Adding a filter, tab strip, accordion, map interaction or form behaviour.
- Debugging why an element is stuck invisible or a filter shows the wrong cards.

This is the **second** of three tiers. Try CSS first. Escalate to a Preact island
only if reactive state must survive across the page.

## Preconditions

1. **Read the existing implementation of whatever is closest.** `enhance.ts` has
   13 `init*` functions and one of them almost certainly already solves your
   problem:

   ```bash
   rg -n "^function init|^async function|^function load|^function timeout" src/scripts/enhance.ts
   ```

   | Function | Solves |
   | --- | --- |
   | `initReveals` | scroll-triggered entrance via `IntersectionObserver` |
   | `initHeader` | `data-stuck` on scroll |
   | `initMobileNav` | disclosure panel with staggered rows |
   | `initFilters` | product filter tabs |
   | `initAgendaFilter` | two-axis filter (day + track) |
   | `initVenueMap` | SVG zone selection + info panel |
   | `initAccordion` | animated `<details>` |
   | `initExpositoresFilter` | search box + chip filter + empty state |
   | `initContactForm` / `initEntradasForm` / `initNewsletterForm` | form UX (client-side only) |
   | `initParallax` | depth parallax |
   | `initSmoothScroll` | Lenis + anchor scrolling |

2. **Read the shared helpers** at `enhance.ts:131-214` — `loadMotion`,
   `timeout`, `transitionFilterItems`. Every filter in the site goes through
   `transitionFilterItems`; do not write a fourth one.

3. **Find the markup hooks.** `src/components/AGENTS.md` lists every `id` and
   `data-*` the script reads.

## Repository Context

| File | Role |
| --- | --- |
| `src/scripts/enhance.ts` | the entire behaviour layer, one bundle |
| `src/layouts/BaseLayout.astro` | loads it (`<script>import '../scripts/enhance';</script>`) and adds `.js` to `<html>` before first paint |
| `src/styles/global.css` | `@utility reveal`, `@utility rail`, `hero-animate-*`, and the global `prefers-reduced-motion` block |

Module-level, defined once at `enhance.ts:11`:

```ts
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
```

Use it. Do not call `matchMedia` again per function.

## The four invariants

Every behaviour in this file honours all four. Breaking one is a regression even
if nothing visibly fails.

### 1. The page works without JavaScript

`html:not(.js) .reveal` keeps content visible when the script never runs. Any new
behaviour must degrade to *readable and navigable*, never to *blank*. Content
must be in the HTML; the script only enhances it.

### 2. Reduced motion is a hard branch, not a slower animation

```ts
const motionReady = loadMotion();   // returns null when reduceMotion.matches
```

`loadMotion` (`enhance.ts:151`) is:

```ts
function loadMotion(): Promise<MotionModule | null> | null {
  return reduceMotion.matches ? null : import('motion/mini').catch(() => null);
}
```

Two things at once: it never loads the chunk under reduced motion, and it
swallows a load failure. Both branches must still reach the correct end state.

### 3. Correctness never depends on the animation completing

This is the invariant the code comments call out explicitly. Every animated
state change races the animation against a timeout and applies the final state
either way:

```ts
const played = animate(target, { opacity: 0, transform: 'translateY(6px)' }, { duration: 0.16 });
void Promise.race([played, timeout(400)]).then(() => {
  toggle.hidden = true;   // happens whether or not the animation finished
});
```

A backgrounded tab, a fast second click, or a failed chunk must not leave an
element visible-but-transparent or hidden-but-expected. Copy this pattern.

### 4. Every lookup is defensive

`enhance.ts` runs on all 15 pages. Every function starts by bailing out when its
elements are not present:

```ts
function initThing(): void {
  const root = document.getElementById('thing-root');
  if (!root) return;
  …
}
```

## Workflow

### 1. Markup hooks

Add `id` for singletons and `data-*` for collections, in the `.astro` component:

```astro
<button type="button" data-thing-filter="alimentos" aria-pressed="false">ALIMENTOS</button>
<div id="thing-grid">
  <article data-thing-card data-category="alimentos" class="reveal">…</article>
</div>
```

Keep the naming consistent with what exists (`data-rubro-filter`,
`data-expositor-card`, `data-zone`).

### 2. The init function

```ts
/* ------------------------------------------------------------- thing filter */
function initThing(): void {
  const grid = document.getElementById('thing-grid');
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-thing-filter]');
  if (!grid || !buttons.length) return;

  const motionReady = loadMotion();

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.getAttribute('data-thing-filter');

      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));

      const cards = [...grid.querySelectorAll<HTMLElement>('[data-thing-card]')];
      const entering = cards.filter((c) => value === 'todos' || c.dataset.category === value)
                            .map((c) => ({ toggle: c, target: c }));
      const leaving  = cards.filter((c) => !entering.some((e) => e.toggle === c))
                            .map((c) => ({ toggle: c, target: c }));

      void transitionFilterItems(entering, leaving, motionReady);
    });
  });
}
```

`FilterEntry` has two fields because sometimes the element removed from layout
is not the element carrying `.reveal` — product cards nest it one level in. If
they are the same element, pass it twice.

### 3. Register it in `boot()`

`enhance.ts:916`. The function is dead code until it is called there. `boot` runs
on `DOMContentLoaded`, or immediately if the document is already parsed.

### 4. Animating with `motion/mini`

```ts
const { animate } = motion;
animate(el, { opacity: [0, 1], transform: ['translateY(6px)', 'translateY(0px)'] },
        { duration: 0.3, ease: [0.16, 1, 0.3, 1] });
```

**`motion/mini` maps keys straight to CSS/SVG attributes.** `x` and `y` are SVG
geometry attributes there, not transform shorthands — on an HTML element they do
nothing. Write `transform: 'translateY(6px)'` in full. This is documented at
`enhance.ts:182-184` because it has already bitten someone.

The project easing is `[0.16, 1, 0.3, 1]`, matching `--ease-out-expo` in
`global.css`. Use it.

### 5. Prefer CSS when you can

If the effect is a one-shot entrance with no state, add a `@keyframes` + `@utility`
pair in `global.css` (the `hero-animate-*` set is the model) and put the class in
the markup. No JavaScript, no chunk, works under reduced motion via the existing
global block.

### 6. Accessibility

- Filter buttons: keep `aria-pressed` in sync.
- Disclosure: `aria-expanded` + `aria-controls`, and manage `hidden`/`inert`.
- Escape closes the mobile nav (`initMobileNav`); match that for any overlay.
- Live regions: status text uses `role="alert"` and toggling `.hidden`.
- Never remove focus outlines.

### 7. Forms

`initContactForm`, `initEntradasForm` and `initNewsletterForm` **do not submit
anywhere.** They `preventDefault`, show a success message via `setTimeout` and
reset. The contact form has a honeypot (`input[name="website"]`).

If a task asks to make a form actually submit, that is an API integration — see
`.agents/skills/expojuy-api-integration.md` — and it needs a backend endpoint
that does not exist today. Say so rather than making the simulation look real.

## Validation

```bash
npm run check
npm run build
npm test          # baseline 210 pass / 3 fail
npm run dev       # then exercise the behaviour by hand
```

Manual checks that the suite does not fully cover:

1. **Reduced motion** — enable it at OS level (or emulate
   `prefers-reduced-motion: reduce`), reload, confirm the end state is correct
   with no animation.
2. **No JavaScript** — disable JS, reload, confirm content is visible and the
   page is navigable.
3. **Fast repeated interaction** — click a filter chip five times quickly and
   confirm no card is left invisible.
4. All three viewports: 1440, 1024, 390.

## Common Mistakes

- Writing a new filter transition instead of using `transitionFilterItems`.
- Applying the final state only inside the animation callback, so a failed or
  interrupted animation leaves the DOM wrong.
- Using `x` / `y` keys with `motion/mini` on an HTML element — silently inert.
- Importing `motion` statically, putting it in the critical bundle.
- A dynamic import with no `.catch()`.
- Forgetting to register the function in `boot()`.
- No early return, so the function throws on the 14 pages that lack its elements.
- Toggling `display` on a `.reveal` element without driving opacity explicitly —
  `IntersectionObserver` never fires for a `display:none` element, so it stays at
  `opacity: 0` forever. This is the exact bug `transitionFilterItems` exists to
  prevent (see its docblock at `enhance.ts:132-143`).
- Renaming an `id` or `data-*` in the markup without grepping `enhance.ts`.
- Making a simulated form look like it submits.

## Completion Criteria

- `npm run check`, `npm run build` and `npm test` all run, with no new failures.
- The behaviour is registered in `boot()` and returns early when its elements are
  absent.
- Verified under reduced motion **and** with JavaScript disabled.
- Every animated state change applies its end state independently of the
  animation.
- ARIA state stays in sync; focus is never trapped or hidden.
- Verified at all three viewports.
