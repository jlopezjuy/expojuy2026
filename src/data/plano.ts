/**
 * Fuente de datos del mapa del predio (Anexo II, funcionalidad 4.1).
 *
 * TODO(Sprint 4.1): plano esquemático de referencia; el plano real del Predio
 * Ferial Jujuy no está en el repo. Sustituir cuando la organización lo provea.
 *
 * Las posiciones (x, y) son ilustrativas — porcentajes sobre el contenedor del
 * plano. No representan la disposición real de zonas del predio: la UI lo
 * etiqueta explícitamente como esquemático.
 */

export interface PlanoZone {
  id: string;
  name: string;
  note: string;
  /** Porcentaje horizontal (0-100) del centro del marcador. */
  x: number;
  /** Porcentaje vertical (0-100) del centro del marcador. */
  y: number;
}

export const planoZones: PlanoZone[] = [
  {
    id: 'accesos',
    name: 'Accesos',
    note: 'Punto de ingreso y acreditación.',
    x: 12,
    y: 50,
  },
  {
    id: 'central',
    name: 'Pabellón Central',
    note: 'Núcleo de la muestra.',
    x: 47,
    y: 33,
  },
  {
    id: 'auditorio',
    name: 'Auditorio',
    note: 'Charlas, talleres y presentaciones.',
    x: 79,
    y: 24,
  },
  {
    id: 'institucional',
    name: 'Espacios institucionales',
    note: 'Rondas de negocios y oficinas temporales.',
    x: 64,
    y: 58,
  },
  {
    id: 'puestos',
    name: 'Puestos de expositores',
    note: 'Stands de emprendimientos y productores.',
    x: 33,
    y: 73,
  },
  {
    id: 'gastronomico',
    name: 'Patio Gastronómico',
    note: 'Food trucks y espacios para comer.',
    x: 82,
    y: 74,
  },
] as const;
