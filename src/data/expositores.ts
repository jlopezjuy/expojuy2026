/**
 * ExpoJuy 2026 — Directorio oficial de expositores.
 *
 * Padrón representativo de empresas e instituciones participantes de la muestra
 * ferial, clasificadas por rubro productivo, pabellón asignado y datos de contacto.
 */

export interface Expositor {
  id: string;
  nombre: string;
  rubro: 'Minería y Energía' | 'Agroindustria' | 'Tecnología' | 'Alimentos & Bebidas' | 'Artesanías & Textiles' | 'Institucional';
  pabellon: string;
  stand: string;
  descripcion: string;
  contacto: string;
}

export const rubrosExpositores = [
  'Todos',
  'Minería y Energía',
  'Agroindustria',
  'Tecnología',
  'Alimentos & Bebidas',
  'Artesanías & Textiles',
  'Institucional',
] as const;

export type RubroExpositor = (typeof rubrosExpositores)[number];

export const expositores: Expositor[] = [
  {
    id: 'minera-exar',
    nombre: 'Minera Exar S.A.',
    rubro: 'Minería y Energía',
    pabellon: 'Pabellón Minería & Litio',
    stand: 'M-01',
    descripcion: 'Operadora del proyecto de carbonato de litio Cauchari-Olaroz, con estándares internacionales de sostenibilidad y desarrollo comunitario.',
    contacto: 'www.mineraexar.com.ar',
  },
  {
    id: 'sales-de-jujuy',
    nombre: 'Sales de Jujuy',
    rubro: 'Minería y Energía',
    pabellon: 'Pabellón Minería & Litio',
    stand: 'M-02',
    descripcion: 'Producción de litio de alta pureza para exportación global y fomento de la cadena de valor en proveedores locales de la Puna.',
    contacto: 'www.salesdejujuy.com',
  },
  {
    id: 'cauchari-solar',
    nombre: 'Parque Solar Cauchari',
    rubro: 'Minería y Energía',
    pabellon: 'Pabellón Minería & Litio',
    stand: 'M-03',
    descripcion: 'La planta de energía fotovoltaica más alta del mundo a 4.000 msnm, inyectando energía limpia a la matriz interconectada nacional.',
    contacto: 'energia.jujuy.gob.ar',
  },
  {
    id: 'jemse',
    nombre: 'JEMSE — Jujuy Energía y Minería S.E.',
    rubro: 'Minería y Energía',
    pabellon: 'Pabellón Minería & Litio',
    stand: 'M-04',
    descripcion: 'Empresa estatal provincial impulsora de proyectos mineros, energéticos, geotérmicos y de agregado de valor en litio.',
    contacto: 'www.jemse.gob.ar',
  },
  {
    id: 'ledesma',
    nombre: 'Ledesma S.A.A.I.',
    rubro: 'Agroindustria',
    pabellon: 'Pabellón Agroindustrial',
    stand: 'A-01',
    descripcion: 'Líder agroindustrial en azúcar, papel natural de caña de azúcar, frutas frescas, jugos cítricos, alcohol y bioetanol.',
    contacto: 'www.ledesma.com.ar',
  },
  {
    id: 'coop-tabacaleros',
    nombre: 'Cooperativa de Tabacaleros de Jujuy',
    rubro: 'Agroindustria',
    pabellon: 'Pabellón Agroindustrial',
    stand: 'A-02',
    descripcion: 'Acopio, procesamiento y exportación de tabaco Virginia de máxima calidad hacia más de 20 destinos internacionales.',
    contacto: 'www.cooptabjujuy.com.ar',
  },
  {
    id: 'dulces-otito',
    nombre: 'Dulces Otito S.A.',
    rubro: 'Agroindustria',
    pabellon: 'Pabellón Agroindustrial',
    stand: 'A-03',
    descripcion: 'Elaboración tradicional de dulces, mermeladas, conservas y salsas con frutas y hortalizas cosechadas en los Valles de Jujuy.',
    contacto: 'www.otito.com.ar',
  },
  {
    id: 'bodega-el-fernando',
    nombre: 'Bodega El Fernando — Valles Templados',
    rubro: 'Alimentos & Bebidas',
    pabellon: 'Pabellón Sabores Jujeños',
    stand: 'G-01',
    descripcion: 'Vinos de altura y producción vitivinícola boutique reconocida por sus varietales Malbec y Torrontés de terruño andino.',
    contacto: 'contacto@bodegaelfernando.com.ar',
  },
  {
    id: 'coop-puna',
    nombre: 'Cooperativa Agroganadera de la Puna',
    rubro: 'Alimentos & Bebidas',
    pabellon: 'Pabellón Sabores Jujeños',
    stand: 'G-02',
    descripcion: 'Carne de llama certificada, papas andinas ancestrales, quinoa y maíz capia producidos por familias de comunidades originarias.',
    contacto: 'info@cooperativapuna.org',
  },
  {
    id: 'mieles-quebrada',
    nombre: 'Mieles del Valle y Quebrada',
    rubro: 'Alimentos & Bebidas',
    pabellon: 'Pabellón Sabores Jujeños',
    stand: 'G-03',
    descripcion: 'Mieles monoflorales de flora nativa del monte jujeño, polen y derivados apícolas con sello de calidad Jujuy Origen.',
    contacto: 'mielesdejujuy@gmail.com',
  },
  {
    id: 'vinedos-altura',
    nombre: 'Viñedos de la Quebrada',
    rubro: 'Alimentos & Bebidas',
    pabellon: 'Pabellón Sabores Jujeños',
    stand: 'G-04',
    descripcion: 'Viticultura extrema en pendientes de Purmamarca y Tilcara, con cepas criollas y vinos biodinámicos galardonados.',
    contacto: 'vinedosquebrada.ar',
  },
  {
    id: 'clustear-tics',
    nombre: 'ClusteAR — Cámara de Empresas TICs de Jujuy',
    rubro: 'Tecnología',
    pabellon: 'Pabellón Innovación & TICs',
    stand: 'T-01',
    descripcion: 'Red de empresas jujeñas dedicadas a la ingeniería de software, ciberseguridad, IoT y servicios basados en el conocimiento.',
    contacto: 'www.clustear.org',
  },
  {
    id: 'nubeliu-jujuy',
    nombre: 'Nubeliu Cloud Solutions',
    rubro: 'Tecnología',
    pabellon: 'Pabellón Innovación & TICs',
    stand: 'T-02',
    descripcion: 'Arquitectura multicloud, devops y transformación digital para medianas y grandes corporaciones de la región.',
    contacto: 'www.nubeliu.com',
  },
  {
    id: 'telecom-b2b',
    nombre: 'Telecom Argentina — Redes Inteligentes',
    rubro: 'Tecnología',
    pabellon: 'Pabellón Innovación & TICs',
    stand: 'T-03',
    descripcion: 'Conectividad de fibra óptica de última milla, soluciones de agro inteligente y conectividad satelital para la industria minera.',
    contacto: 'telecom.com.ar/empresas',
  },
  {
    id: 'red-telanderas',
    nombre: 'Red de Telanderas de Jujuy',
    rubro: 'Artesanías & Textiles',
    pabellon: 'Pabellón Cultura & Diseño',
    stand: 'C-01',
    descripcion: 'Ponchos, ruanas y piezas textiles tejidas en telar criollo y de dos cañas con fibra pura de vicuña y llama teñida con tintes naturales.',
    contacto: 'telanderasjujuy.com',
  },
  {
    id: 'alfareros-san-antonio',
    nombre: 'Asociación de Ceramistas de San Antonio',
    rubro: 'Artesanías & Textiles',
    pabellon: 'Pabellón Cultura & Diseño',
    stand: 'C-02',
    descripcion: 'Alfarería artística y utilitaria elaborada con arcillas locales cocidas en hornos de barro tradicionales.',
    contacto: 'ceramicasanantonio@jujuy.ar',
  },
  {
    id: 'camara-comercio-exterior',
    nombre: 'Cámara de Comercio Exterior de Jujuy',
    rubro: 'Institucional',
    pabellon: 'Pabellón Central',
    stand: 'I-01',
    descripcion: 'Entidad anfitriona y organizadora de ExpoJuy. Asesoramiento en comercio internacional, logística aduanera y promoción de exportaciones.',
    contacto: 'www.ccejujuy.com.ar',
  },
  {
    id: 'cfi-inversiones',
    nombre: 'Consejo Federal de Inversiones (CFI)',
    rubro: 'Institucional',
    pabellon: 'Pabellón Central',
    stand: 'I-02',
    descripcion: 'Organismo federal de financiamiento, asistencia técnica y fomento de las rondas internacionales de negocios para el desarrollo productivo.',
    contacto: 'www.cfi.org.ar',
  },
];
