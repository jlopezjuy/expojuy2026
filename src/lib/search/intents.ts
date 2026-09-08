/**
 * Interpretación de intención — versión mínima deliberada.
 *
 * El índice de texto ya resuelve solo la mayor parte de las consultas: los
 * sinónimos horneados en `keywords` hacen que "comer" llegue al patio
 * gastronómico sin ninguna capa de intención. Agregar un clasificador para eso
 * sería sobreingeniería.
 *
 * Esta capa existe únicamente para las DOS cosas que la búsqueda textual no
 * puede hacer:
 *
 *   1. Filtrar por fecha/franja — "hoy", "el sábado", "esta tarde" son
 *      restricciones sobre `date`/`franja`, no términos que matchear.
 *   2. Priorizar un tipo — "qué empresas hay" debe rankear expositores antes
 *      que un FAQ que menciona la palabra "empresas".
 *
 * Cualquier otra consulta cae en búsqueda de texto plana, que es lo correcto.
 */

import { normalizeQuery } from './synonyms';
import type { ExpoDocType, Franja } from './types';

/** Jornadas reales del evento (`site.ts` / JSON-LD de `BaseLayout.astro`). */
export const EVENT_DAYS = [
  { day: '9', date: '2026-10-09', label: 'Viernes 9', weekday: 'viernes' },
  { day: '10', date: '2026-10-10', label: 'Sábado 10', weekday: 'sabado' },
  { day: '11', date: '2026-10-11', label: 'Domingo 11', weekday: 'domingo' },
  { day: '12', date: '2026-10-12', label: 'Lunes 12', weekday: 'lunes' },
] as const;

export interface QueryIntent {
  /** Consulta sin las palabras que ya consumió el filtro. Puede quedar vacía. */
  term: string;
  /** Tipos a priorizar. Vacío = sin preferencia. */
  preferTypes: ExpoDocType[];
  dateFilter?: string;
  franjaFilter?: Franja;
  /** Texto que la UI muestra como chip de contexto ("Sábado 10", "Esta tarde"). */
  contextLabel?: string;
  /**
   * true cuando el visitante pidió "hoy"/"ahora" pero la fecha actual está
   * fuera del evento. La UI debe aclararlo en vez de fingir que hoy hay agenda.
   */
  outsideEvent?: boolean;
}

/** Palabras que fijan un tipo preferido. Sólo las inequívocas. */
const TYPE_HINTS: { words: string[]; types: ExpoDocType[] }[] = [
  { words: ['empresa', 'empresas', 'expositor', 'expositores', 'marca', 'marcas', 'stand', 'stands', 'productor', 'productores'], types: ['expositor'] },
  { words: ['actividad', 'actividades', 'agenda', 'charla', 'charlas', 'taller', 'talleres', 'programa', 'cronograma', 'conferencia', 'show'], types: ['actividad'] },
  { words: ['bano', 'banos', 'sanitario', 'sanitarios', 'estacionamiento', 'estacionar', 'wifi', 'cajero', 'cajeros', 'servicio', 'servicios', 'auxilios'], types: ['servicio'] },
  { words: ['comer', 'comida', 'gastronomia', 'restaurante', 'hambre', 'almorzar', 'cenar'], types: ['servicio', 'expositor'] },
  { words: ['mapa', 'plano', 'pabellon', 'pabellones', 'zona', 'zonas', 'predio'], types: ['zona'] },
  { words: ['noticia', 'noticias', 'novedad', 'novedades'], types: ['noticia'] },
];

const FRANJA_HINTS: { words: string[]; franja: Franja; label: string }[] = [
  { words: ['manana', 'matutino', 'temprano'], franja: 'manana', label: 'A la mañana' },
  { words: ['tarde', 'vespertino'], franja: 'tarde', label: 'A la tarde' },
  { words: ['noche', 'nocturno'], franja: 'noche', label: 'A la noche' },
];

/**
 * Devuelve la jornada del evento que corresponde a `now`, o `null` si la fecha
 * está fuera del 9–12 de octubre de 2026. Nunca adivina.
 */
export function resolveEventDay(now: Date): (typeof EVENT_DAYS)[number] | null {
  const iso = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  return EVENT_DAYS.find((entry) => entry.date === iso) ?? null;
}

/** Franja horaria correspondiente a la hora de `now`. */
export function resolveFranja(now: Date): Franja {
  const hour = now.getHours();
  if (hour < 13) return 'manana';
  if (hour < 19) return 'tarde';
  return 'noche';
}

export function parseIntent(rawQuery: string, now: Date = new Date()): QueryIntent {
  const normalized = normalizeQuery(rawQuery);
  const words = normalized.split(' ').filter(Boolean);
  const consumed = new Set<string>();

  const intent: QueryIntent = { term: normalized, preferTypes: [] };

  /* --- fecha --- */
  if (words.includes('hoy') || words.includes('ahora')) {
    consumed.add('hoy');
    consumed.add('ahora');
    const today = resolveEventDay(now);
    if (today) {
      intent.dateFilter = today.date;
      intent.contextLabel = 'Hoy';
      if (words.includes('ahora')) {
        intent.franjaFilter = resolveFranja(now);
        intent.contextLabel = 'Ahora';
      }
    } else {
      // Fuera del evento: se muestra la jornada de apertura y se aclara.
      intent.dateFilter = EVENT_DAYS[0].date;
      intent.contextLabel = 'Jornada de apertura';
      intent.outsideEvent = true;
    }
  } else {
    const named = EVENT_DAYS.find(
      (entry) => words.includes(entry.weekday) || words.includes(entry.day),
    );
    if (named) {
      consumed.add(named.weekday);
      consumed.add(named.day);
      intent.dateFilter = named.date;
      intent.contextLabel = named.label;
    }
  }

  /* --- franja --- */
  const franjaHint = FRANJA_HINTS.find((hint) => hint.words.some((word) => words.includes(word)));
  if (franjaHint && !intent.franjaFilter) {
    // "mañana" es ambiguo en castellano (franja vs. día siguiente). Sólo se
    // toma como franja cuando aparece junto a un demostrativo o una fecha.
    const isTimeOfDay =
      franjaHint.franja !== 'manana' ||
      words.includes('esta') ||
      words.includes('a') ||
      Boolean(intent.dateFilter);
    if (isTimeOfDay) {
      franjaHint.words.forEach((word) => consumed.add(word));
      intent.franjaFilter = franjaHint.franja;
      intent.contextLabel = intent.contextLabel
        ? `${intent.contextLabel} · ${franjaHint.label}`
        : franjaHint.label;
    }
  }

  /* --- tipo preferido --- */
  const typeHint = TYPE_HINTS.find((hint) => hint.words.some((word) => words.includes(word)));
  if (typeHint) intent.preferTypes = typeHint.types;

  // Un filtro de fecha o franja implica agenda, salvo que el visitante haya
  // nombrado otro tipo explícitamente.
  if ((intent.dateFilter || intent.franjaFilter) && intent.preferTypes.length === 0) {
    intent.preferTypes = ['actividad'];
  }

  intent.term = words.filter((word) => !consumed.has(word)).join(' ');
  return intent;
}
