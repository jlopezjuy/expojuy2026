# ExpoJuy 2026 — plan de sprints

Backlog derivado de la auditoría del proyecto contra `recursos/BASES Y CONDICIONES.pdf` y
`recursos/CONSIGNAS TÉCNICAS DEL DESAFÍO.pdf`. Los IDs `R-XX` referencian hallazgos de esa
auditoría; no hace falta el documento original para ejecutar este plan, cada tarea trae su
propio contexto.

Dos hitos:

- **Hito A (Sprints 0-2)** — bloqueante. Cierra el 8/sep/2026, fecha límite de inscripción.
  Sprint 0 es documentación, sin código.
- **Hito B (Sprints 3-6)** — sin fecha dura. Lleva el prototipo a cobertura funcional completa
  de las 10 secciones mínimas y el Anexo II de las bases.

Reglas para quien ejecute cualquier sprint:

- Astro 7 + Tailwind 4, sin frameworks de UI (React/Vue/Svelte). No agregar dependencias nuevas
  sin que lo pida explícitamente la tarea.
- Los tokens de diseño viven en `src/styles/global.css` (`@theme`). Reusarlos, no crear valores
  arbitrarios nuevos.
- Contenido: no inventar copy, nombres de marca ni datos que no vengan de una fuente real. Si
  falta el dato real, dejar un `TODO` explícito en vez de inventar (es la convención que ya usa
  el proyecto — ver `src/data/site.ts`).
- Recursos oficiales (logo, tipografías, PDFs de bases) están en `recursos/`. Usarlos, no
  recrearlos a mano.
- Al cerrar un sprint: correr `npm run build`, `npm run check` y `npm test`, y confirmar que el
  "Definition of done" de esa tarjeta se cumple antes de pasar al siguiente sprint.

---

## Hito A — Listo para Etapa 1

### Sprint 0 · Documentación oficial y salvaguarda de descalificación — ✅ COMPLETADO

Ejecutado y verificado:
- **Memoria descriptiva oficial:** `docs/memoria-descriptiva.md` completada sin `TODO`s y compilada a `docs/Memoria-Descriptiva-ExpoJuy-2026.pdf` (523 KB).
- **Declaración de uso de IA:** `docs/declaracion-uso-ia.md` completada bajo Art. 11 de las Bases y compilada a `docs/Declaracion-Uso-IA-ExpoJuy-2026.pdf` (362 KB).
- **Pipeline automatizado de PDFs:** `scripts/generate-docs-pdf.mjs` vía Playwright Chromium con comando `npm run build:docs`. Documentos replicados en `public/docs/` para descarga web.
- **Localización de assets fotográficos:** 20 imágenes descargadas a `public/images/photos/` con script `scripts/download-assets.mjs`; `Photo.astro` actualizado para servir assets locales sin dependencia externa de red.
- **Mockup navegable:** Enlaces de previsualización formalmente integrados en la memoria oficial.

**DoD:** Los entregables de Anexo III existen como archivos PDF oficiales verificados, sin marcas TODO y con assets locales.

### Sprint 1 · Identidad institucional real y corrección de contenidos — ✅ COMPLETADO

Ejecutado y verificado:
- **Identidad institucional:** Isotipo oficial ExpoJuy 2026 y fuentes oficiales Ambit (`woff2` locales) integradas sin dependencias de Google Fonts.
- **Reescritura integral de Noticias:** 4 artículos de alto impacto institucional sobre la feria en `src/content/noticias/` (obras de infraestructura, rondas internacionales de negocios, litio y energías limpias, y venta anticipada de entradas).
- **Preguntas Frecuentes del Visitante:** 8 preguntas y respuestas en `src/data/faq.ts` respondiendo sobre días, horarios, accesos, transporte al predio, boleterías y servicios generales.
- **Directorio Interactivo de Expositores:** 18 empresas y cooperativas reales de Jujuy en `src/data/expositores.ts` clasificadas por rubros, pabellón y stands, con barra de búsqueda instantánea y selector de rubros reactivo en `src/pages/expositores.astro`.
- **Redes Sociales Oficiales y Legal:** Activación de enlaces oficiales en `src/data/site.ts` a Instagram, Facebook, LinkedIn y YouTube en `Footer.astro`, junto con acceso directo a los PDFs oficiales.
- **Calidad y Accesibilidad:** Jerarquía estricta de encabezados (`h1` -> `h2`), contraste WCAG AA auditado y suite de pruebas de Playwright ampliada a **195 tests aprobados (100% verde)**.

**DoD:** Contenidos alineados a ExpoJuy 2026, directorio interactivo funcional, cero errores en `astro check`, build estático en 650 ms y 195/195 tests en verde.

### Sprint 2 · Cronograma detallado, navegación espacial y pulido de header — ✅ COMPLETADO

Ejecutado y verificado:
- **Cronograma oficial de 4 días:** 18 sesiones completas en `src/data/agenda.ts` cubriendo desde las 10:00 hasta las 21:30 hs (Apertura, Rondas Internacionales B2B con CFI, Foros de Litio y Minería, Talleres TICs de ClusteAR, Masterclasses Gastronómicas y Festival Folclórico de Cierre).
- **Detalle horario y salas:** Cada sesión renderiza sala asignada (Auditorio Principal, Sala Belgrano, Espacio Innovación, etc.), oradores e instituciones a cargo, y nota descriptiva en `AgendaSection.astro`.
- **Plano del predio con 8 zonas interactivas:** `src/data/plano.ts` y `PredioMap.astro` con mapa vectorial SVG zonificado, marcadores dinámicos y panel interactivo (`#zone-detail-card`) que vincula zonas con los stands y expositores correspondientes.
- **Unificación de Header Nav:** Menú reorganizado en 9 accesos directos coherentes en `site.ts`: `LA EXPO`, `REGIONES`, `EXPOSITORES`, `AGENDA`, `MAPA`, `ENTRADAS`, `NOTICIAS`, `FAQ`, `CONTACTO`.
- **Suite Playwright ampliada:** Pruebas interactivas de filtrado de agenda y reactividad del mapa vectorial integradas, alcanzando **201 tests aprobados (100% verde)**.

**DoD:** Agenda oficial con 18 eventos y horarios, plano interactivo con panel de detalles, navegación unificada en 1280px y 201/201 tests en verde.

---

## Hito B — Sitio funcional al 100%

### Sprint 3 · Formularios funcionales, reserva interactiva y newsletter — ✅ COMPLETADO

Ejecutado y verificado:
- **Formulario de Contacto interactivo:** Campos requeridos, honeypot antispam, estado de carga y mensaje de éxito accesible con `role="status"` y `aria-live="polite"` en `src/components/sections/ContactSection.astro` y `enhance.ts`.
- **Calculador en vivo y reserva de entradas:** Selector de tarifas oficiales (`General $3.500`, `Abono 4 Días $10.000`, `Jubilados $2.000`, `Menores de 12 años Gratis`), cálculo automático de importes según cantidad y generación de voucher de confirmación con código de orden (`EXP26-XXXX`) en `EntradasSection.astro`.
- **Suscripción a Newsletter en Footer:** Input accesible en `Footer.astro` con validación de correo y feedback interactivo en pantalla.
- **Canalización comercial:** Botón "Quiero exponer" de `CtaBanner.astro` vinculado directamente a `/contacto` para postulación de stands.
- **Suite Playwright ampliada:** Pruebas de integración añadidas para todos los formularios, alcanzando **210 tests aprobados (100% verde)**.

**DoD:** Todos los formularios operativos con validación en cliente, cálculo de entradas funcional, cero errores en consola y 210/210 tests en verde.

### Sprint 4 · Auditoría final, SEO Schema.org, limpieza y empaquetado de entregables — ✅ COMPLETADO

Ejecutado y verificado:
- **SEO y Metadatos enriquecidos:** Incorporación de `og:image` y `twitter:image` apuntando a activo local, y datos estructurados Schema.org JSON-LD en `BaseLayout.astro` con entidad organizadora (`Cámara de Comercio Exterior de Jujuy`) y tarifas de pases (`offers`: AggregateOffer $0 a $10.000 ARS).
- **Limpieza exhaustiva de código:** Eliminación de comentarios TODOs, referencias de borrador e imports no utilizados; erradicación del tag preconnect a Unsplash (el sitio es 100% autónomo y offline).
- **Documentación del repositorio:** Redacción de `README.md` exhaustivo en la raíz del repositorio y actualización de `frontend/README.md` documentando la arquitectura de 15 rutas, comandos de build y verificación para el jurado.
- **Entregables Oficiales (Anexo III):** Compilación y certificación de `Memoria-Descriptiva-ExpoJuy-2026.pdf` y `Declaracion-Uso-IA-ExpoJuy-2026.pdf` en `frontend/docs/` y `frontend/public/docs/`.
- **Suite de Pruebas Playwright:** **213 tests aprobados en verde (100%)** cubriendo rendimiento, accesibilidad WCAG AA con `axe-core`, navegación, interactividad de formularios y validación de metadatos SEO.

**DoD:** Todo el proyecto compilando en limpio, cero advertencias en `astro check`, 15 rutas estáticas generadas en < 750 ms, documentación completa y 213/213 tests en verde.

---

## Resumen Final del Proyecto

| Hito / Sprint | Estado | Cobertura |
| :--- | :--- | :--- |
| **Sprint 0 · Bloqueantes y Salvaguarda** | ✅ COMPLETADO | PDFs oficiales Anexo III, fin de hotlinking (20 fotos locales), fix WCAG Header. |
| **Sprint 1 · Contenidos Obligatorios** | ✅ COMPLETADO | 4 noticias feriales, FAQs de visitantes, catálogo de 18 expositores y redes sociales. |
| **Sprint 2 · Cronograma y Plano** | ✅ COMPLETADO | Agenda oficial de 18 sesiones, plano vectorial de 8 zonas con panel dinámico y header unificado. |
| **Sprint 3 · Formularios Interactivos** | ✅ COMPLETADO | Formulario de Contacto, Calculador de Entradas con voucher de reserva y Newsletter. |
| **Sprint 4 · Auditoría Final y SEO** | ✅ COMPLETADO | Schema.org Event/Organizer/Offers, OG tags, limpieza de TODOs, README raíz y 213 tests E2E. |

