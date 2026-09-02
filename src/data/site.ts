/**
 * Every string in this file is transcribed from the approved mockup
 * ("Propuesta 1 — Jujuy Cinematográfico", 00.png / 02.png).
 * Nothing here is invented copy; anything unreadable in the reference is
 * flagged with a TODO comment instead of being made up.
 */

export const event = {
  name: 'ExpoJuy',
  year: '2026',
  datesShort: '17 AL 20',
  datesLong: 'SEPTIEMBRE 2026',
  venue: 'PREDIO FERIAL JUJUY',
  city: 'SAN SALVADOR DE JUJUY',
  tagline: 'Somos desarrollo, potencia y futuro.',
  eyebrow: ['JUJUY PRODUCE.', 'JUJUY CREA.', 'JUJUY EMPRENDE.'],
} as const;

export interface NavItem {
  label: string;
  href: string;
  /** true when the target section does not exist on this page yet. */
  placeholder?: boolean;
}

export const nav: NavItem[] = [
  { label: 'LA EXPO', href: '#la-expo' },
  { label: 'REGIONES', href: '#territorios' },
  { label: 'EMPRENDIMIENTOS', href: '#emprendimientos' },
  { label: 'AGENDA', href: '/agenda' },
  { label: 'VISITAR', href: '/mapa' },
  { label: 'ENTRADAS', href: '/entradas' },
  { label: 'EXPOSITOR', href: '#participar' },
  // Sprint 3: páginas propias de las secciones mínimas (Consignas Técnicas §5).
  { label: 'EXPOSITORES', href: '/expositores' },
  { label: 'NOTICIAS', href: '/noticias' },
  { label: 'CONTACTO', href: '/contacto' },
  { label: 'PREGUNTAS', href: '/preguntas-frecuentes' },
];

export const heroCategories = ['NEGOCIOS', 'TURISMO', 'CULTURA', 'EXPERIENCIA'] as const;

/** "La Expo" band — the five pillars with their icon keys. */
export const pillars = [
  { label: 'NEGOCIOS', icon: 'briefcase' },
  { label: 'TURISMO', icon: 'compass' },
  { label: 'CULTURA', icon: 'culture' },
  { label: 'PRODUCCIÓN', icon: 'gear' },
  { label: 'EXPERIENCIA', icon: 'experience' },
] as const;

export interface Region {
  slug: string;
  name: string;
  photo: 'regionPuna' | 'regionQuebrada' | 'regionValles' | 'regionYungas';
}

export const regions: Region[] = [
  { slug: 'puna', name: 'PUNA', photo: 'regionPuna' },
  { slug: 'quebrada', name: 'QUEBRADA', photo: 'regionQuebrada' },
  { slug: 'valles', name: 'VALLES', photo: 'regionValles' },
  { slug: 'yungas', name: 'YUNGAS', photo: 'regionYungas' },
];

export const productFilters = [
  { id: 'todos', label: 'TODOS' },
  { id: 'alimentos', label: 'ALIMENTOS' },
  { id: 'artesanias', label: 'ARTESANÍAS' },
  { id: 'textiles', label: 'TEXTILES' },
  { id: 'turismo', label: 'TURISMO' },
  { id: 'bienestar', label: 'BIENESTAR' },
  { id: 'diseno', label: 'DISEÑO' },
] as const;

export type ProductFilterId = (typeof productFilters)[number]['id'];

export interface Product {
  photo: string;
  category: Exclude<ProductFilterId, 'todos'>;
}

/* The mockup shows product photos without visible captions, so the cards carry
   no invented brand names — only the category used by the filter tabs. */
export const products: Product[] = [
  { photo: 'prodMiel', category: 'alimentos' },
  { photo: 'prodTextil', category: 'textiles' },
  { photo: 'prodHuerta', category: 'alimentos' },
  { photo: 'prodCeramica', category: 'artesanias' },
  { photo: 'prodDiseno', category: 'diseno' },
  { photo: 'prodHierbas', category: 'bienestar' },
  { photo: 'prodTurismo', category: 'turismo' },
  { photo: 'prodTelar', category: 'textiles' },
];

export const agendaDays = [
  { day: '17', month: 'SEPT.', label: 'Apertura' },
  { day: '18', month: 'SEPT.', label: 'Rondas de negocios' },
  { day: '19', month: 'SEPT.', label: 'Charlas & Talleres' },
  { day: '20', month: 'SEPT.', label: 'Cierre & Experiencias' },
] as const;

/**
 * Institutional supporters read off the sponsor strip in 00.png.
 * No official logo files exist in this repo, so they render as text wordmarks.
 */
export const sponsors = [
  'Gobierno de Jujuy',
  'CFI · Consejo Federal de Inversiones',
  'Cámara de Comercio Exterior de Jujuy',
  'BANCOR',
  'Macro',
  'YPF',
  'JEMSE',
  'Jujuy Energía',
] as const;

export const footerColumns = [
  {
    title: 'LA EXPO',
    links: [
      { label: '¿Qué es ExpoJuy?', href: '#la-expo' },
      // TODO(Sprint 2.3): "Objetivos" se retiró porque no hay destino real en el
      // repo; vuelve cuando la organización publique esa página. "Preguntas
      // frecuentes" vuelve con la sección del Sprint 3.
      { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' },
      { label: 'Ediciones anteriores', href: 'https://expojuy.camcomexjujuy.com.ar/' },
    ],
  },
  {
    title: 'INFORMACIÓN',
    links: [
      // TODO(Sprint 2.3): "Cómo llegar", "Alojamiento" y "Prensa" se retiraron;
      // no hay datos reales en el repo (ni en la sección de información del mockup).
      // Se restituyen cuando la organización los provea.
      { label: 'Turismo en Jujuy', href: '#territorios' },
      // Sprint 4: mapa del predio y gestión de entradas como páginas propias.
      { label: 'Cómo llegar / Mapa', href: '/mapa' },
      { label: 'Entradas', href: '/entradas' },
      // Sprint 3: secciones mínimas con página propia (Consignas Técnicas §5).
      { label: 'Expositores', href: '/expositores' },
      { label: 'Noticias', href: '/noticias' },
      { label: 'Contacto', href: '/contacto' },
    ],
  },
  {
    title: 'EXPOSITOR',
    links: [
      { label: 'Quiero participar', href: '#participar' },
      // Reglamento real: Bases y Condiciones oficiales del evento (recursos/).
      { label: 'Reglamento', href: '/docs/bases-y-condiciones.pdf' },
      // TODO(Sprint 2.3): "Descargar dossier" y "Contacto comercial" se retiraron:
      // no existe archivo de dossier en el repo y el canal de contacto es del Sprint 3.
    ],
  },
] as const;

// TODO(Sprint 2.2): no hay handles oficiales de ExpoJuy en el repo (ni en recursos/
// ni en el mockup). Los iconos se retiran en vez de apuntar a URLs inventadas.
// Reintroducirlos con la URL real de cada cuenta cuando la organización los provea.
export const socials = [] as const;

// TODO(Sprint 2.3): no existen páginas legales todavía. Se retiran en vez de
// apuntar a un `#` muerto. Restaurarlas con la URL real cuando existan.
export const legalLinks = [] as const;
