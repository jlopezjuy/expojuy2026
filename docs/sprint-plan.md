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

### Sprint 0 · Documentación oficial (sin código)

No ejecutable por un asistente de código — gestión de equipo. Incluido para que quede
trazabilidad completa del plan:

- Mockup navegable (Figma/Adobe XD/Penpot) — usar `docs/design-spec.md` como base.
- Memoria descriptiva en PDF.
- Declaración de uso de IA.
- Formulario de inscripción + integrantes del equipo.
- Reescribir `README.md` con instrucciones reales del proyecto (hoy es el starter genérico de Astro).

**DoD:** los 4 entregables de Anexo III existen como archivos/links concretos.

### Sprint 1 · Identidad institucional real

| # | Tarea | Archivos | Esfuerzo |
|---|---|---|---|
| 1.1 | Reemplazar el isotipo inventado por el logo oficial (extraer SVG de `recursos/EXPOJUY_Logo2026/RGB/expojuy26_isologotipo.pdf` o vectorizar el `.png`) | `src/components/ui/Logo.astro` | M |
| 1.2 | Convertir `recursos/Fuentes_Oficiales/Ambit-*.otf` a woff2 y declarar `@font-face` local, reemplazando Playfair Display/Manrope | `astro.config.mjs`, `src/styles/global.css` | M |
| 1.3 | Revisar la paleta de color (hoy documentada como "INFERRED" en `docs/design-spec.md`) contra el Kit de Diseño oficial; si no hay paleta HEX documentada, dejarlo asentado, no inventar | `src/styles/global.css` | S |

**DoD:** ningún componente referencia Google Fonts ni el SVG inventado; `npm run build` sigue en verde.

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
