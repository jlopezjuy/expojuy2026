/**
 * ExpoJuy 2026 — directorio de expositores.
 *
 * Fuente real: listado confirmado por la organización (Anexo II / §5 de las
 * Consignas Técnicas exigen una sección de "Expositores"). Mientras la
 * organización no publique el listado, la colección queda vacía y la UI muestra
 * un estado pendiente honesto en vez de inventar nombres, rubros o stands.
 */

export interface Expositor {
  nombre: string;
  rubro: string;
  stand: string;
  contacto: string;
}

// TODO(Sprint 3.1): listado real de expositores confirmado por la organización
// (nombre, rubro, stand, contacto). No inventar. Reemplazar este array vacío y
// ajustar la grilla del componente Expositores.astro cuando la organización lo
// provea.
export const expositores: Expositor[] = [];
