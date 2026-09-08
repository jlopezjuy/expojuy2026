/**
 * Adaptadores `src/data/*.ts` → `ExpoDocument[]`.
 *
 * Se ejecuta EN BUILD (lo consume `src/pages/search-index.json.ts`), nunca en el
 * navegador. Por eso puede importar todo `src/data/` sin costo de bundle.
 *
 * Regla del repositorio que este archivo respeta: no se inventa contenido. Todo
 * campo sale de un dato existente o de una derivación explícita y documentada
 * (fecha ISO a partir de `day`, franja horaria a partir de `startTime`, zona a
 * partir del prefijo del código de stand).
 */

import { getCollection } from 'astro:content';

import { agendaItems, agendaTracks } from '../../data/agenda';
import { expositores } from '../../data/expositores';
import { faq } from '../../data/faq';
import { planoZones } from '../../data/plano';
import { servicios } from '../../data/servicios';
import { event, regions } from '../../data/site';
import {
  normalize,
  regionSynonyms,
  rubroSynonyms,
  servicioSynonyms,
  trackSynonyms,
  typeSynonyms,
} from './synonyms';
import type { ExpoDocument, Franja } from './types';

/**
 * Mes y año del evento. Fijos y verificables: `site.ts` declara "OCTUBRE 2026"
 * y el JSON-LD de `BaseLayout.astro` fija `2026-10-09` / `2026-10-12`.
 */
const EVENT_YEAR = 2026;
const EVENT_MONTH = 10;

const DAY_NAMES: Record<string, string> = {
  '9': 'Viernes 9',
  '10': 'Sábado 10',
  '11': 'Domingo 11',
  '12': 'Lunes 12',
};

/** `'10:00 - 11:30 hs'` → `['10:00', '11:30']`. Formato único en `agenda.ts`. */
function parseTimeRange(time: string): { startTime?: string; endTime?: string } {
  const matches = time.match(/(\d{1,2}:\d{2})/g);
  if (!matches || matches.length === 0) return {};
  return { startTime: matches[0], endTime: matches[1] };
}

function toFranja(startTime: string | undefined): Franja | undefined {
  if (!startTime) return undefined;
  const hour = Number(startTime.split(':')[0]);
  if (Number.isNaN(hour)) return undefined;
  if (hour < 13) return 'manana';
  if (hour < 19) return 'tarde';
  return 'noche';
}

/**
 * Prefijo de código de stand → zona del plano. Se deriva de `plano.ts`
 * (`stands: ['Stand M-01', ...]`), no está escrito a mano: si mañana cambia una
 * zona, el mapa se recalcula solo.
 */
function buildStandPrefixToZone(): Map<string, string> {
  const map = new Map<string, string>();
  for (const zone of planoZones) {
    for (const stand of zone.stands) {
      const code = stand.match(/\b([A-Z])-\d+\b/);
      if (code?.[1] && !map.has(code[1])) map.set(code[1], zone.id);
    }
  }
  return map;
}

/**
 * Salas con nombre propio → zona del plano, tomado de `servicios.ts`, que ya
 * declara la procedencia de cada una ("Escenario Cultural" y "Auditorio
 * Principal" salen de la nota y los stands de sus zonas). Se consulta primero
 * porque el nombre de una sala no aparece en `zone.name` ni en `zone.stands`.
 */
const venueNameToZone = new Map(
  servicios
    .filter((servicio) => servicio.zoneId !== null)
    .map((servicio) => [normalize(servicio.nombre), servicio.zoneId as string]),
);

/**
 * Ubicación textual de una sesión de agenda → zona del plano. El texto de
 * `location` es libre: primero se prueba contra las salas con nombre propio y
 * después por coincidencia contra el nombre de la zona y sus stands. Lo que no
 * resuelve queda SIN zona — es preferible no ofrecer "ver en el mapa" a mandar
 * al visitante al lugar equivocado.
 */
function resolveZoneByLocation(location: string): string | undefined {
  const needle = normalize(location);

  const named = venueNameToZone.get(needle);
  if (named) return named;

  for (const zone of planoZones) {
    const haystack = normalize([zone.name, ...zone.stands].join(' '));
    const words = needle.split(' ').filter((w) => w.length > 4);
    if (words.some((word) => haystack.includes(word))) return zone.id;
  }
  return undefined;
}

const zoneById = new Map(planoZones.map((zone) => [zone.id, zone]));

function joinKeywords(...groups: (string[] | string | undefined)[]): string {
  const flat = groups
    .flatMap((group) => (Array.isArray(group) ? group : group ? [group] : []))
    .map(normalize)
    .filter(Boolean);
  return Array.from(new Set(flat)).join(' ');
}

/** Añade la variante plural/singular simple para que "empresas" alcance a "empresa". */
function withPlurals(words: string[]): string[] {
  const out = new Set<string>();
  for (const word of words) {
    out.add(word);
    if (word.endsWith('s')) out.add(word.slice(0, -1));
    else out.add(`${word}s`);
  }
  return Array.from(out);
}

function expositorDocs(): ExpoDocument[] {
  const prefixToZone = buildStandPrefixToZone();

  return expositores.map((expositor) => {
    const prefix = expositor.stand.split('-')[0];
    const zoneId = prefixToZone.get(prefix);
    const zone = zoneId ? zoneById.get(zoneId) : undefined;

    const actions = [{ label: 'Ver en el directorio', href: `/expositores?q=${encodeURIComponent(expositor.nombre)}` }];
    if (zone) actions.push({ label: 'Ver en el mapa', href: `/mapa?zona=${zone.id}` });

    return {
      id: `expositor:${expositor.id}`,
      type: 'expositor' as const,
      title: expositor.nombre,
      subtitle: expositor.rubro,
      body: expositor.descripcion,
      keywords: joinKeywords(
        withPlurals(typeSynonyms.expositor ?? []),
        rubroSynonyms[expositor.rubro] ?? [],
        expositor.pabellon,
        expositor.stand,
        `stand ${expositor.stand}`,
        zone?.name,
      ),
      zoneId: zone?.id,
      zoneName: zone?.name,
      stand: expositor.stand,
      pabellon: expositor.pabellon,
      posX: zone?.x,
      posY: zone?.y,
      url: `/expositores?q=${encodeURIComponent(expositor.nombre)}`,
      actions,
    };
  });
}

function actividadDocs(): ExpoDocument[] {
  const trackById = new Map(agendaTracks.map((track) => [track.id, track]));

  return agendaItems.map((item) => {
    const { startTime, endTime } = parseTimeRange(item.time);
    const zoneId = resolveZoneByLocation(item.location);
    const zone = zoneId ? zoneById.get(zoneId) : undefined;
    const track = trackById.get(item.trackId);
    const dayLabel = DAY_NAMES[item.day] ?? `Día ${item.day}`;

    const actions = [{ label: 'Ver en la agenda', href: `/agenda?dia=${item.day}` }];
    if (zone) actions.push({ label: 'Ver en el mapa', href: `/mapa?zona=${zone.id}` });

    return {
      id: `actividad:${item.id}`,
      type: 'actividad' as const,
      title: item.title,
      subtitle: `${dayLabel} · ${item.time}`,
      body: item.note,
      keywords: joinKeywords(
        withPlurals(typeSynonyms.actividad ?? []),
        trackSynonyms[item.trackId] ?? [],
        track?.label,
        item.location,
        item.speaker,
        dayLabel,
        `dia ${item.day}`,
        zone?.name,
      ),
      zoneId: zone?.id,
      zoneName: zone?.name ?? item.location,
      posX: zone?.x,
      posY: zone?.y,
      date: `${EVENT_YEAR}-${String(EVENT_MONTH).padStart(2, '0')}-${item.day.padStart(2, '0')}`,
      startTime,
      endTime,
      franja: toFranja(startTime),
      url: `/agenda?dia=${item.day}`,
      actions,
    };
  });
}

function zonaDocs(): ExpoDocument[] {
  return planoZones.map((zone) => ({
    id: `zona:${zone.id}`,
    type: 'zona' as const,
    title: zone.name,
    subtitle: zone.pabellonBadge,
    body: zone.note,
    keywords: joinKeywords(
      withPlurals(typeSynonyms.zona ?? []),
      zone.stands,
      zone.expositores,
      zone.pabellonBadge,
    ),
    zoneId: zone.id,
    zoneName: zone.name,
    posX: zone.x,
    posY: zone.y,
    url: `/mapa?zona=${zone.id}`,
    actions: [{ label: 'Ver en el mapa', href: `/mapa?zona=${zone.id}` }],
  }));
}

function servicioDocs(): ExpoDocument[] {
  return servicios.map((servicio) => {
    const zone = servicio.zoneId ? zoneById.get(servicio.zoneId) : undefined;

    const actions = zone
      ? [{ label: 'Ver en el mapa', href: `/mapa?zona=${zone.id}` }]
      : [{ label: 'Ver el plano del predio', href: '/mapa' }];

    return {
      id: `servicio:${servicio.id}`,
      type: 'servicio' as const,
      title: servicio.nombre,
      subtitle: servicio.ubicacionTexto,
      body: servicio.descripcion,
      keywords: joinKeywords(
        withPlurals(typeSynonyms.servicio ?? []),
        servicioSynonyms[servicio.tipo] ?? [],
        servicio.accesible ? ['accesible', 'movilidad reducida', 'discapacidad'] : [],
        zone?.name,
      ),
      zoneId: zone?.id,
      zoneName: zone?.name,
      posX: zone?.x,
      posY: zone?.y,
      url: zone ? `/mapa?zona=${zone.id}` : '/mapa',
      actions,
    };
  });
}

function faqDocs(): ExpoDocument[] {
  return faq.map((item, index) => ({
    id: `faq:${index}`,
    type: 'faq' as const,
    title: item.question,
    body: item.answer,
    keywords: joinKeywords(withPlurals(typeSynonyms.faq ?? [])),
    url: '/preguntas-frecuentes',
    actions: [{ label: 'Ver preguntas frecuentes', href: '/preguntas-frecuentes' }],
  }));
}

async function noticiaDocs(): Promise<ExpoDocument[]> {
  const posts = await getCollection('noticias');

  return posts.map((post) => ({
    id: `noticia:${post.id}`,
    type: 'noticia' as const,
    title: post.data.title,
    subtitle: post.data.category,
    body: post.data.description,
    keywords: joinKeywords(withPlurals(typeSynonyms.noticia ?? []), post.data.category),
    url: `/noticias/${post.id}`,
    actions: [{ label: 'Leer la noticia', href: `/noticias/${post.id}` }],
  }));
}

/**
 * Datos generales del evento. Responden "¿cuándo es?", "¿dónde es?",
 * "¿cuánto sale?" sin obligar al visitante a leer todo el FAQ.
 */
function infoDocs(): ExpoDocument[] {
  const docs: ExpoDocument[] = [
    {
      id: 'info:evento',
      type: 'info',
      title: `${event.name} ${event.year} — ${event.edition} edición`,
      subtitle: `${event.datesShort} de ${event.datesLong.toLowerCase()}`,
      body: `${event.tagline} Se realiza en ${event.venue}, ${event.city}, del 9 al 12 de octubre de 2026.`,
      keywords: joinKeywords(
        withPlurals(typeSynonyms.info ?? []),
        ['cuando', 'fecha', 'fechas', 'dia', 'dias', 'octubre', 'sede', 'lugar',
         'donde es', 'direccion', 'ciudad cultural', 'san salvador de jujuy', 'como llegar'],
      ),
      url: '/',
      actions: [{ label: 'Ver la agenda', href: '/agenda' }],
    },
  ];

  for (const region of regions) {
    docs.push({
      id: `info:region-${region.slug}`,
      type: 'info',
      title: `Región ${region.name}`,
      subtitle: 'Territorios de Jujuy',
      body: `Una de las cuatro regiones de Jujuy representadas en ExpoJuy ${event.year}.`,
      keywords: joinKeywords(
        regionSynonyms[region.slug] ?? [],
        ['region', 'regiones', 'territorio', 'territorios', 'turismo', 'jujuy'],
      ),
      url: '/#territorios',
      actions: [{ label: 'Ver los territorios', href: '/#territorios' }],
    });
  }

  return docs;
}

/** Construye el corpus completo. Único punto de entrada del build. */
export async function buildDocuments(): Promise<ExpoDocument[]> {
  return [
    ...infoDocs(),
    ...expositorDocs(),
    ...actividadDocs(),
    ...zonaDocs(),
    ...servicioDocs(),
    ...faqDocs(),
    ...(await noticiaDocs()),
  ];
}
