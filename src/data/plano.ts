/**
 * Mapa del predio ferial — ExpoJuy 2026.
 *
 * Definición oficial de las 8 zonas estratégicas del Predio Ferial Jujuy,
 * coordenadas espaciales y vinculación directa con pabellones y expositores.
 */

export interface PlanoZone {
  id: string;
  name: string;
  note: string;
  pabellonBadge: string;
  stands: string[];
  expositores: string[];
  /** Porcentaje horizontal (0-100) del centro del marcador interactivo */
  x: number;
  /** Porcentaje vertical (0-100) del centro del marcador interactivo */
  y: number;
  /** Dimensiones para el renderizado vectorial SVG */
  svg: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
  };
}

export const planoZones: PlanoZone[] = [
  {
    id: 'accesos',
    name: 'Accesos Principales & Acreditación',
    pabellonBadge: 'Ingreso Oficial',
    note: 'Boleterías oficiales, molinetes con lectura de QR, informes al visitante, guardarropa y puesto de primeros auxilios.',
    stands: ['Boletería Norte', 'Boletería Sur', 'Acreditaciones VIP', 'Mesa de Informes'],
    expositores: ['Control de Accesos & Seguridad Provincial'],
    x: 10,
    y: 50,
    svg: { x: 40, y: 220, width: 120, height: 180, color: 'var(--color-teal)' },
  },
  {
    id: 'central',
    name: 'Pabellón Central e Internacional',
    pabellonBadge: 'Comercio Exterior',
    note: 'Sede institucional de la muestra, con presencia de la Cámara de Comercio Exterior de Jujuy, el CFI y comitivas consulares de la región.',
    stands: ['Stand I-01', 'Stand I-02', 'Mesa de Comercio Exterior'],
    expositores: ['Cámara de Comercio Exterior de Jujuy', 'Consejo Federal de Inversiones (CFI)'],
    x: 35,
    y: 28,
    svg: { x: 220, y: 90, width: 260, height: 170, color: 'var(--color-blue)' },
  },
  {
    id: 'mineria',
    name: 'Pabellón Minería, Litio & Energías Limpias',
    pabellonBadge: 'Industria Estratégica',
    note: 'Complejo tecnológico con stands de gran porte sobre extracción sustentable de litio, energía solar de altura y cadena de proveedores de la Puna.',
    stands: ['Stand M-01', 'Stand M-02', 'Stand M-03', 'Stand M-04'],
    expositores: ['Minera Exar S.A.', 'Sales de Jujuy', 'Parque Solar Cauchari', 'JEMSE'],
    x: 74,
    y: 24,
    svg: { x: 560, y: 80, width: 330, height: 190, color: 'var(--color-gold)' },
  },
  {
    id: 'agro',
    name: 'Pabellón Agroindustrial & Productivo',
    pabellonBadge: 'Producción & Campo',
    note: 'Complejo agroindustrial que congrega a los sectores azucarero, tabacalero, citrícola, bioetanol y maquinaria pesada.',
    stands: ['Stand A-01', 'Stand A-02', 'Stand A-03'],
    expositores: ['Ledesma S.A.A.I.', 'Cooperativa de Tabacaleros de Jujuy', 'Dulces Otito S.A.'],
    x: 30,
    y: 74,
    svg: { x: 200, y: 380, width: 230, height: 160, color: 'var(--color-gold)' },
  },
  {
    id: 'innovacion',
    name: 'Pabellón Innovación & TICs',
    pabellonBadge: 'Economía del Conocimiento',
    note: 'Espacio dedicado a empresas de software, infraestructura cloud, telecomunicaciones, ciberseguridad e inteligencia artificial.',
    stands: ['Stand T-01', 'Stand T-02', 'Stand T-03'],
    expositores: ['ClusteAR TICs', 'Nubeliu Cloud Solutions', 'Telecom Argentina'],
    x: 56,
    y: 68,
    svg: { x: 470, y: 360, width: 200, height: 170, color: 'var(--color-magenta)' },
  },
  {
    id: 'cultura',
    name: 'Pabellón Cultura, Artesanías & Diseño',
    pabellonBadge: 'Identidad Jujeña',
    note: 'Exhibición de tejidos andinos en telar tradicional, alfarería artística, orfebrería y piezas premiadas con identidad provincial.',
    stands: ['Stand C-01', 'Stand C-02'],
    expositores: ['Red de Telanderas de Jujuy', 'Asociación de Ceramistas de San Antonio'],
    x: 43,
    y: 49,
    svg: { x: 340, y: 280, width: 190, height: 85, color: 'var(--color-magenta)' },
  },
  {
    id: 'auditorio',
    name: 'Auditorio Principal & Sala Belgrano',
    pabellonBadge: 'Conferencias & B2B',
    note: 'Centro de convenciones climatizado donde se desarrollan los actos de apertura, rondas internacionales de negocios y paneles técnicos.',
    stands: ['Auditorio Central (450 cap)', 'Sala Belgrano B2B'],
    expositores: ['Comisión Organizadora ExpoJuy 2026'],
    x: 82,
    y: 50,
    svg: { x: 720, y: 290, width: 190, height: 110, color: 'var(--color-blue)' },
  },
  {
    id: 'gastronomico',
    name: 'Patio Gastronómico "Sabores Jujeños"',
    pabellonBadge: 'Gastronomía & Música',
    note: 'Área al aire libre con food trucks de cocina regional, bodegas de extrema altura, cooperativas andinas y escenario de espectáculos.',
    stands: ['Stand G-01', 'Stand G-02', 'Stand G-03', 'Stand G-04', 'Sector Food Trucks'],
    expositores: ['Bodega El Fernando', 'Cooperativa Agroganadera Puna', 'Mieles del Valle y Quebrada', 'Viñedos de la Quebrada'],
    x: 80,
    y: 80,
    svg: { x: 700, y: 420, width: 220, height: 130, color: 'var(--color-teal)' },
  },
];
