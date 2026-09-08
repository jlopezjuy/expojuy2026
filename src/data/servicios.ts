/**
 * Servicios al visitante — ExpoJuy 2026.
 *
 * PROVENIENCIA: ningún servicio de este archivo es información nueva. Cada
 * entrada normaliza texto que ya existía en el repositorio como prosa, y
 * declara su origen en el campo `fuente`. Las dos fuentes son:
 *
 *   - `faq.ts`   → respuestas oficiales sobre estacionamiento y servicios del
 *                  recinto (`faq[4]` y `faq[7]`).
 *   - `plano.ts` → nota y stands de la zona `accesos`.
 *
 * El objetivo es que consultas como "¿dónde están los baños?" tengan un dato
 * estructurado que responder, en lugar de depender de que el visitante lea una
 * respuesta de FAQ completa.
 *
 * TODO(organización): la ubicación puntual de cada servicio no está publicada.
 * `zoneId` sólo se completa cuando la fuente indica una zona concreta del
 * plano; `null` significa "distribuido / sin ubicación puntual publicada" y la
 * UI debe decirlo así, nunca inventar un punto en el mapa.
 */

export const tiposServicio = [
  'sanitario',
  'estacionamiento',
  'acceso',
  'informacion',
  'asistencia',
  'conectividad',
  'financiero',
  'descanso',
  'gastronomia',
  'escenario',
] as const;

export type TipoServicio = (typeof tiposServicio)[number];

export interface Servicio {
  id: string;
  nombre: string;
  tipo: TipoServicio;
  descripcion: string;
  /** Zona de `plano.ts` cuando la fuente la indica; `null` si está distribuido. */
  zoneId: string | null;
  /** Texto que la UI muestra cuando `zoneId` es null. */
  ubicacionTexto: string;
  /** Archivo del que se normalizó el dato. Auditable, no decorativo. */
  fuente: string;
  accesible?: boolean;
}

export const servicios: Servicio[] = [
  {
    id: 'sanitarios',
    nombre: 'Sanitarios',
    tipo: 'sanitario',
    descripcion:
      'Sanitarios accesibles y adaptados disponibles en cada pabellón de la muestra.',
    zoneId: null,
    ubicacionTexto: 'En cada pabellón del predio',
    fuente: 'faq.ts — "¿Qué servicios adicionales se ofrecen dentro del recinto?"',
    accesible: true,
  },
  {
    id: 'estacionamiento',
    nombre: 'Estacionamiento',
    tipo: 'estacionamiento',
    descripcion:
      'Playa de estacionamiento custodiada con capacidad para más de 1.500 vehículos, con sectores señalizados de prioridad para personas con movilidad reducida y comitivas oficiales.',
    zoneId: null,
    ubicacionTexto: 'Predio de Ciudad Cultural',
    fuente: 'faq.ts — "¿Hay estacionamiento disponible dentro del predio?"',
    accesible: true,
  },
  {
    id: 'primeros-auxilios',
    nombre: 'Primeros auxilios',
    tipo: 'asistencia',
    descripcion:
      'Puestos de asistencia médica con personal de guardia durante las cuatro jornadas.',
    zoneId: 'accesos',
    ubicacionTexto: 'Accesos Principales & Acreditación',
    fuente: 'plano.ts — zona `accesos` · faq.ts — servicios del recinto',
  },
  {
    id: 'mesa-informes',
    nombre: 'Mesa de Informes',
    tipo: 'informacion',
    descripcion:
      'Punto de información al visitante para consultas sobre pabellones, agenda y ubicación de stands.',
    zoneId: 'accesos',
    ubicacionTexto: 'Accesos Principales & Acreditación',
    fuente: 'plano.ts — zona `accesos`, stand "Mesa de Informes"',
  },
  {
    id: 'boleterias',
    nombre: 'Boleterías',
    tipo: 'acceso',
    descripcion:
      'Boletería Norte y Boletería Sur para compra presencial de entradas, más molinetes con lectura de QR para entradas anticipadas.',
    zoneId: 'accesos',
    ubicacionTexto: 'Accesos Principales & Acreditación',
    fuente: 'plano.ts — zona `accesos`, stands "Boletería Norte" / "Boletería Sur"',
  },
  {
    id: 'acreditaciones',
    nombre: 'Acreditación de expositores y prensa',
    tipo: 'acceso',
    descripcion:
      'Mostrador de acreditación para expositores, prensa y comitivas, incluido el sector VIP.',
    zoneId: 'accesos',
    ubicacionTexto: 'Accesos Principales & Acreditación',
    fuente: 'plano.ts — zona `accesos`, stand "Acreditaciones VIP"',
  },
  {
    id: 'guardarropa',
    nombre: 'Guardarropa',
    tipo: 'descanso',
    descripcion: 'Servicio de guardarropa para el público en el ingreso al predio.',
    zoneId: 'accesos',
    ubicacionTexto: 'Accesos Principales & Acreditación',
    fuente: 'plano.ts — zona `accesos`',
  },
  {
    id: 'wifi',
    nombre: 'Wi-Fi libre',
    tipo: 'conectividad',
    descripcion: 'Conexión Wi-Fi libre de alta velocidad en el predio.',
    zoneId: null,
    ubicacionTexto: 'En todo el predio',
    fuente: 'faq.ts — "¿Qué servicios adicionales se ofrecen dentro del recinto?"',
  },
  {
    id: 'cajeros',
    nombre: 'Cajeros automáticos',
    tipo: 'financiero',
    descripcion: 'Cajeros automáticos móviles disponibles dentro del recinto.',
    zoneId: null,
    ubicacionTexto: 'En el predio',
    fuente: 'faq.ts — "¿Qué servicios adicionales se ofrecen dentro del recinto?"',
  },
  {
    id: 'areas-descanso',
    nombre: 'Áreas de descanso',
    tipo: 'descanso',
    descripcion: 'Sectores de descanso distribuidos en el predio.',
    zoneId: null,
    ubicacionTexto: 'En el predio',
    fuente: 'faq.ts — "¿Qué servicios adicionales se ofrecen dentro del recinto?"',
  },
  {
    id: 'patio-gastronomico',
    nombre: 'Patio Gastronómico "Sabores Jujeños"',
    tipo: 'gastronomia',
    descripcion:
      'Área al aire libre con food trucks de cocina regional, bodegas de extrema altura y cooperativas andinas.',
    zoneId: 'gastronomico',
    ubicacionTexto: 'Patio Gastronómico "Sabores Jujeños"',
    fuente: 'plano.ts — zona `gastronomico` · faq.ts — servicios del recinto',
  },
  {
    id: 'escenario-cultural',
    nombre: 'Escenario Cultural',
    tipo: 'escenario',
    descripcion:
      'Escenario de espectáculos del patio gastronómico, sede de la noche de música y danzas tradicionales y del festival folclórico de cierre.',
    zoneId: 'gastronomico',
    ubicacionTexto: 'Patio Gastronómico "Sabores Jujeños"',
    fuente: 'plano.ts — zona `gastronomico` · agenda.ts — sesiones en "Escenario Cultural"',
  },
  {
    id: 'auditorio-principal',
    nombre: 'Auditorio Principal',
    tipo: 'escenario',
    descripcion:
      'Centro de convenciones climatizado con capacidad para 450 personas, sede de los actos de apertura y cierre, conferencias y paneles técnicos.',
    zoneId: 'auditorio',
    ubicacionTexto: 'Auditorio Principal & Sala Belgrano',
    fuente: 'plano.ts — zona `auditorio`, stand "Auditorio Central (450 cap)"',
  },
];
