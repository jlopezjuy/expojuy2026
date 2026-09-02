/**
 * Agenda de actividades (Anexo II, funcionalidad 4.3).
 *
 * TODO(Sprint 4.3): la agenda oficial con horarios, tracks y sesiones no está en
 * el repo. No se inventan sesiones; el mecanismo queda listo y los bloques usan
 * los temas reales de agendaDays (fuente: src/data/site.ts).
 *
 * `tracks` son los cuatro temas diarios reales del evento. Los `items` mapean esos
 * temas día por día; `time` queda vacío y `note` indica que no hay horarios aún.
 */

export interface AgendaTrack {
  id: string;
  label: string;
}

export interface AgendaItem {
  day: string;
  month: string;
  trackId: string;
  title: string;
  note: string;
  time: string;
}

export const agendaTracks: AgendaTrack[] = [
  { id: 'apertura', label: 'Apertura' },
  { id: 'rondas', label: 'Rondas de negocios' },
  { id: 'charlas', label: 'Charlas & Talleres' },
  { id: 'cierre', label: 'Cierre & Experiencias' },
] as const;

export const agendaItems: AgendaItem[] = [
  {
    day: '17',
    month: 'SEPT.',
    trackId: 'apertura',
    title: 'Apertura',
    note: 'Horarios y sesiones en confirmación',
    time: '',
  },
  {
    day: '18',
    month: 'SEPT.',
    trackId: 'rondas',
    title: 'Rondas de negocios',
    note: 'Horarios y sesiones en confirmación',
    time: '',
  },
  {
    day: '19',
    month: 'SEPT.',
    trackId: 'charlas',
    title: 'Charlas & Talleres',
    note: 'Horarios y sesiones en confirmación',
    time: '',
  },
  {
    day: '20',
    month: 'SEPT.',
    trackId: 'cierre',
    title: 'Cierre & Experiencias',
    note: 'Horarios y sesiones en confirmación',
    time: '',
  },
] as const;
