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
  { label: 'AGENDA', href: '#agenda' },
  { label: 'VISITAR', href: '#', placeholder: true },
  { label: 'EXPOSITOR', href: '#participar' },
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
      { label: 'Objetivos', href: '#' },
      { label: 'Ediciones anteriores', href: '#' },
      { label: 'Preguntas frecuentes', href: '#' },
    ],
  },
  {
    title: 'INFORMACIÓN',
    links: [
      { label: 'Cómo llegar', href: '#' },
      { label: 'Alojamiento', href: '#' },
      { label: 'Turismo en Jujuy', href: '#territorios' },
      { label: 'Prensa', href: '#' },
    ],
  },
  {
    title: 'EXPOSITOR',
    links: [
      { label: 'Quiero participar', href: '#participar' },
      { label: 'Reglamento', href: '#' },
      { label: 'Descargar dossier', href: '#' },
      { label: 'Contacto comercial', href: '#' },
    ],
  },
] as const;

export const socials = [
  { label: 'Instagram', icon: 'instagram', href: '#' },
  { label: 'Facebook', icon: 'facebook', href: '#' },
  { label: 'X', icon: 'x', href: '#' },
  { label: 'YouTube', icon: 'youtube', href: '#' },
  { label: 'LinkedIn', icon: 'linkedin', href: '#' },
] as const;

export const legalLinks = [
  { label: 'Términos y condiciones', href: '#' },
  { label: 'Política de privacidad', href: '#' },
] as const;
