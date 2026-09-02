/**
 * Preguntas frecuentes del Desafío Digital ExpoJuy 2026.
 *
 * Cada respuesta está redactada exclusivamente a partir de hechos verificables
 * en recursos/BASES Y CONDICIONES.pdf (cronograma de Anexo I) y
 * recursos/CONSIGNAS TÉCNICAS DEL DESAFÍO.pdf. No se inventan datos ni se
 * responde con información que no conste en esas fuentes.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export const faq: FaqItem[] = [
  {
    question: '¿Quiénes pueden participar?',
    answer:
      'Personas mayores de 18 años residentes en la provincia de Jujuy que pertenezcan a alguno de estos grupos: egresados o estudiantes de programas impulsados por la Dirección Provincial de Servicios Basados en el Conocimiento, estudiantes o egresados de instituciones educativas aliadas, desarrolladores web, diseñadores UX/UI, o equipos multidisciplinarios vinculados al desarrollo de software.',
  },
  {
    question: '¿Cómo se participa?',
    answer:
      'La participación se realiza en equipos de entre 2 y 4 integrantes. Cada equipo debe designar un representante, responsable de las comunicaciones con la organización e interlocutor oficial durante todas las etapas del desafío. Ningún participante puede integrar más de un equipo.',
  },
  {
    question: '¿Cuánto cuesta participar?',
    answer: 'La inscripción es gratuita. Se completa el formulario oficial y se presenta la documentación requerida dentro de los plazos establecidos.',
  },
  {
    question: '¿Hasta cuándo me inscribo?',
    answer:
      'La inscripción permanece abierta desde la publicación oficial del concurso hasta el día 8 de septiembre de 2026 a las 23:59 horas (hora oficial de la República Argentina). Finalizado ese plazo no se admiten nuevas inscripciones ni presentaciones de proyectos.',
  },
  {
    question: '¿Qué hay que presentar?',
    answer:
      'Cada equipo presenta un mockup navegable o prototipo, una memoria descriptiva, la explicación conceptual de la propuesta, las tecnologías previstas para el desarrollo y la descripción del uso de herramientas de Inteligencia Artificial, cuando corresponda.',
  },
  {
    question: '¿Cuándo es la evaluación?',
    answer:
      'La comunicación a los equipos preseleccionados es el 11 de septiembre de 2026. El Demo Day y la evaluación presencial se desarrollan el 14 de septiembre de 2026, cuando cada equipo expone su propuesta ante el jurado; ese mismo día se publican los resultados.',
  },
  {
    question: '¿Quién organiza ExpoJuy?',
    answer:
      'Organizan el Ministerio de Desarrollo Económico y Producción de la Provincia de Jujuy (Dirección Provincial de Servicios Basados en el Conocimiento) y la Cámara de Comercio Exterior de Jujuy, con el acompañamiento institucional de ClusteAR.',
  },
  {
    question: '¿Cuándo y dónde es ExpoJuy 2026?',
    answer:
      'ExpoJuy 2026 se celebra del 17 al 20 de septiembre de 2026 en el Predio Ferial Jujuy, San Salvador de Jujuy.',
  },
  {
    question: '¿Cuándo se publican los resultados del desafío?',
    answer:
      'Los resultados de la evaluación se publican el 14 de septiembre de 2026, al cierre del Demo Day. El desarrollo del sitio web ganador se extiende del 15 al 30 de septiembre de 2026, y la publicación del sitio oficial es a partir del 30 de septiembre de 2026.',
  },
];

// TODO(Sprint 3.3): faltan contenidos de visitante sin fuente aprobada (por
// ejemplo, cómo comprar entradas, horarios de acceso o estacionamiento). No se
// inventan: hay que esperar la información oficial de la organización antes de
// agregar estas preguntas.
