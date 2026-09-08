/**
 * Motor de búsqueda del asistente — envoltorio sobre Orama.
 *
 * Corre en el navegador. NO importa nada de `src/data/`: recibe los documentos
 * ya construidos desde `/search-index.json`, que se genera en build.
 *
 * ── Por qué DOS índices ────────────────────────────────────────────────────
 * Medido, no supuesto. El stemmer español de Orama reduce "estacionamiento" a
 * "estacion", pero el error de tipeo "estacionamieto" queda en "estacionamiet":
 * la distancia de edición entre ambos raíces es 8, así que `tolerance` no lo
 * alcanza por más que se suba (y subirla arruina la precisión — con
 * `tolerance: 3` la consulta "comer" matcheaba el corpus entero).
 *
 * La solución es barata: el índice principal usa stemming (resuelve plurales y
 * morfología, "baños" → "baño"), y sólo cuando devuelve CERO resultados se
 * consulta un índice gemelo sin stemming con `tolerance: 2`, que sí tolera el
 * error de tipeo. Con ~75 documentos el costo de mantener los dos es
 * despreciable y evita elegir entre morfología y tipeo.
 */

import { create, insertMultiple, search, type AnyOrama } from '@orama/orama';
import { stemmer } from '@orama/stemmers/spanish';

import { parseIntent, type QueryIntent } from './intents';
import { normalize } from './synonyms';
import type { ExpoDocType, ExpoDocument } from './types';

/**
 * `date` y `franja` son `enum` (no `string`) porque Orama sólo filtra con
 * `where` sobre campos indexados como enum/number/boolean.
 */
const schema = {
  id: 'string',
  type: 'enum',
  title: 'string',
  subtitle: 'string',
  body: 'string',
  keywords: 'string',
  date: 'enum',
  franja: 'enum',
  zoneId: 'string',
  stand: 'string',
} as const;

/** El título pesa más que el cuerpo; `keywords` es recall, no señal fuerte. */
const boost = { title: 3, stand: 2.5, subtitle: 1.6, keywords: 1.2, body: 1 };

interface SearchTier {
  stemmed: boolean;
  exact: boolean;
  tolerance: number;
}

/**
 * Coincidencia exacta de raíz, exigiendo TODOS los términos. El escalón más
 * preciso y el que resuelve la mayoría de las consultas.
 *
 * `exact` es deliberado. Orama busca por PREFIJO por defecto (útil para
 * autocompletar) y con stemming eso es destructivo: "comer" se reduce a la raíz
 * "com", que es prefijo de "comercio", "comercial" y "comisión". Medido: sin
 * `exact`, "¿dónde puedo comer?" devolvía la Cámara de Comercio Exterior
 * primero y el Patio Gastronómico ni entraba al podio.
 */
const EXACT_TIER: SearchTier = { stemmed: true, exact: true, tolerance: 0 };

/**
 * Prefijo sobre raíz. Es el escalón de autocompletado ("gastro" → gastronómico)
 * y el único donde `threshold: 1` realmente afloja a semántica OR: medido, con
 * `exact: true` Orama exige todos los términos y `threshold` no lo cambia.
 *
 * Va DESPUÉS del rescate por término suelto justamente por eso: siendo OR y por
 * prefijo, atrapa casi cualquier consulta y taparía un resultado más preciso.
 */
const PREFIX_TIER: SearchTier = { stemmed: true, exact: false, tolerance: 0 };

/**
 * Escalones de corrección de tipeo. Van ÚLTIMOS, después del rescate por
 * término suelto: que al visitante le sobre una palabra que no está en el
 * corpus ("sin TACC", "participan") es mucho más frecuente que que escriba dos
 * errores de tipeo, y estos escalones son los más ruidosos de todos.
 *
 * Van sin stemming porque el stemmer rompe la tolerancia: "estacionamiento" se
 * reduce a "estacion" pero el tipeo "estacionamieto" a "estacionamiet", y entre
 * esas dos raíces hay distancia 8.
 */
const TYPO_TIERS: SearchTier[] = [
  { stemmed: false, exact: false, tolerance: 1 },
  { stemmed: false, exact: false, tolerance: 2 },
];

export interface ExpoSearchResult {
  document: ExpoDocument;
  score: number;
}

export interface ExpoSearchResponse {
  results: ExpoSearchResult[];
  /** Conteo por tipo sobre el resultado, para los chips de la UI. */
  facets: Partial<Record<ExpoDocType, number>>;
  intent: QueryIntent;
  /** true cuando respondió el índice de respaldo (hubo corrección de tipeo). */
  usedFallback: boolean;
}

export interface ExpoSearchEngine {
  search(rawQuery: string, options?: { limit?: number; now?: Date }): Promise<ExpoSearchResponse>;
  browse(type: ExpoDocType, limit?: number): ExpoSearchResult[];
  size: number;
}

/**
 * Documento tal como se indexa.
 *
 * `keywords` funciona como CAMPO ATRAPA-TODO: además de los sinónimos, repite
 * título, subtítulo, stand y zona. No es redundancia gratuita — medido, la
 * coincidencia exacta de Orama exige que todos los términos caigan en el MISMO
 * campo, así que "stand de Ledesma" no encontraba a Ledesma S.A.A.I. ("stand"
 * vivía en `keywords` y "Ledesma" en `title`). La duplicación ocurre en el
 * cliente al indexar, no en el JSON que se descarga.
 */
function toIndexable(doc: ExpoDocument) {
  const title = normalize(doc.title);
  const subtitle = normalize(doc.subtitle ?? '');
  const stand = normalize(doc.stand ?? '');
  const zoneName = normalize(doc.zoneName ?? '');

  return {
    id: doc.id,
    type: doc.type,
    title,
    subtitle,
    body: normalize(doc.body),
    keywords: [doc.keywords, title, subtitle, stand, zoneName].filter(Boolean).join(' '),
    date: doc.date ?? '',
    franja: doc.franja ?? '',
    zoneId: doc.zoneId ?? '',
    stand,
  };
}

async function buildIndex(documents: ExpoDocument[], stemming: boolean): Promise<AnyOrama> {
  const db = create({
    schema,
    components: {
      tokenizer: {
        language: 'spanish',
        stemming,
        ...(stemming ? { stemmer } : {}),
      },
    },
  }) as AnyOrama;

  await insertMultiple(db, documents.map(toIndexable));
  return db;
}

export async function createSearchEngine(documents: ExpoDocument[]): Promise<ExpoSearchEngine> {
  const byId = new Map(documents.map((doc) => [doc.id, doc]));
  const [stemmed, literal] = await Promise.all([
    buildIndex(documents, true),
    buildIndex(documents, false),
  ]);

  /** Orama tipa `hit.document` como `unknown`; el `id` lo pusimos nosotros. */
  function docId(hit: { document: unknown }): string {
    return (hit.document as { id: string }).id;
  }

  function hydrate(hits: { document: unknown; score: number }[]): ExpoSearchResult[] {
    const out: ExpoSearchResult[] = [];
    for (const hit of hits) {
      const doc = byId.get(docId(hit));
      if (doc) out.push({ document: doc, score: hit.score });
    }
    return out;
  }

  /**
   * Los tipos preferidos se aplican como BOOST, no como filtro duro: si la
   * conjetura de intención es incorrecta, un filtro dejaría al visitante sin
   * resultados; un boost sólo reordena.
   */
  function applyTypeBoost(results: ExpoSearchResult[], preferTypes: ExpoDocType[]): ExpoSearchResult[] {
    if (preferTypes.length === 0) return results;
    const weight = new Map(preferTypes.map((type, index) => [type, 2 - index * 0.4]));
    return results
      .map((result) => ({ ...result, score: result.score * (weight.get(result.document.type) ?? 1) }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Orama espera un operador por campo en `where`. Un string pelado
   * (`{ date: '2026-10-10' }`) se interpreta como objeto de operaciones y falla
   * con INVALID_FILTER_OPERATION; la forma correcta para un `enum` es `{ eq }`.
   */
  function buildWhere(intent: QueryIntent): Record<string, { eq: string }> {
    const where: Record<string, { eq: string }> = {};
    if (intent.dateFilter) where.date = { eq: intent.dateFilter };
    if (intent.franjaFilter) where.franja = { eq: intent.franjaFilter };
    return where;
  }

  type Hits = Awaited<ReturnType<typeof search>>['hits'];

  /**
   * Sólo filtro, sin término. Resuelve "¿qué hay el sábado?" y también rescata
   * "¿qué puedo hacer esta tarde?" cuando la palabra sobrante ("hacer") no
   * matchea nada: el visitante pidió una franja, se le muestra esa franja.
   */
  async function runFilterOnly(intent: QueryIntent, limit: number): Promise<Hits> {
    const where = buildWhere(intent);
    if (Object.keys(where).length === 0) return [];
    const response = await search(stemmed, { where, limit });
    return response.hits;
  }

  async function runSearch(
    db: AnyOrama,
    intent: QueryIntent,
    tier: SearchTier,
    term: string,
    limit: number,
  ): Promise<Hits> {
    const where = buildWhere(intent);
    const hasWhere = Object.keys(where).length > 0;

    const response = await search(db, {
      term,
      exact: tier.exact,
      tolerance: tier.tolerance,
      threshold: 1,
      boost,
      limit,
      ...(hasWhere ? { where } : {}),
    });
    return response.hits;
  }

  /**
   * Rescate por término suelto (semántica OR real).
   *
   * Medido: con `exact: true`, Orama exige TODOS los términos y `threshold` no
   * lo afloja — "comida tacc" devuelve 0 aunque "comida" sola devuelva 5. Como
   * el visitante escribe preguntas enteras, casi siempre sobra alguna palabra
   * que no está en el corpus. Buscar término por término y quedarse con el
   * mejor puntaje de cada documento recupera la intención sin perder precisión.
   */
  async function searchPerTerm(
    terms: string[],
    intent: QueryIntent,
    limit: number,
  ): Promise<Hits> {
    const best = new Map<string, Hits[number]>();

    for (const term of terms) {
      const hits = await runSearch(stemmed, intent, EXACT_TIER, term, limit);
      for (const hit of hits) {
        const id = docId(hit);
        const current = best.get(id);
        if (!current || hit.score > current.score) best.set(id, hit);
      }
    }

    return Array.from(best.values()).sort((a, b) => b.score - a.score).slice(0, limit);
  }

  return {
    size: documents.length,

    browse(type, limit = 12) {
      return documents
        .filter((doc) => doc.type === type)
        .slice(0, limit)
        .map((document) => ({ document, score: 0 }));
    },

    async search(rawQuery, options = {}) {
      const limit = options.limit ?? 24;
      const intent = parseIntent(rawQuery, options.now);
      const term = intent.term.trim();
      const terms = term.split(' ').filter(Boolean);

      let hits: Hits = [];
      let usedFallback = false;

      if (term) {
        // 1) frase completa, coincidencia exacta de raíz
        hits = await runSearch(stemmed, intent, EXACT_TIER, term, limit);

        // 2) rescate por término suelto: al visitante casi siempre le sobra una
        //    palabra que no está en el corpus ("sin TACC", "participan")
        if (hits.length === 0 && terms.length > 1) {
          hits = await searchPerTerm(terms, intent, limit);
        }

        // 3) prefijo — autocompletado y raíces parciales
        if (hits.length === 0) {
          hits = await runSearch(stemmed, intent, PREFIX_TIER, term, limit);
        }

        // 4) corrección de tipeo, último recurso y el más ruidoso
        for (let i = 0; i < TYPO_TIERS.length && hits.length === 0; i += 1) {
          hits = await runSearch(literal, intent, TYPO_TIERS[i], term, limit);
          usedFallback = hits.length > 0;
        }
      }

      // Último rescate: el visitante pidió una fecha o franja concreta y nada
      // más matcheó. Mostrar esa jornada es mejor que no mostrar nada.
      if (hits.length === 0) {
        hits = await runFilterOnly(intent, limit);
      }

      const results = applyTypeBoost(hydrate(hits), intent.preferTypes);

      const facets: Partial<Record<ExpoDocType, number>> = {};
      for (const result of results) {
        facets[result.document.type] = (facets[result.document.type] ?? 0) + 1;
      }

      return { results, facets, intent, usedFallback };
    },
  };
}
