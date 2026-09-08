/**
 * Modelo de documento buscable de ExpoJuy 2026.
 *
 * Un único tipo plano describe todo lo que el visitante puede preguntar. Es
 * plano a propósito: Orama indexa mejor documentos sin anidamiento, y la UI
 * renderiza una sola clase de tarjeta.
 *
 * Todos los campos se derivan de `src/data/*.ts` y `src/content/noticias/`. No
 * hay ningún dato que no exista ya en el repositorio.
 */

export const expoDocTypes = [
  'expositor',
  'actividad',
  'zona',
  'servicio',
  'faq',
  'noticia',
  'info',
] as const;

export type ExpoDocType = (typeof expoDocTypes)[number];

/** Acción que la aplicación puede cumplir HOY. No se declara una acción sin ruta real. */
export interface ExpoAction {
  label: string;
  href: string;
}

export interface ExpoDocument {
  /** `<type>:<slug>` — estable entre builds. */
  id: string;
  type: ExpoDocType;

  title: string;
  /** Rubro, temática o tipo de servicio. Se muestra como etiqueta. */
  subtitle?: string;
  body: string;

  /**
   * Campo de recall: sinónimos, forma singular/plural y vocabulario del
   * visitante. No se muestra nunca en pantalla; existe para que "comer" llegue
   * al patio gastronómico. Ver `synonyms.ts`.
   */
  keywords: string;

  /* --- Ubicación (la que existe: zonas del plano, no GPS) --- */
  zoneId?: string;
  zoneName?: string;
  stand?: string;
  pabellon?: string;
  /** Porcentaje 0-100 del marcador en el plano (`plano.ts`). */
  posX?: number;
  posY?: number;

  /* --- Agenda (derivado de `agenda.ts`) --- */
  /** ISO `YYYY-MM-DD`. */
  date?: string;
  /** `HH:MM` 24h. */
  startTime?: string;
  endTime?: string;
  /** `manana` | `tarde` | `noche` — derivado de `startTime`. */
  franja?: Franja;

  /** Ruta real del sitio. Siempre existe. */
  url: string;
  actions: ExpoAction[];
}

export const franjas = ['manana', 'tarde', 'noche'] as const;
export type Franja = (typeof franjas)[number];

/** Etiquetas legibles por tipo, para las tarjetas de resultado. */
export const docTypeLabels: Record<ExpoDocType, string> = {
  expositor: 'Empresa',
  actividad: 'Actividad',
  zona: 'Zona del predio',
  servicio: 'Servicio',
  faq: 'Información',
  noticia: 'Noticia',
  info: 'ExpoJuy',
};

export interface SearchIndexPayload {
  /** Fecha de generación del índice (build time), ISO. */
  generatedAt: string;
  documents: ExpoDocument[];
}
