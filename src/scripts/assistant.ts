/**
 * Comportamiento del asistente de visita.
 *
 * `enhance.ts` importa este módulo dinámicamente la primera vez que el
 * visitante toca el botón flotante, igual que hace con `motion` y `lenis`. Ni
 * Orama ni el índice entran en el bundle inicial de ninguna página.
 *
 * Todo el DOM de los resultados se construye con `createElement` y
 * `textContent`. Nada pasa por `innerHTML`: el contenido sale de nuestro propio
 * índice, pero la consulta la escribe el visitante y la regla no admite
 * excepciones cómodas.
 */

import { docTypeLabels, type ExpoDocType, type ExpoDocument, type SearchIndexPayload } from '../lib/search/types';
import type { ExpoSearchEngine, ExpoSearchResult } from '../lib/search/engine';

const INDEX_URL = '/search-index.json';
const DEBOUNCE_MS = 140;
const MAX_RESULTS = 12;

type Refs = {
  root: HTMLElement;
  openButton: HTMLButtonElement;
  closeButton: HTMLButtonElement;
  overlay: HTMLElement;
  panel: HTMLElement;
  form: HTMLFormElement;
  input: HTMLInputElement;
  suggestions: HTMLElement;
  resultsSection: HTMLElement;
  results: HTMLElement;
  count: HTMLElement;
  context: HTMLElement;
  notice: HTMLElement;
  empty: HTMLElement;
  error: HTMLElement;
};

function collectRefs(root: HTMLElement): Refs | null {
  const q = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector);

  const refs = {
    root,
    openButton: q<HTMLButtonElement>('[data-assistant-open]'),
    closeButton: q<HTMLButtonElement>('[data-assistant-close]'),
    overlay: q('[data-assistant-overlay]'),
    panel: q('[data-assistant-panel]'),
    form: q<HTMLFormElement>('[data-assistant-form]'),
    input: q<HTMLInputElement>('[data-assistant-input]'),
    suggestions: q('[data-assistant-suggestions]'),
    resultsSection: q('[data-assistant-results-section]'),
    results: q('[data-assistant-results]'),
    count: q('[data-assistant-count]'),
    context: q('[data-assistant-context]'),
    notice: q('[data-assistant-notice]'),
    empty: q('[data-assistant-empty]'),
    error: q('[data-assistant-error]'),
  };

  return Object.values(refs).every(Boolean) ? (refs as Refs) : null;
}

/* ------------------------------------------------------------------ métricas */

/**
 * Medición local y anónima. No sale nada a la red desde acá: se guarda un
 * contador por consulta normalizada en `localStorage` y se emite un evento del
 * DOM para que la organización pueda enchufar su propia analítica sin tocar
 * este archivo. Sin identificadores, sin perfiles, sin texto libre asociado a
 * una persona.
 */
const STATS_KEY = 'expojuy_assistant_stats';

interface AssistantStats {
  queries: Record<string, number>;
  zeroResults: Record<string, number>;
  types: Record<string, number>;
}

function readStats(): AssistantStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw) as AssistantStats;
  } catch {
    /* modo privado o storage lleno: la métrica es opcional, la búsqueda no. */
  }
  return { queries: {}, zeroResults: {}, types: {} };
}

function track(query: string, resultCount: number, topType: ExpoDocType | undefined): void {
  const detail = { query, resultCount, topType };
  document.dispatchEvent(new CustomEvent('expojuy:assistant-search', { detail }));

  try {
    const stats = readStats();
    stats.queries[query] = (stats.queries[query] ?? 0) + 1;
    if (resultCount === 0) stats.zeroResults[query] = (stats.zeroResults[query] ?? 0) + 1;
    if (topType) stats.types[topType] = (stats.types[topType] ?? 0) + 1;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    /* ídem */
  }
}

/* ------------------------------------------------------------------- render */

/**
 * Fila de resultado — listado editorial, no tarjeta.
 *
 * Una tarjeta con borde y fondo dentro de un modal oscuro es una caja dentro
 * de otra caja: duplica el marco y aplana la jerarquía, que era exactamente el
 * problema de la versión anterior. Acá la separación la da un hairline y la
 * jerarquía la da la escala tipográfica.
 */
function renderRow(result: ExpoSearchResult): HTMLLIElement {
  const doc = result.document;
  const li = document.createElement('li');
  li.className = 'assistant-row';

  const kickerLine = document.createElement('div');
  kickerLine.className = 'flex flex-wrap items-baseline gap-x-3 gap-y-1';

  const kicker = document.createElement('span');
  kicker.className = 'assistant-row-kicker';
  kicker.textContent = docTypeLabels[doc.type];
  kickerLine.append(kicker);

  if (doc.stand) {
    const stand = document.createElement('span');
    stand.className = 'assistant-row-stand';
    stand.textContent = `Stand ${doc.stand}`;
    kickerLine.append(stand);
  }
  li.append(kickerLine);

  const title = document.createElement('h3');
  title.className = 'font-display mt-1.5 text-lg leading-snug font-semibold text-night';
  title.textContent = doc.title;
  li.append(title);

  // Subtítulo y zona comparten renglón, pero un servicio suele traer su propia
  // ubicación como subtítulo y ésta suele coincidir con el título: sin
  // deduplicar, "Patio Gastronómico" se leía tres veces en la misma tarjeta.
  const meta = Array.from(new Set([doc.subtitle, doc.zoneName]))
    .filter((value): value is string => Boolean(value) && value !== doc.title)
    .join(' · ');

  if (meta) {
    const metaLine = document.createElement('p');
    metaLine.className = 'mt-1 text-xs font-semibold tracking-wide text-night/55 uppercase';
    metaLine.textContent = meta;
    li.append(metaLine);
  }

  const body = document.createElement('p');
  body.className = 'mt-2.5 max-w-[52ch] text-body text-night/70';
  body.textContent = doc.body;
  li.append(body);

  if (doc.actions.length > 0) {
    const actions = document.createElement('div');
    actions.className = 'mt-3.5 flex flex-wrap gap-x-6 gap-y-2';
    for (const action of doc.actions) {
      const link = document.createElement('a');
      link.href = action.href;
      link.className = 'assistant-action';
      link.textContent = action.label;

      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      link.append(arrow);

      actions.append(link);
    }
    li.append(actions);
  }

  return li;
}

/* -------------------------------------------------------------------- motor */

/**
 * Respaldo sin Orama: filtro por substring sobre los mismos documentos. Se usa
 * si el chunk del motor no carga — en una feria la conectividad falla, y es
 * mejor una búsqueda pobre que un panel roto.
 */
function createFallbackEngine(documents: ExpoDocument[]): ExpoSearchEngine {
  return {
    size: documents.length,
    browse: (type, limit = 12) =>
      documents.filter((d) => d.type === type).slice(0, limit).map((document) => ({ document, score: 0 })),
    async search(rawQuery) {
      const needle = rawQuery.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
      const results = documents
        .filter((doc) =>
          `${doc.title} ${doc.subtitle ?? ''} ${doc.body} ${doc.keywords}`
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .includes(needle),
        )
        .map((document) => ({ document, score: 1 }));

      const facets: Partial<Record<ExpoDocType, number>> = {};
      for (const r of results) facets[r.document.type] = (facets[r.document.type] ?? 0) + 1;

      return { results, facets, intent: { term: needle, preferTypes: [] }, usedFallback: true };
    },
  };
}

/* ------------------------------------------------------------------ arranque */

export function mountAssistant(): void {
  const root = document.querySelector<HTMLElement>('[data-assistant]');
  if (!root) return;

  const collected = collectRefs(root);
  if (!collected) return;
  // Anotación explícita: las funciones declaradas más abajo se izan, y sin esto
  // TypeScript pierde el estrechamiento del guard dentro de sus closures.
  const refs: Refs = collected;

  let enginePromise: Promise<ExpoSearchEngine> | null = null;
  let lastFocused: HTMLElement | null = null;
  let debounce: number | undefined;

  /**
   * Indicador de actividad. Se busca aparte de `collectRefs` a propósito: es
   * decorativo, y su ausencia no debe impedir que el asistente monte.
   */
  const status = root.querySelector<HTMLElement>('[data-assistant-status]');

  function setBusy(busy: boolean): void {
    if (!status) return;
    if (busy) status.setAttribute('data-busy', '');
    else status.removeAttribute('data-busy');
  }

  async function loadEngine(): Promise<ExpoSearchEngine> {
    const response = await fetch(INDEX_URL);
    if (!response.ok) throw new Error(`index ${response.status}`);
    const payload = (await response.json()) as SearchIndexPayload;

    try {
      const { createSearchEngine } = await import('../lib/search/engine');
      return await createSearchEngine(payload.documents);
    } catch {
      return createFallbackEngine(payload.documents);
    }
  }

  function getEngine(): Promise<ExpoSearchEngine> {
    enginePromise ??= loadEngine();
    return enginePromise;
  }

  function show(element: HTMLElement, visible: boolean): void {
    element.hidden = !visible;
  }

  function setPanelOpen(open: boolean): void {
    refs.openButton.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';

    if (open) {
      lastFocused = document.activeElement as HTMLElement | null;
      show(refs.overlay, true);
      show(refs.panel, true);

      // Reflow forzado para que la transición tenga un estado inicial que
      // animar. Deliberadamente NO se usa requestAnimationFrame: en una pestaña
      // en segundo plano el navegador lo posterga, y el panel se quedaría
      // visible pero desplazado fuera de pantalla por su `transform` inicial.
      void refs.panel.offsetHeight;

      refs.overlay.setAttribute('data-open', '');
      refs.panel.setAttribute('data-open', '');
      refs.input.focus();

      void getEngine().catch(() => {
        show(refs.error, true);
      });
      return;
    }

    refs.overlay.removeAttribute('data-open');
    refs.panel.removeAttribute('data-open');
    window.setTimeout(() => {
      if (!refs.panel.hasAttribute('data-open')) {
        show(refs.overlay, false);
        show(refs.panel, false);
      }
    }, 320);
    lastFocused?.focus();
  }

  function resetToSuggestions(): void {
    show(refs.suggestions, true);
    show(refs.resultsSection, false);
    show(refs.empty, false);
    show(refs.notice, false);
    refs.results.replaceChildren();
  }

  async function runSearch(rawQuery: string): Promise<void> {
    const query = rawQuery.trim();
    if (!query) {
      setBusy(false);
      resetToSuggestions();
      return;
    }

    setBusy(true);

    let engine: ExpoSearchEngine;
    try {
      engine = await getEngine();
    } catch {
      setBusy(false);
      show(refs.error, true);
      show(refs.suggestions, false);
      return;
    }

    const response = await engine.search(query, { limit: MAX_RESULTS });
    const results = response.results.slice(0, MAX_RESULTS);
    setBusy(false);

    track(query.toLowerCase(), results.length, results[0]?.document.type);

    show(refs.suggestions, false);
    show(refs.error, false);
    show(refs.empty, results.length === 0);
    show(refs.resultsSection, results.length > 0);

    if (results.length === 0) {
      // El aviso pertenece a la búsqueda anterior; dejarlo visible sobre un
      // estado vacío es contradictorio.
      show(refs.notice, false);
      refs.results.replaceChildren();
      return;
    }

    refs.count.textContent =
      results.length === 1 ? '1 resultado' : `${results.length} resultados`;

    const context = response.intent.contextLabel;
    refs.context.textContent = context ?? '';
    show(refs.context, Boolean(context));

    // Aviso honesto: el visitante pidió "hoy" pero hoy no hay ExpoJuy.
    if (response.intent.outsideEvent) {
      refs.notice.textContent =
        'ExpoJuy 2026 es del 9 al 12 de octubre. Te muestro la jornada de apertura.';
      show(refs.notice, true);
    } else if (response.usedFallback) {
      refs.notice.textContent = 'No encontré esa palabra exacta. Te muestro lo más parecido.';
      show(refs.notice, true);
    } else {
      show(refs.notice, false);
    }

    refs.results.replaceChildren(...results.map(renderRow));
  }

  /* --------------------------------------------------------------- eventos */

  refs.openButton.addEventListener('click', () => setPanelOpen(true));
  refs.closeButton.addEventListener('click', () => setPanelOpen(false));
  refs.overlay.addEventListener('click', () => setPanelOpen(false));

  refs.form.addEventListener('submit', (event) => {
    event.preventDefault();
    window.clearTimeout(debounce);
    void runSearch(refs.input.value);
  });

  refs.input.addEventListener('input', () => {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(() => void runSearch(refs.input.value), DEBOUNCE_MS);
  });

  refs.suggestions.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-assistant-suggestion]');
    const query = button?.dataset.assistantSuggestion;
    if (!query) return;
    refs.input.value = query;
    void runSearch(query);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && refs.panel.hasAttribute('data-open')) setPanelOpen(false);
  });

  // Trampa de foco: el panel es `aria-modal`, así que el tabulador no debe
  // salirse a la página de atrás.
  refs.panel.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const focusables = refs.panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
    );
    const visible = Array.from(focusables).filter((el) => el.offsetParent !== null);
    if (visible.length === 0) return;

    const first = visible[0];
    const last = visible[visible.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}
