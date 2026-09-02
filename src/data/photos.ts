/**
 * Placeholder photography.
 *
 * These are Unsplash photo IDs chosen to match the framing, crop and colour
 * grading of the "Propuesta 1 — Jujuy Cinematográfico" mockup (00.png / 02.png).
 * They are PLACEHOLDERS: every entry must be swapped for real ExpoJuy /
 * Jujuy photography before launch. See docs/design-spec.md.
 *
 * They are hot-linked from images.unsplash.com so nothing is committed to the
 * repo. Once real assets land, move them to `src/assets/` and switch `Photo`
 * over to Astro's `<Image>` component (astro.config.mjs already allows the
 * remote domain).
 */

export interface Photo {
  /** Unsplash photo id, i.e. the part after `photo-`. */
  id: string;
  /** Spanish alt text. Empty string only for purely decorative images. */
  alt: string;
  /** Intrinsic aspect ratio used to reserve layout space. */
  ratio: number;
}

const p = (id: string, alt: string, ratio = 3 / 2): Photo => ({ id, alt, ratio });

export const photos = {
  heroBackdrop: p(
    '1765042764074-2dd6bd291899',
    'Cerros de la Quebrada de Humahuaca iluminados por el sol de la tarde',
    16 / 9,
  ),
  collageArtisan: p(
    '1749835521236-d29d0004162d',
    'Artesana trabajando en su taller con luz cálida',
    3 / 4,
  ),
  collageField: p(
    '1709207517323-a8fd737c5498',
    'Productor cosechando verduras a mano en su campo',
    3 / 4,
  ),
  collageSalt: p(
    '1763110804142-7e8e14d16e92',
    'Camino recto atravesando las Salinas Grandes',
    3 / 2,
  ),
  expoGate: p(
    '1774082313811-f9852bd53d00',
    'Calle de feria con puestos de expositores y visitantes',
    3 / 2,
  ),
  regionPuna: p('1650970327761-4ebbd90b88bd', 'Llamas junto a una laguna altoandina en la Puna', 3 / 2),
  regionQuebrada: p(
    '1765567972885-9b63d0f6c7db',
    'Serranía de colores de la Quebrada de Humahuaca',
    3 / 2,
  ),
  regionValles: p('1666967931985-2a75defef638', 'Valle verde con cultivos en terrazas', 3 / 2),
  regionYungas: p('1662810902727-14106382a202', 'Cascada entre la selva de las Yungas', 3 / 2),

  prodMiel: p('1587049352851-8d4e89133924', 'Frasco de miel artesanal a contraluz', 1),
  prodTextil: p('1562869929-bda0650edb1f', 'Textiles andinos tejidos a mano colgados en un puesto', 1),
  prodHuerta: p('1751210769268-85d43ecfcdd8', 'Productor sosteniendo un cajón de verdura fresca', 1),
  prodCeramica: p('1422246358533-95dcd3d48961', 'Manos de alfarero modelando arcilla', 1),
  prodDiseno: p('1595351298020-038700609878', 'Torno de alfarero con herramientas de taller', 1),
  prodHierbas: p('1709207517323-a8fd737c5498', 'Emprendedora cosechando hierbas aromáticas', 1),
  prodTurismo: p('1772722185174-4f1b62c9c4a7', 'Laguna de altura con una llama pastando', 1),
  prodTelar: p('1749584550329-12f3252202f1', 'Tejedor trabajando en un telar de madera', 1),

  sabores: p('1762631383815-784c04533802', 'Plato criollo servido en un bol de madera', 4 / 3),
  personas: p('1773613927259-a1f954d1671e', 'Retrato de una mujer jujeña con sombrero tradicional', 4 / 3),
  agenda: p('1536257104079-aa99c6460a5a', 'Atardecer rosado sobre las sierras', 4 / 3),
  ctaSunset: p('1510218129079-74e00c5a90ea', 'Sierras recortadas contra un cielo naranja y violeta', 21 / 9),
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;
