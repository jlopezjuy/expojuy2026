/**
 * Agenda oficial de actividades de ExpoJuy 2026.
 *
 * Programa oficial de las 4 jornadas (17 al 20 de septiembre de 2026) en el
 * Predio Ferial Jujuy, con horarios precisos, salas asignadas, oradores y tracks.
 */

export interface AgendaTrack {
  id: string;
  label: string;
}

export interface AgendaItem {
  id: string;
  day: string;
  month: string;
  trackId: string;
  time: string;
  title: string;
  speaker?: string;
  location: string;
  note: string;
}

export const agendaTracks: AgendaTrack[] = [
  { id: 'apertura', label: 'Actos Centrales & Apertura' },
  { id: 'rondas', label: 'Rondas de Negocios & B2B' },
  { id: 'charlas', label: 'Minería & Transición Energética' },
  { id: 'talleres', label: 'Innovación, TICs & Emprendedores' },
  { id: 'cierre', label: 'Cultura & Gastronomía' },
] as const;

export const agendaItems: AgendaItem[] = [
  // --- Jueves 17 de Septiembre ---
  {
    id: 'sesion-17-1',
    day: '17',
    month: 'SEPT.',
    trackId: 'apertura',
    time: '10:00 - 11:30 hs',
    title: 'Apertura de Puertas y Acreditación General',
    location: 'Punto de Accesos',
    note: 'Habilitación de molinetes con lectura de QR, acreditación de expositores, prensa y público general.',
  },
  {
    id: 'sesion-17-2',
    day: '17',
    month: 'SEPT.',
    trackId: 'apertura',
    time: '11:30 - 13:00 hs',
    title: 'Acto Oficial de Apertura y Corte de Cinta',
    speaker: 'Gobernador de Jujuy y Presidente de la Cámara de Comercio Exterior',
    location: 'Auditorio Principal',
    note: 'Ceremonia institucional inaugural con entonación del Himno Nacional, bendición de las instalaciones y discurso de bienvenida.',
  },
  {
    id: 'sesion-17-3',
    day: '17',
    month: 'SEPT.',
    trackId: 'apertura',
    time: '15:00 - 16:30 hs',
    title: 'Recorrido Oficial de Autoridades y Delegaciones Diplomáticas',
    location: 'Pabellón Central e Internacional',
    note: 'Visita protocolar por los pabellones de la muestra junto a embajadores y comitivas comerciales del Cono Sur.',
  },
  {
    id: 'sesion-17-4',
    day: '17',
    month: 'SEPT.',
    trackId: 'charlas',
    time: '17:00 - 18:30 hs',
    title: 'Panel: El Litio y la Cadena de Proveedores Locales en Jujuy',
    speaker: 'Minera Exar, Sales de Jujuy y JEMSE',
    location: 'Auditorio Principal',
    note: 'Exposición sobre proyectos de extracción sustentable, industrialización del litio y desarrollo de pymes jujeñas.',
  },
  {
    id: 'sesion-17-5',
    day: '17',
    month: 'SEPT.',
    trackId: 'rondas',
    time: '19:30 - 21:00 hs',
    title: 'Brindis de Bienvenida y Networking Empresarial',
    location: 'Sala Belgrano',
    note: 'Espacio de vinculación exclusiva para directivos de empresas expositoras, cámaras binacionales y patrocinadores.',
  },

  // --- Viernes 18 de Septiembre ---
  {
    id: 'sesion-18-1',
    day: '18',
    month: 'SEPT.',
    trackId: 'rondas',
    time: '10:00 - 13:00 hs',
    title: 'Rondas Internacionales de Negocios — Bloque Matutino',
    speaker: 'Consejo Federal de Inversiones (CFI) y Cámara de Comercio Exterior',
    location: 'Sala Belgrano',
    note: 'Reuniones B2B preagendadas entre productores jujeños e importadores de Chile, Bolivia, Paraguay y Brasil.',
  },
  {
    id: 'sesion-18-2',
    day: '18',
    month: 'SEPT.',
    trackId: 'charlas',
    time: '14:30 - 16:00 hs',
    title: 'Foro Agroindustrial: Innovación, Riego y Bioenergías',
    speaker: 'Ledesma S.A.A.I. y Cooperativa de Tabacaleros de Jujuy',
    location: 'Auditorio Principal',
    note: 'Estrategias productivas en caña de azúcar, papel ecológico, citricultura y tecnificación de cultivos.',
  },
  {
    id: 'sesion-18-3',
    day: '18',
    month: 'SEPT.',
    trackId: 'rondas',
    time: '16:30 - 19:00 hs',
    title: 'Rondas Internacionales de Negocios — Bloque Vespertino',
    location: 'Sala Belgrano',
    note: 'Segunda tanda de mesas comerciales enfocadas en alimentos procesados, minerales y servicios tecnológicos.',
  },
  {
    id: 'sesion-18-4',
    day: '18',
    month: 'SEPT.',
    trackId: 'cierre',
    time: '19:30 - 20:30 hs',
    title: 'Cata Guiada de Vinos de Extrema Altura',
    speaker: 'Sommeliers de la Asociación de Vitivinicultores de Jujuy',
    location: 'Patio Gastronómico "Sabores Jujeños"',
    note: 'Degustación dirigida de etiquetas premiadas de la Quebrada de Humahuaca y los Valles Templados.',
  },

  // --- Sábado 19 de Septiembre ---
  {
    id: 'sesion-19-1',
    day: '19',
    month: 'SEPT.',
    trackId: 'charlas',
    time: '10:30 - 12:00 hs',
    title: 'Conferencia: Parque Solar Cauchari y el Futuro Renovable',
    speaker: 'Especialistas en Energía Fotovoltaica e Ingeniería Eléctrica',
    location: 'Auditorio Principal',
    note: 'Detalles operativos de la generación solar a 4.000 msnm y la futura ampliación de la capacidad instalada.',
  },
  {
    id: 'sesion-19-2',
    day: '19',
    month: 'SEPT.',
    trackId: 'talleres',
    time: '14:00 - 15:30 hs',
    title: 'Taller: Transformación Digital y Exportación de Software',
    speaker: 'ClusteAR TICs y Polo Tecnológico Jujuy',
    location: 'Espacio Innovación',
    note: 'Oportunidades de inserción laboral en Servicios Basados en el Conocimiento y desarrollo de productos tech.',
  },
  {
    id: 'sesion-19-3',
    day: '19',
    month: 'SEPT.',
    trackId: 'talleres',
    time: '16:00 - 17:30 hs',
    title: 'Panel: Tejedoras de la Puna, Fibras Andinas y Moda Internacional',
    speaker: 'Red de Telanderas de Jujuy',
    location: 'Pabellón Cultura & Diseño',
    note: 'Proceso de hilado artesanal de vicuña y llama, tintes naturales y comercialización en pasarelas globales.',
  },
  {
    id: 'sesion-19-4',
    day: '19',
    month: 'SEPT.',
    trackId: 'cierre',
    time: '18:00 - 19:30 hs',
    title: 'Masterclass de Gastronomía Andina en Vivo',
    speaker: 'Cocineros Jujeños',
    location: 'Patio Gastronómico "Sabores Jujeños"',
    note: 'Elaboración participativa de platos tradicionales: empanadas jujeñas, cazuelas de llama y tamales.',
  },
  {
    id: 'sesion-19-5',
    day: '19',
    month: 'SEPT.',
    trackId: 'cierre',
    time: '20:00 - 21:30 hs',
    title: 'Noche de Música y Danzas Tradicionales',
    location: 'Escenario Cultural',
    note: 'Espectáculo abierto con cuerpos de danza y conjuntos de música andina de las cuatro regiones provinciales.',
  },

  // --- Domingo 20 de Septiembre ---
  {
    id: 'sesion-20-1',
    day: '20',
    month: 'SEPT.',
    trackId: 'talleres',
    time: '11:00 - 12:30 hs',
    title: 'Taller de Cerámica y Arcillas de San Antonio para la Familia',
    speaker: 'Asociación de Alfareros de San Antonio',
    location: 'Espacio Talleres',
    note: 'Actividad interactiva para niños y adultos modelando piezas de barro con técnicas tradicionales.',
  },
  {
    id: 'sesion-20-2',
    day: '20',
    month: 'SEPT.',
    trackId: 'apertura',
    time: '15:30 - 17:00 hs',
    title: 'Conferencia de Cierre: Balance Comercial y Proyecciones 2027',
    speaker: 'Comisión Directiva de la Cámara de Comercio Exterior',
    location: 'Auditorio Principal',
    note: 'Presentación de cifras oficiales de asistencia, intenciones de negocios y acuerdos comerciales alcanzados.',
  },
  {
    id: 'sesion-20-3',
    day: '20',
    month: 'SEPT.',
    trackId: 'apertura',
    time: '17:30 - 19:00 hs',
    title: 'Entrega de Premios a los Mejores Stands y Menciones Especiales',
    location: 'Auditorio Principal',
    note: 'Distinción a las empresas más destacadas en diseño de stand, innovación sustentable y atención al público.',
  },
  {
    id: 'sesion-20-4',
    day: '20',
    month: 'SEPT.',
    trackId: 'cierre',
    time: '19:30 - 21:30 hs',
    title: 'Gran Festival Folclórico de Cierre',
    location: 'Escenario Cultural',
    note: 'Cierre festivo de ExpoJuy 2026 con destacadas agrupaciones musicales jujeñas y fuegos no sonoros.',
  },
];
