/**
 * Vocabulario del visitante → vocabulario del sistema.
 *
 * El visitante escribe "dónde como", no "gastronomía". Estos grupos se expanden
 * en el campo `keywords` de cada documento EN TIEMPO DE BUILD, no en la
 * consulta: cuesta cero en el cliente y BM25 lo aprovecha para el ranking.
 *
 * Registro es-AR deliberado. Se incluyen variantes sin tilde porque la
 * normalización de consulta quita acentos y así ambos lados coinciden.
 *
 * Mantener chico: cada término agregado aumenta el recall pero diluye la
 * precisión. Si un grupo empieza a matchear de más, se recorta.
 */

/** Términos genéricos por tipo de documento. */
export const typeSynonyms: Record<string, string[]> = {
  expositor: [
    'empresa', 'empresas', 'expositor', 'expositores', 'stand', 'stands',
    'marca', 'marcas', 'firma', 'compania', 'organizacion', 'participantes',
    'productor', 'productores', 'proveedor',
  ],
  actividad: [
    'actividad', 'actividades', 'agenda', 'programa', 'cronograma', 'evento',
    'eventos', 'charla', 'charlas', 'taller', 'talleres', 'conferencia',
    'panel', 'show', 'espectaculo', 'horario', 'horarios',
  ],
  zona: [
    'zona', 'zonas', 'pabellon', 'pabellones', 'sector', 'sectores', 'mapa',
    'plano', 'predio', 'ubicacion',
  ],
  servicio: ['servicio', 'servicios'],
  faq: ['pregunta', 'preguntas', 'consulta', 'informacion', 'info', 'duda'],
  noticia: ['noticia', 'noticias', 'novedad', 'novedades', 'prensa'],
  info: ['expojuy', 'expo', 'feria', 'muestra', 'evento'],
};

/**
 * Términos por rubro de expositor. La clave es el valor exacto de
 * `Expositor['rubro']` en `src/data/expositores.ts`.
 */
export const rubroSynonyms: Record<string, string[]> = {
  'Minería y Energía': [
    'mineria', 'minera', 'litio', 'energia', 'energetica', 'solar', 'renovable',
    'renovables', 'fotovoltaica', 'extraccion',
  ],
  Agroindustria: [
    'agro', 'agroindustria', 'agroindustrial', 'campo', 'agricultura', 'azucar',
    'tabaco', 'citricos', 'cultivo', 'cosecha', 'rural', 'produccion',
  ],
  Tecnología: [
    'tecnologia', 'tecnologicas', 'tech', 'software', 'sistemas', 'informatica',
    'tic', 'tics', 'cloud', 'nube', 'devops', 'ciberseguridad', 'iot',
    'programacion', 'digital', 'telecomunicaciones', 'internet', 'conectividad',
  ],
  'Alimentos & Bebidas': [
    'alimento', 'alimentos', 'bebida', 'bebidas', 'comida', 'comer', 'gastronomia',
    'gastronomico', 'vino', 'vinos', 'bodega', 'miel', 'carne', 'quinoa',
    'sabores', 'degustacion', 'cata', 'regional', 'productores', 'cooperativa',
  ],
  'Artesanías & Textiles': [
    'artesania', 'artesanias', 'artesanal', 'textil', 'textiles', 'telar',
    'tejido', 'tejidos', 'poncho', 'ceramica', 'alfareria', 'diseno', 'cultura',
    'vicuna', 'llama', 'lana', 'souvenir', 'regalo',
  ],
  Institucional: [
    'institucional', 'gobierno', 'estado', 'camara', 'organismo', 'publico',
    'exportacion', 'inversiones', 'organizacion',
  ],
};

/** Términos por tipo de servicio. La clave es `TipoServicio` de `src/data/servicios.ts`. */
export const servicioSynonyms: Record<string, string[]> = {
  sanitario: [
    'bano', 'banos', 'sanitario', 'sanitarios', 'toilette', 'toilet', 'wc',
    'inodoro', 'lavabo',
  ],
  estacionamiento: [
    'estacionamiento', 'estacionar', 'parking', 'playa', 'cochera', 'auto',
    'autos', 'vehiculo', 'vehiculos', 'camioneta', 'moto',
  ],
  acceso: [
    'acceso', 'accesos', 'entrada', 'entradas', 'ingreso', 'boleteria',
    'boleterias', 'ticket', 'tickets', 'acreditacion', 'molinete', 'puerta',
  ],
  informacion: ['informes', 'informacion', 'info', 'consultas', 'ayuda', 'orientacion'],
  asistencia: [
    'auxilios', 'medico', 'medica', 'enfermeria', 'salud', 'emergencia',
    'emergencias', 'ambulancia', 'accidente',
  ],
  conectividad: ['wifi', 'internet', 'senal', 'red', 'conexion', 'datos'],
  financiero: ['cajero', 'cajeros', 'atm', 'plata', 'efectivo', 'dinero', 'banco', 'tarjeta'],
  descanso: ['descanso', 'descansar', 'sentarse', 'sombra', 'guardarropa', 'mochila'],
  gastronomia: [
    'comer', 'comida', 'gastronomia', 'gastronomico', 'restaurante', 'restaurant',
    'trucks', 'patio', 'almorzar', 'cenar', 'merendar', 'hambre', 'bar', 'cafe',
    'bebida', 'picada', 'empanadas',
  ],
  escenario: [
    'escenario', 'escenarios', 'auditorio', 'sala', 'salon', 'teatro', 'tablado',
    'show', 'espectaculo', 'musica', 'recital', 'conferencia',
  ],
};

/** Términos por temática de agenda. La clave es `AgendaTrack['id']` de `src/data/agenda.ts`. */
export const trackSynonyms: Record<string, string[]> = {
  apertura: ['apertura', 'inauguracion', 'acto', 'ceremonia', 'cierre', 'premios', 'oficial'],
  rondas: ['ronda', 'rondas', 'negocios', 'b2b', 'comercial', 'networking', 'reunion', 'empresarial'],
  charlas: ['charla', 'charlas', 'panel', 'conferencia', 'mineria', 'litio', 'energia', 'foro'],
  talleres: ['taller', 'talleres', 'workshop', 'innovacion', 'tecnologia', 'emprendedores', 'tics'],
  cierre: ['cultura', 'gastronomia', 'musica', 'danza', 'folclore', 'show', 'cata', 'espectaculo'],
};

/** Términos por región de `site.ts`. */
export const regionSynonyms: Record<string, string[]> = {
  puna: ['puna', 'altiplano', 'altura', 'salinas'],
  quebrada: ['quebrada', 'humahuaca', 'purmamarca', 'tilcara', 'maimara'],
  valles: ['valles', 'templados', 'capital'],
  yungas: ['yungas', 'selva', 'monte', 'ledesma'],
};

/**
 * Palabras vacías del castellano conversacional. Se quitan de la consulta antes
 * de buscar: "¿dónde puedo comer?" → "comer". Sin esto, Orama con
 * `threshold: 1` puntúa documentos que sólo coinciden en "donde".
 */
export const queryStopwords = new Set([
  'a', 'al', 'algo', 'alguna', 'algun', 'ante', 'aqui', 'como', 'con', 'cual',
  'cuales', 'cuando', 'cuanto', 'de', 'del', 'donde', 'dos', 'el', 'ella',
  'ellos', 'en', 'entre', 'es', 'esa', 'ese', 'eso', 'esta', 'estan', 'este',
  'esto', 'hay', 'la', 'las', 'le', 'lo', 'los', 'mas', 'me', 'mi', 'mio', 'muy',
  'no', 'nos', 'o', 'para', 'pero', 'poder', 'por', 'puedo', 'puede', 'que',
  'quiero', 'se', 'ser', 'si', 'sin', 'sobre', 'su', 'tengo', 'tiene', 'un',
  'una', 'uno', 'unos', 'y', 'ya', 'yo',
  // Verbos vacíos de la pregunta ("¿qué puedo hacer?", "¿dónde encuentro?").
  'hacer', 'ver', 'ir', 'encuentro', 'encontrar', 'busco', 'buscar', 'necesito',
  'conseguir', 'saber', 'decime', 'mostrame',
]);

const DIACRITICS = /\p{Diacritic}/gu;
const PUNCTUATION = /[¿?¡!.,;:()"'`]/g;

/** Quita acentos, signos y minúsculas. Usado en build y en consulta. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(PUNCTUATION, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normaliza y quita palabras vacías. Si al quitarlas no queda nada (la consulta
 * era sólo "qué hay"), devuelve la consulta normalizada completa: es preferible
 * buscar de más que devolver una búsqueda vacía.
 */
export function normalizeQuery(raw: string): string {
  const normalized = normalize(raw);
  const kept = normalized.split(' ').filter((word) => word && !queryStopwords.has(word));
  return kept.length > 0 ? kept.join(' ') : normalized;
}
