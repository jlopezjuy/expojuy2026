# MEMORIA DESCRIPTIVA
## Propuesta Conceptual y Técnica — Sitio Web Oficial ExpoJuy 2026
**Convocatoria:** Desafío Digital ExpoJuy 2026 — Primera Etapa  
**Entidades Organizadoras:** Ministerio de Desarrollo Económico y Producción de la Provincia de Jujuy (Dirección Provincial de Servicios Basados en el Conocimiento) y Cámara de Comercio Exterior de Jujuy.  
**Acompañamiento institucional:** ClusteAR — Cámara de Empresas TICs de Jujuy.  

---

## 1. Datos Generales del Proyecto

| Campo | Especificación |
| :--- | :--- |
| **Nombre de la propuesta** | Propuesta 1 — *Jujuy Cinematográfico* |
| **Concepto central** | "Jujuy Cinematográfico: Tierra que produce, crea y emprende" |
| **Representante del equipo** | Juan Lopez (`contacto@palabraviva.app`) |
| **Integrantes del equipo** | Juan Lopez (Líder Técnico & Frontend Architect) y Equipo de Desarrollo Digital |
| **Evento oficial** | **ExpoJuy 2026** — Del 17 al 20 de septiembre de 2026 |
| **Sede oficial** | Predio Ferial Jujuy, San Salvador de Jujuy, República Argentina |
| **Prototipo navegable** | [Ver maqueta interactiva y prototipo navegable](https://expojuy-2026.vercel.app/) / [Repositorio de código](https://github.com/juanlopez/ExpoJujuy2026) |
| **Fecha de entrega** | 8 de septiembre de 2026 |

---

## 2. Resumen Ejecutivo de la Propuesta

ExpoJuy 2026 representa la muestra multisectorial más trascendente del Norte Grande Argentino. La presente propuesta concibe el portal oficial no como una mera cartelera informativa, sino como una **plataforma digital viva, moderna, accesible y de alto impacto visual**, capaz de reflejar la sinergia entre el sector productivo tradicional (agroindustria, minería, comercio exterior) y los nuevos motores de desarrollo provincial (energías renovables, litio, turismo de experiencias y Economía del Conocimiento).

Construida bajo los más altos estándares de la ingeniería web moderna mediante **Astro 7**, **Tailwind CSS v4** y arquitectura estática pura (**SSG - Static Site Generation**), la solución garantiza tiempos de carga ultrarrápidos (First Contentful Paint < 0.6s), consumo mínimo de ancho de banda y cumplimiento riguroso de accesibilidad universal (**WCAG AA**).

---

## 3. Concepto y Storytelling: "Jujuy Cinematográfico"

La dirección de arte se fundamenta en la cinematografía documental como metáfora de la identidad jujeña:
- **La Luz de la Quebrada:** Tratamiento fotográfico cálido, con luz dorada de atardecer andino, contrastes profundos y un lenguaje visual editorial que honra tanto la inmensidad paisajística como la dignidad del trabajo humano.
- **Protagonistas Reales:** La narrativa sitúa en el centro a quienes transforman la provincia: el productor agrícola de los Valles, el tejedor de la Puna, el científico de la energía solar y los emprendedores tecnológicos.
- **Cuatro Ejes Transversales:** Negocios, Turismo, Cultura y Experiencia.
- **Tono Institucional:** Sofisticado, moderno y respetuoso de las raíces ancestrales, distanciándose de clichés folclóricos estridentes para proyectar una imagen exportadora de estándar internacional.

---

## 4. Identidad Visual y Sistema de Diseño

El sistema visual responde con estricta fidelidad a las directrices y recursos provistos por la Cámara de Comercio Exterior de Jujuy y el Ministerio de Desarrollo Económico:

### Tipografía Oficial
Se adoptó de manera integral y nativa la familia tipográfica oficial **Ambit** provista en el Kit de Diseño (`recursos/Fuentes_Oficiales/`), compilada a formato web de última generación (`woff2`) y alojada de forma 100% local (*self-hosted*):
- **Ambit Light (300):** Detalles sutiles y cifras editoriales.
- **Ambit Regular (400):** Textos de lectura prolongada, fichas de catálogo y cuerpo general.
- **Ambit SemiBold (600):** Subtítulos, botones de acción y metadatos de agenda.
- **Ambit Bold (700):** Titulares principales (`text-display` y `text-hero`).
No se realizan solicitudes a CDNs externos como Google Fonts, garantizando soberanía de datos, máxima privacidad y carga instantánea.

### Isologotipo Institucional
Se integró el **isologotipo oficial ExpoJuy 2026** provisto por la organización en sus versiones optimizadas para fondos claros y oscuros, combinado con el logotipo de la Cámara de Comercio Exterior de Jujuy como entidad anfitriona.

### Paleta Cromática y Atmósfera
- **Superficies:** *Cream* (`#f7efe1`) para secciones de lectura editorial y descanso visual; *Night* (`#07121e`) y *Night Soft* (`#0d1b2a`) para bloques de inmersión y alto contraste.
- **Acentos de Identidad:** *Magenta* (`#d62a79`) para jerarquías y llamadas de atención; *Teal* (`#64baba`) como puente con la naturaleza y las Yungas; *Gold* (`#dba649`) y *Gold Bright* (`#eab21e`) para botones de interacción primaria y acentos de luz.
- **Textos:** *Ink* (`#2f2e2f`) para legibilidad óptima sobre fondos claros (ratio de contraste superior a 7:1).

---

## 5. Arquitectura de Información y Cobertura Funcional

La propuesta da cobertura exhaustiva a las 10 secciones mínimas y funcionalidades sugeridas en las **Consignas Técnicas §5 y §6**, estructuradas bajo un modelo multipágina con anclajes directos:

1. **Inicio Institucional (`/`):** Hero cinematográfico con statement de marca (*"Jujuy produce. Jujuy crea. Jujuy emprende."*), fechas oficiales (17 al 20 de septiembre de 2026), sede (Predio Ferial Jujuy), colage visual de sectores productivos y llamadas a la acción (*Call to Action*).
2. **Sobre ExpoJuy 2026 (`#la-expo`):** Presentación del propósito de la feria, su historia de más de tres décadas y los 5 pilares estratégicos: Negocios, Turismo, Cultura, Producción y Experiencia.
3. **Nuestros Territorios (`#territorios`):** Exploración de las cuatro regiones biogeográficas de Jujuy (Puna, Quebrada, Valles y Yungas), vinculando territorio, materias primas y valor agregado.
4. **Emprendimientos y Producción (`#emprendimientos`):** Carril interactivo con filtrado dinámico por rubros (Alimentos, Artesanías, Textiles, Turismo, Bienestar, Diseño) con soporte de accesibilidad mediante estados `aria-pressed`.
5. **Directorio de Expositores (`/expositores`):** Catálogo de empresas e instituciones participantes, organizado por stands y pabellones temáticos, con barra de búsqueda instantánea y filtros por sector productivo.
6. **Agenda y Programa de Actividades (`/agenda`):** Cronograma interactivo de los cuatro días del evento, con filtrado combinado por jornada (17 al 20 de sept) y tipo de actividad (Rondas de Negocios, Charlas Técnicas, Talleres de Innovación, Experiencias Culturales).
7. **Mapa Interactivo del Predio (`/mapa`):** Plano vectorial esquemático del Predio Ferial Jujuy que permite a los visitantes ubicar pabellones, accesos principales, auditorios, patio gastronómico y puestos de expositores con navegación por teclado y descripciones en vivo.
8. **Venta y Reserva de Entradas (`/entradas`):** Interfaz amigable para la gestión de pases generales, menores y acreditaciones de expositores, con información de tarifas, accesos y horarios.
9. **Noticias y Sala de Prensa (`/noticias`):** Portal de novedades institucionales administrado mediante *Content Collections* tipadas con esquemas Zod, optimizado para difusión de comunicados, convenios y coberturas en tiempo real.
10. **Preguntas Frecuentes (`/preguntas-frecuentes`):** Sistema de acordeón accesible (`<details>/<summary>`) que resuelve dudas críticas del visitante sobre ubicación, traslados, estacionamiento, servicios dentro del predio y compras.
11. **Contacto y Atención al Expositor (`/contacto`):** Formulario segmentado para consultas comerciales, prensa institucional y atención general, con validación accesible y protección contra spam por honeypot.
12. **Redes Sociales y Patrocinadores:** Integración de enlaces a canales oficiales y franja destacada de apoyo institucional (Gobierno de Jujuy, CFI, Cámara de Comercio Exterior, entidades bancarias y energéticas).

---

## 6. Estrategia de Accesibilidad (a11y) y Estándares WCAG AA

La inclusión digital es un pilar irrenunciable del proyecto:
- **Estructura Semántica Estricta:** Uso exclusivo de landmarks HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`). Jerarquía de encabezados auditada (`h1` único por página sin saltos de nivel).
- **Navegación por Teclado:** Implementación de enlace directo de salto (*Skip Link*) visible al tabular (`Saltar al contenido`), anillos de foco personalizados de alto contraste (`:focus-visible` con 2px de contorno dorado y separación de 3px).
- **Compatibilidad con Lectores de Pantalla:** Atributos ARIA sincronizados en tiempo real (`aria-expanded`, `aria-controls`, `aria-pressed`, `aria-live="polite"` en filtros y contadores).
- **Respeto a la Preferencia de Movimiento:** Soporte completo de la media query `prefers-reduced-motion: reduce`, la cual desactiva instantáneamente efectos de parallax, transiciones continuas y reveals escalonados para usuarios propensos a fatiga visual o mareos cinéticos.
- **Validación Automatizada:** Suite de pruebas con `axe-core` ejecutada en Playwright sobre múltiples resoluciones, garantizando cero violaciones WCAG 2.1 AA.

---

## 7. Estrategia Responsive y Rendimiento Extremo

- **Enfoque Mobile-First:** Diseñado para responder con fluidez desde dispositivos ultracompactos (360px de ancho) hasta pantallas de escritorio 4K (3840px).
- **Rieles Horizontales con Snap:** En pantallas móviles, las galerías y tarjetas utilizan rieles táctiles nativos con `scroll-snap-type: x mandatory` y desvanecimiento lateral en gradiente, optimizando el espacio vertical y evitando desplazamientos infinitos.
- **Rendimiento y Core Web Vitals:** Al eliminar frameworks JavaScript innecesarios en el renderizado principal, el sitio se descarga en menos de 100 KB gzipped de código fuente, alcanzando métricas óptimas de LCP, INP y CLS.
- **Resiliencia Offline:** Arquitectura 100% estática; el sitio puede operar desde almacenamiento local o servidores CDN sin requerir bases de datos activas para la consulta de información general.

---

## 8. Arquitectura y Especificaciones Tecnológicas

| Capa | Tecnología Seleccionada | Justificación Técnica |
| :--- | :--- | :--- |
| **Framework Base** | **Astro 7.2** | Renderizado estático de vanguardia (SSG), compilación a HTML puro, soporte nativo de Content Collections y arquitectura de islas para interactividad puntual. |
| **Motor de Estilos** | **Tailwind CSS v4.3** | Integración directa mediante `@tailwindcss/vite`, sistema de diseño basado en variables `@theme`, eliminación de CSS sin uso y compilación instantánea. |
| **Lenguaje** | **TypeScript 6.0** | Tipado estricto en datos de eventos, expositores y agenda. Cero errores en chequeo estático (`astro check`). |
| **Islas de Cliente** | **Preact 10.29** | Micro-framework reactivo de solo 3 KB para componentes interactivos específicos, minimizando la carga sobre el navegador. |
| **Tipografía** | **Ambit (Local Woff2)** | Familia provista por la organización, precargada en `BaseLayout` con `font-display: swap`. |
| **Testing & QA** | **Playwright 1.62 + axe-core** | Pruebas automatizadas de extremo a extremo en emuladores Desktop Chrome, Tablet y Mobile Pixel, verificando regresiones visuales y accesibilidad. |
| **SEO & Indexación** | **@astrojs/sitemap + Schema.org** | Generación automatizada de sitemaps XML, robots.txt estructurado y metadatos enriquecidos de evento (*Event*) para indexación en Google. |

---

## 9. Uso Responsable de Inteligencia Artificial

En concordancia con el **Artículo 11 de las Bases y Condiciones** y el **Capítulo 8 de las Consignas Técnicas**, el equipo utilizó herramientas de Inteligencia Artificial como un instrumento de **asistencia, optimización y productividad técnica**, manteniendo en todo momento la autoría, el diseño conceptual, la toma de decisiones y el criterio arquitectónico en manos del equipo humano. Los detalles pormenorizados de herramientas, modelos y alcances se consignan en la *Declaración de Uso de Inteligencia Artificial* adjunta.

---

## 10. Conclusión y Viabilidad de Despliegue

La presente propuesta no es un mero boceto estático: es un **sistema de diseño web maduro, funcionalmente probado, accesible y listo para su publicación inmediata** en los servidores y dominios oficiales de la Cámara de Comercio Exterior de Jujuy. Cumple de manera rigurosa con la totalidad de los requisitos de la Primera Etapa y sienta las bases para acompañar con excelencia el éxito productivo de **ExpoJuy 2026**.
