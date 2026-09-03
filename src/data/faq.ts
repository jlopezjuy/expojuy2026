/**
 * Preguntas frecuentes del visitante y expositor de ExpoJuy 2026.
 *
 * Información oficial sobre accesos, días y horarios, entradas, predio ferial,
 * estacionamiento, servicios al visitante y participación comercial.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export const faq: FaqItem[] = [
  {
    question: '¿Cuáles son los días y horarios de apertura de ExpoJuy 2026?',
    answer:
      'La muestra ferial se desarrollará del jueves 17 al domingo 20 de septiembre de 2026 inclusive. El predio estará abierto al público general y comitivas comerciales todos los días de 10:00 a 22:00 hs de manera ininterrumpida.',
  },
  {
    question: '¿Dónde se realiza la exposición y cómo llegar al predio?',
    answer:
      'Tendrá lugar en el Predio Ferial Jujuy, ubicado en San Salvador de Jujuy. El recinto cuenta con conexión directa a través de las principales avenidas y autopistas de circunvalación, con paradas especiales de transporte público de pasajeros y servicios de colectivos interurbanos durante las cuatro jornadas.',
  },
  {
    question: '¿Cómo adquirir las entradas y qué costo tienen?',
    answer:
      'Las entradas pueden adquirirse de manera anticipada en la sección Entradas de este sitio web oficial con descuento exclusivo, o bien en las boleterías habilitadas en los accesos al predio durante los días del evento. El pase general tiene un costo de $3.500 y el abono por los 4 días $10.000.',
  },
  {
    question: '¿Los menores de edad y jubilados pagan entrada?',
    answer:
      'Los niños menores de 12 años ingresan gratis acompañados por un mayor responsable. Las personas jubiladas y pensionadas cuentan con un 50% de bonificación en boletería presentando su carnet acreditativo correspondiente.',
  },
  {
    question: '¿Hay estacionamiento disponible dentro del predio?',
    answer:
      'Sí, el Predio Ferial Jujuy dispone de una amplia playa de estacionamiento custodiada con capacidad para más de 1.500 vehículos, que incluye sectores exclusivos y señalizados con prioridad para personas con movilidad reducida y comitivas oficiales.',
  },
  {
    question: '¿Qué sectores y rubros productivos se encuentran en la muestra?',
    answer:
      'La feria congrega a los motores económicos más relevantes de la región: minería y litio, energías renovables, agroindustria (azúcar, tabaco, cítricos, legumbres), biotecnología, Servicios Basados en el Conocimiento (software y tecnología), artesanías tradicionales, diseño, gastronomía regional y turismo.',
  },
  {
    question: '¿Cómo participar o reservar un stand comercial como expositor?',
    answer:
      'Las empresas, instituciones y cooperativas interesadas pueden comunicarse con el área comercial de la Cámara de Comercio Exterior de Jujuy a través de nuestro formulario de contacto o en las oficinas institucionales, donde se brinda asesoramiento sobre planos de ubicación, medidas de stands y servicios incluidos.',
  },
  {
    question: '¿Qué servicios adicionales se ofrecen dentro del recinto?',
    answer:
      'El predio cuenta con un completo patio gastronómico con opciones regionales e internacionales, sanitarios accesibles y adaptados en cada pabellón, puestos de primeros auxilios médicos, conexión Wi-Fi libre de alta velocidad, cajeros automáticos móviles y áreas de descanso.',
  },
];
