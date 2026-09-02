/**
 * Progressive enhancement for the ExpoJuy homepage.
 *
 * Everything here is optional: the page is fully readable and navigable with
 * JavaScript disabled. Four concerns, all cheap and dependency-free:
 *   1. scroll reveals            5. header background on scroll
 *   2. product filter tabs       3. mobile navigation
 *   4. hero / banner parallax    (skipped under prefers-reduced-motion)
 */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------------------------------------------------------------- reveals */
function initReveals(): void {
  const targets = document.querySelectorAll<HTMLElement>('.reveal');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  );

  targets.forEach((el) => observer.observe(el));
}

/* ----------------------------------------------------------------- header */
function initHeader(): void {
  const header = document.getElementById('site-header');
  if (!header) return;

  const sync = () => {
    if (window.scrollY > 40) header.setAttribute('data-stuck', '');
    else header.removeAttribute('data-stuck');
  };

  sync();
  window.addEventListener('scroll', sync, { passive: true });
}

/* ------------------------------------------------------------- mobile nav */
function initMobileNav(): void {
  const toggle = document.getElementById('nav-toggle');
  const panel = document.getElementById('mobile-nav');
  if (!toggle || !panel) return;

  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    toggle.querySelector('.sr-only')!.textContent = open ? 'Cerrar menú' : 'Abrir menú';
    document.documentElement.style.overflow = open ? 'hidden' : '';
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  panel.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      (toggle as HTMLButtonElement).focus();
    }
  });

  // The panel is desktop-hidden by CSS; make sure state resets on resize.
  window.matchMedia('(min-width: 80rem)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}

/* ---------------------------------------------------------- filter tabs */
function initFilters(): void {
  const group = document.getElementById('product-filters');
  const grid = document.getElementById('product-grid');
  const status = document.getElementById('product-count');
  if (!group || !grid) return;

  const buttons = Array.from(group.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  const items = Array.from(grid.querySelectorAll<HTMLElement>(':scope > [data-category]'));

  const apply = (filter: string) => {
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    }

    let shown = 0;
    for (const item of items) {
      const match = filter === 'todos' || item.dataset.category === filter;
      item.hidden = !match;
      if (match) shown += 1;
    }

    if (status) {
      status.textContent = `${shown} ${shown === 1 ? 'emprendimiento' : 'emprendimientos'} en pantalla.`;
    }
  };

  group.addEventListener('click', (e) => {
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-filter]');
    if (button?.dataset.filter) apply(button.dataset.filter);
  });
}

/* --------------------------------------------------------- agenda filter */
/**
 * Combiña dos grupos de filtro (día + jornada) sobre la grilla de la agenda
 * (`#agenda-grid`). Es un filtro independiente del de productos: `initFilters()`
 * queda intacto para no arriesgar su prueba. Sin JS la lista completa es visible.
 */
function initAgendaFilter(): void {
  const dayGroup = document.getElementById('agenda-days');
  const trackGroup = document.getElementById('agenda-tracks');
  const grid = document.getElementById('agenda-grid');
  const status = document.getElementById('agenda-count');
  if (!dayGroup || !trackGroup || !grid) return;

  const dayButtons = Array.from(dayGroup.querySelectorAll<HTMLButtonElement>('[data-day]'));
  const trackButtons = Array.from(trackGroup.querySelectorAll<HTMLButtonElement>('[data-track]'));
  const items = Array.from(grid.querySelectorAll<HTMLElement>(':scope > [data-day]'));

  let dayFilter = 'todos';
  let trackFilter = 'todos';

  const apply = () => {
    for (const button of dayButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.day === dayFilter));
    }
    for (const button of trackButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.track === trackFilter));
    }

    let shown = 0;
    for (const item of items) {
      const matchDay = dayFilter === 'todos' || item.dataset.day === dayFilter;
      const matchTrack = trackFilter === 'todos' || item.dataset.track === trackFilter;
      const match = matchDay && matchTrack;
      item.hidden = !match;
      if (match) shown += 1;
    }

    if (status) {
      status.textContent = `${shown} ${shown === 1 ? 'actividad' : 'actividades'} en pantalla.`;
    }
  };

  dayGroup.addEventListener('click', (e) => {
    const day = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-day]')?.dataset.day;
    if (day) {
      dayFilter = day;
      apply();
    }
  });

  trackGroup.addEventListener('click', (e) => {
    const track = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-track]')?.dataset.track;
    if (track) {
      trackFilter = track;
      apply();
    }
  });
}

/* ------------------------------------------------------------ venue map */
/**
 * Mapa interactivo del predio (`PredioMap.astro`). Los botones `[data-zone]`
 * actualizan `aria-pressed`/`aria-current` y el live region `#plano-info`.
 * Ausentes en la página → early return, sin errores. Sin JS la lista de zonas
 * queda visible igualmente.
 */
function initVenueMap(): void {
  const wrapper = document.querySelector<HTMLElement>('[data-venue-map]');
  const info = document.getElementById('plano-info');
  if (!wrapper || !info) return;

  const buttons = Array.from(wrapper.querySelectorAll<HTMLButtonElement>('[data-zone]'));
  if (!buttons.length) return;

  const select = (button: HTMLButtonElement) => {
    for (const b of buttons) {
      const active = b === button;
      b.setAttribute('aria-pressed', String(active));
      if (active) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    }
    const name = button.getAttribute('data-zone-name') ?? '';
    const note = button.getAttribute('data-zone-note') ?? '';
    info.textContent = name ? `${name}: ${note}` : '';
  };

  wrapper.addEventListener('click', (e) => {
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-zone]');
    if (button) select(button);
  });
}

/* --------------------------------------------------------------- accordion */
/**
 * FAQ disclosure. Markup is native <details>/<summary> so the accordion works
 * without JS; this routine only keeps the aria-expanded state in sync with the
 * open attribute for assistive tech. It is also a progressive enhancement for
 * any `<details data-accordion>` element, not just the FAQ.
 */
function initAccordion(): void {
  const items = document.querySelectorAll<HTMLDetailsElement>('[data-accordion]');
  if (!items.length) return;

  const sync = (item: HTMLDetailsElement) => {
    const toggle = item.querySelector<HTMLElement>('[data-accordion-toggle]');
    if (toggle) toggle.setAttribute('aria-expanded', String(item.open));
  };

  items.forEach((item) => {
    sync(item);
    item.addEventListener('toggle', () => sync(item));
  });
}

/* ---------------------------------------------------------------- parallax */
function initParallax(): void {
  if (reduceMotion.matches) return;

  const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  const collage = Array.from(document.querySelectorAll<HTMLElement>('[data-collage-item]'));
  if (!layers.length && !collage.length) return;

  let ticking = false;

  const frame = () => {
    ticking = false;
    const viewportH = window.innerHeight;

    // `translate` (not `transform`) so Tailwind's scale/hover transforms survive.
    const shift = (el: HTMLElement, amplitude: number) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > viewportH + 200) return;
      const depth = Number(el.dataset.depth ?? 0.1);
      // progress: ~-0.5 entering from below .. ~0.5 leaving at the top.
      const progress = (viewportH / 2 - (rect.top + rect.height / 2)) / viewportH;
      el.style.translate = `0 ${(progress * depth * amplitude).toFixed(2)}px`;
    };

    for (const layer of layers) shift(layer, 130);
    for (const item of collage) shift(item, 150);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(frame);
  };

  frame();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}

/* -------------------------------------------------------------------- boot */
function boot(): void {
  initReveals();
  initHeader();
  initMobileNav();
  initFilters();
  initAgendaFilter();
  initVenueMap();
  initAccordion();
  initParallax();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
