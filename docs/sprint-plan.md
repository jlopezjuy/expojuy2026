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

### Sprint 2 · Cerrar todo lo roto + pulido

| # | Tarea | Archivos | Esfuerzo |
|---|---|---|---|
| 2.1 | CTA "Quiero exponer" → enlazar a destino real o a la sección de contacto | `src/components/sections/CtaBanner.astro:36` | S |
| 2.2 | 5 iconos de redes sociales → URLs reales o quitarlos hasta tenerlas | `src/data/site.ts:141-147` | S |
| 2.3 | 11 links del footer en `href: '#'` → destino real o retirarlos del listado | `src/data/site.ts:111-152` | M |
| 2.4 | Nav "VISITAR" → ocultar del menú hasta que exista la sección (`placeholder: true`) | `src/data/site.ts:31` | S |
| 2.5 | Reemplazar el placeholder `"[Párrafo pendiente — ilegible en la referencia]"` por copy real aprobado | `src/components/sections/Emprendimientos.astro:28` | S |
| 2.6 | `npm run check` (astro check) en 0 errores/warnings | — | S |
| 2.7 | Playwright completo + revisión visual manual en mobile/tablet/desktop | `tests/homepage.spec.ts` | M |

**DoD:** cero `href="#"` sin justificar, cero copy placeholder visible, build + check + tests en verde.

---

## Hito B — Sitio funcional al 100%

### Sprint 3 · Secciones obligatorias faltantes

| # | Tarea | Archivos | Esfuerzo |
|---|---|---|---|
| 3.1 | Expositores — directorio real (nombre, rubro, stand, contacto) como página propia | `src/pages/expositores.astro` (nuevo) | L |
| 3.2 | Contacto — sección/página con formulario real (Formspree o backend simple) | nuevo componente | M |
| 3.3 | Preguntas frecuentes — acordeón accesible con contenido real | nuevo componente | M |
| 3.4 | Noticias — content collection de Astro con 3-4 notas iniciales | `src/content/`, `src/pages/noticias/` (nuevo) | L |

**DoD:** las 10 secciones mínimas de Consignas Técnicas §5 existen todas, con contenido real.

### Sprint 4 · Funcionalidades de producto (Anexo II)

| # | Tarea | Archivos | Esfuerzo |
|---|---|---|---|
| 4.1 | Mapa del predio — plano con puntos clicables, sin librería de mapas pesada | nuevo componente | M |
| 4.2 | Compra/gestión de entradas — enlace a plataforma externa o formulario de reserva | nuevo componente | S |
| 4.3 | Agenda completa — grilla con horarios/tracks filtrable, no solo 4 etiquetas | `src/components/sections/FeatureTrio.astro` | L |

**DoD:** las 3 funcionalidades de Anexo II sin cubrir hoy tienen implementación mínima navegable.

### Sprint 5 · Contenido real y arquitectura multipágina

| # | Tarea | Archivos | Esfuerzo |
|---|---|---|---|
| 5.1 | Reemplazar fotografía Unsplash por material real de Jujuy en `src/assets/` + migrar a `astro:assets <Image>` | `src/components/ui/Photo.astro` | L |
| 5.2 | Sponsors — logos reales confirmados con la organización | `src/components/sections/Sponsors.astro` | M |
| 5.3 | Confirmar arquitectura multipágina real (no solo anclas dentro de una landing) | `src/pages/` | M |

**DoD:** cero imágenes hotlinked a dominios externos; el sitio tiene rutas propias.

### Sprint 6 · Performance, SEO y QA final

| # | Tarea | Archivos | Esfuerzo |
|---|---|---|---|
| 6.1 | `sitemap.xml` + `robots.txt` vía `@astrojs/sitemap` | `astro.config.mjs` | S |
| 6.2 | JSON-LD Schema.org Event | `src/layouts/BaseLayout.astro` | S |
| 6.3 | Auditoría de contraste WCAG AA + `axe-core` en Playwright | `tests/homepage.spec.ts` | M |
| 6.4 | QA end-to-end: las 10 secciones en mobile/tablet/desktop, cero errores de consola | — | M |

**DoD:** Lighthouse SEO/A11y/Best Practices en verde, sitemap indexable, sin errores de consola.
