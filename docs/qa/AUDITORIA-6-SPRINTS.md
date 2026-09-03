# Auditoría funcional, visual y técnica — Sprints 1 a 6

**Fecha:** 2026-09-02
**Alcance:** verificación real de lo implementado en Sprints 1-6 (`docs/sprint-plan.md`) contra la app en ejecución. No es la auditoría de cumplimiento contra las bases del concurso (esa ya existe y generó el propio plan de sprints) — es QA de si lo que el plan dice "hecho" funciona de verdad.
**Método:** lectura de código de cada sprint + `npm run build` + `npm run check` + `npm test` (Playwright, 156/156 verde) + navegación real con navegador (Chromium, vía MCP Browser y scripts Playwright ad-hoc) en 5 viewports + inspección de red/consola/DOM. Cero cambios de código durante la auditoría.

---

## 1. Resumen ejecutivo

**Estado general: el sitio es sólido en su base técnica y se navega sin errores de consola, 404 de recursos, ni fallos de build — pero tiene un bug crítico de layout en el header que no fue detectado por la suite automatizada, y dos ítems del propio Sprint 2 (DoD "cero copy placeholder / cero `href="#"`") siguen sin resolverse.**

- **Cumplimiento aproximado:** ~79% de los 24 requisitos verificables de Sprints 1-6 (detalle por sprint abajo). No hay ningún sprint "roto"; el patrón dominante en lo no-cumplido es **contenido real pendiente de la organización** (fotos, listado de expositores, endpoints de formularios, logos de sponsors), ya documentado honestamente en el propio código con TODOs — consistente con la regla del proyecto de "no inventar datos".
- **Bugs confirmados:** 6 (1 Crítico, 2 Altos, 2 Medios, 1 Bajo). Ver sección 3.
- **Requisitos de sprint no cumplidos o parciales:** 8 de 24 (ver tabla maestra, sección 2).
- **Problema crítico:** el CTA principal del header, **"Quiero participar"**, queda parcial o totalmente fuera de la pantalla (inaccesible con mouse/touch) en el rango **1280-1536px de ancho** — que cubre las resoluciones de laptop más comunes del mundo (1366×768, 1440×900, 1280×800). Es una regresión introducida al crecer el menú de 7 a 11 ítems en el Sprint 3 sin revisar el layout del header.
- **Build / check / tests:** `astro build` sin errores ni warnings (12 páginas), `astro check` en 0/0/0, Playwright 156/156 en verde (desktop/tablet/mobile × 3 proyectos), axe-core sin violaciones en home.
- **Principales oportunidades UX/UI:** las secciones "descubrimiento" (Regiones, Emprendimientos, Agenda) son sólidas pero convencionales — hay espacio real para diferenciarse con Jujuy como protagonista (mapa/territorio, texturas, producto regional) sin necesitar librerías pesadas. Detalle en `ANALISIS-ANIMACIONES.md`.

---

## 2. Matriz Sprint → Requisito → Estado (Fase 5)

Leyenda: ✅ CUMPLIDO · ⚠️ PARCIAL · ❌ NO CUMPLIDO · 🚫 NO VERIFICABLE

| Sprint | Requisito | Estado | Evidencia | Problema |
|---|---|---|---|---|
| 1 | 1.1 Logo oficial (isologotipo real) reemplaza SVG inventado | ✅ | `src/components/ui/Logo.astro` usa `src/assets/expojuy-isologotipo.png`; visible en todos los screenshots | — |
| 1 | 1.2 Tipografía Ambit self-hosted, sin Google Fonts | ✅ | `src/styles/global.css` `@font-face` local; `rg` sin coincidencias de `fonts.googleapis`/Playfair/Manrope en `src/` | — |
| 1 | 1.3 Paleta revisada contra kit oficial, decisión documentada | ✅ | Comentario en `global.css` líneas 43-51 documenta la revisión y por qué se mantiene INFERRED | — |
| 2 | 2.1 CTA "Quiero exponer" con destino real | ✅ | `CtaBanner.astro:39` → `https://expojuy.camcomexjujuy.com.ar/` | — |
| 2 | 2.2 Iconos sociales inventados retirados | ✅ | `socials = []` en `site.ts:163`, cero iconos renderizados en footer | — |
| 2 | 2.3 11 links de footer `href="#"` resueltos o retirados | ✅ | `footerColumns` en `site.ts` solo tiene destinos reales (anclas propias, rutas, PDF, URL externa) | — |
| 2 | 2.4 Nav "VISITAR" oculto hasta tener sección | ✅ (superado) | Ya no es placeholder: apunta a `/mapa`, página real del Sprint 4 | — |
| 2 | 2.5 Reemplazar copy placeholder de Emprendimientos | ❌ | `Emprendimientos.astro:28` — texto **"[Párrafo pendiente — ilegible en la referencia]"** sigue renderizado, visible en producción | Ver BUG-003 |
| 2 | 2.6 `astro check` en 0 errores/warnings | ✅ | Ejecutado: "0 errors, 0 warnings, 0 hints" (51 archivos) | — |
| 2 | 2.7 Playwright + revisión visual manual mobile/tablet/desktop | ⚠️ | Playwright: 156/156 verde. Revisión visual manual: esta auditoría encontró BUG-001/002/004/005 a simple vista en 1366-1440px, no reportados antes | La suite automatizada no cubre layout cruzado de viewport; la revisión manual declarada en el DoD no detectó el overflow del header |
| **Sprint 2 — DoD global** ("cero `href="#"` sin justificar, cero copy placeholder") | | ⚠️ | | Persisten 2.5 sin resolver + `href="#"` nuevos fuera del alcance original (FeatureTrio, newsletter) — ver BUG-004/005 |
| 3 | 3.1 Expositores — directorio real (nombre, rubro, stand, contacto) | ⚠️ | `src/data/expositores.ts`: `export const expositores = []` — página y grilla completas, listado vacío | Sin datos reales de la organización; UI muestra "Próximamente" en vez de inventar (correcto por convención), pero el requisito ("directorio real") no está cumplido |
| 3 | 3.2 Contacto — formulario real (Formspree/backend) | ⚠️ | `ContactSection.astro`: `FORM_ENDPOINT = ''` → botón "Enviar mensaje" deshabilitado | Formulario 100% accesible y validado, pero no puede enviarse: falta el endpoint |
| 3 | 3.3 FAQ — acordeón accesible con contenido real | ✅ | `<details>/<summary>` nativo, funciona sin JS; contenido trazado a Bases y Condiciones / Consignas Técnicas (no inventado); test Playwright de toggle pasa | — |
| 3 | 3.4 Noticias — content collection con 3-4 notas | ✅ | `src/content/noticias/` con 4 posts reales, `content.config.ts` tipado con Zod, index + `[slug]` funcionan | — |
| **Sprint 3 — DoD global** ("10 secciones mínimas... con contenido real") | | ⚠️ | | Expositores y Contacto existen como página pero sin contenido/función real todavía |
| 4 | 4.1 Mapa del predio con puntos clicables | ✅ | `PredioMap.astro` — SVG esquemático + 6 botones `data-zone` con `aria-pressed`/live region, lista de respaldo sin JS; probado con click real | Etiquetado honestamente como "esquemático de referencia" (no es el plano oficial) — correcto por convención, no es un incumplimiento |
| 4 | 4.2 Compra/gestión de entradas | ⚠️ | `EntradasSection.astro`: `TICKET_ENDPOINT = ''` → botón "Reservar entradas" deshabilitado | Igual patrón que 3.2: UI completa, sin backend/plataforma real conectada |
| 4 | 4.3 Agenda completa filtrable (no solo 4 etiquetas) | ✅ | `/agenda` con filtro doble (día + jornada), probado interactivamente, `#agenda-count` actualiza correctamente | — |
| **Sprint 4 — DoD global** ("3 funcionalidades... implementación mínima navegable") | | ✅ (con nota) | | Las 3 son navegables; 4.2 queda deshabilitada a propósito hasta tener plataforma oficial |
| 5 | 5.1 Fotografía real de Jujuy + migración a `astro:assets <Image>` | ❌ | `src/data/photos.ts`: 17 fotos, **100% hotlinked a `images.unsplash.com`**; `src/assets/` solo tiene el logo. `astro.config.mjs` mantiene `domains: ['images.unsplash.com']` | DoD explícito decía "cero imágenes hotlinked a dominios externos" — no se cumple, ningún avance de migración |
| 5 | 5.2 Sponsors — logos reales confirmados | ❌ | `Sponsors.astro` renderiza los 8 sponsors como texto plano | `recursos/EXPOJUY_Logo2026/logo_camcomext.png` **ya existe en el repo** (Cámara de Comercio Exterior de Jujuy) y no fue integrado — al menos 1/8 era accionable sin esperar a la organización |
| 5 | 5.3 Arquitectura multipágina real confirmada | ✅ | 9 rutas propias generadas en el build (`/agenda`, `/contacto`, `/entradas`, `/expositores`, `/mapa`, `/noticias`, `/noticias/[slug]`×4, `/preguntas-frecuentes`) + resolución de anclas cross-page verificada (`/#la-expo` navega y hace scroll correctamente) | — |
| **Sprint 5 — DoD global** ("cero imágenes hotlinked... rutas propias") | | ⚠️ | | Rutas propias: sí. Cero hotlinking: no, sigue en 100% |
| 6 | 6.1 `sitemap.xml` + `robots.txt` | ✅ | Build genera `sitemap-index.xml`; test Playwright "robots.txt y el sitemap se sirven y son indexables" pasa | — |
| 6 | 6.2 JSON-LD Schema.org Event | ✅ | `BaseLayout.astro` líneas 27-46, solo en home, datos trazables a `site.ts` | `organizer`/`offers` quedan fuera a propósito (TODO documentado, sin dato confirmado) |
| 6 | 6.3 Contraste WCAG AA + axe-core en Playwright | ✅ (alcance: home) | `tests/homepage.spec.ts` corre axe-core en los 3 proyectos (desktop/tablet/mobile), 0 violaciones | axe-core solo corre sobre `/` — páginas interiores no tienen barrido axe-core automatizado (sí tienen chequeos de heading/alt/consola) |
| 6 | 6.4 QA end-to-end 10 secciones, cero errores de consola | ⚠️ | Cero errores de consola: confirmado en las 9 rutas × 3 viewports (script de auditoría). "QA end-to-end" declarado completo, pero esta auditoría encontró 6 bugs reales no capturados por esa pasada | El QA previo verificó consola/build pero no el layout del header en breakpoints intermedios |
| **Sprint 6 — DoD global** ("Lighthouse en verde, sitemap indexable, sin errores de consola") | | 🚫 (Lighthouse) / ✅ (resto) | | Lighthouse no se corrió como herramienta formal en esta auditoría (no disponible en el entorno) — ver nota en sección 8 |

### Cumplimiento por sprint

| Sprint | Requisitos evaluados | Cumplidos (equiv.) | % aprox. |
|---|---|---|---|
| Sprint 1 — Identidad institucional | 3 | 3.0 | **100%** |
| Sprint 2 — Cerrar lo roto + pulido | 7 | 5.5 | **79%** |
| Sprint 3 — Secciones obligatorias | 4 | 3.0 | **75%** |
| Sprint 4 — Funcionalidades Anexo II | 3 | 2.5 | **83%** |
| Sprint 5 — Contenido real + multipágina | 3 | 1.5 | **50%** |
| Sprint 6 — Performance/SEO/QA final | 4 | 3.5 | **88%** |
| **Total** | **24** | **19.0** | **~79%** |

*(⚠️ PARCIAL cuenta como 0.5 requisito cumplido; el criterio de asignación está justificado renglón por renglón en la tabla maestra.)*

---

## 3. Estado por sprint (detalle narrativo)

### Sprint 1 · Identidad institucional — ✅ 100%

Completo y verificado. El logo oficial (`expojuy-isologotipo.png`) se ve correctamente en header, footer y favicon; la tipografía Ambit está self-hosted en woff2 (4 pesos) con `font-display: swap` y preload de los dos pesos críticos; no queda ninguna referencia a Google Fonts ni al SVG inventado anterior. La decisión de mantener la paleta como "INFERRED" está documentada con la razón exacta (no existe kit de color oficial en `recursos/`, solo los colores del isologotipo). Sin hallazgos.

### Sprint 2 · Cerrar lo roto + pulido — ⚠️ 79%

Seis de siete tareas puntuales están resueltas correctamente y verificadas en producción (CTA real, iconos sociales retirados, footer sin `#` muertos, nav "VISITAR" ahora resuelto de verdad, `astro check` limpio). El punto débil es 2.5: el párrafo placeholder de Emprendimientos **sigue en pantalla tal cual**, con el mismo texto literal `[Párrafo pendiente — ilegible en la referencia]` que el sprint pedía reemplazar — visible para cualquier visitante de la home. Además, el DoD global del sprint ("cero `href="#"` sin justificar, cero copy placeholder visible") no se sostiene si se mira más allá del alcance original de archivos: aparecieron 2 CTAs muertos nuevos en `FeatureTrio.astro` y el formulario de newsletter del footer con `action="#"` sin ningún manejo — ninguno estaba en el alcance de archivos del Sprint 2, pero ambos violan el criterio de aceptación tal como está escrito.

### Sprint 3 · Secciones obligatorias faltantes — ⚠️ 75%

FAQ y Noticias están completos y con contenido real verificado (FAQ trazado a las bases oficiales del concurso; Noticias con 4 posts reales vía content collection tipada). Expositores y Contacto tienen la página, el componente y el layout completamente construidos y accesibles — pero ambos dependen de datos que la organización todavía no entregó: Expositores muestra un estado "Próximamente" honesto en vez de un listado inventado, y Contacto tiene el formulario completo pero con el botón de envío deshabilitado porque no hay endpoint real. Es un patrón consistente y bien manejado (no inventa nada), pero el requisito tal como está escrito en el plan ("directorio real", "formulario real") no está cumplido todavía en el sentido funcional.

### Sprint 4 · Funcionalidades de producto (Anexo II) — ✅ 83% (con nota)

Mapa del predio y Agenda están completos y probados interactivamente (clicks reales en zonas del mapa, filtros combinados de agenda funcionando y actualizando el contador accesible). Entradas repite el mismo patrón que Contacto: formulario completo, deshabilitado por falta de plataforma de venta real. El DoD del sprint pedía explícitamente "implementación mínima navegable" — bajo ese criterio más laxo, las 3 funcionalidades técnicamente lo cumplen; se marca con nota porque "mínima" no es lo mismo que "funcional para el usuario final" en el caso de Entradas.

### Sprint 5 · Contenido real y arquitectura multipágina — ⚠️ 50%

Este es el sprint con menor cumplimiento real. La arquitectura multipágina está sólidamente resuelta (9 rutas propias, navegación cross-page entre anclas y páginas verificada). Pero las dos tareas de contenido real no avanzaron: las 17 fotografías del sitio siguen 100% hotlinked a Unsplash (cero migración a `src/assets/` o `astro:assets <Image>`, tal como pedía explícitamente el DoD), y los 8 sponsors se muestran como texto plano sin ningún logo. El hallazgo más accionable de esta auditoría es que **al menos uno de los logos de sponsor ya existe en el repo** (`recursos/EXPOJUY_Logo2026/logo_camcomext.png`, Cámara de Comercio Exterior de Jujuy) y no fue usado — no todo 5.2 está bloqueado por la organización.

### Sprint 6 · Performance, SEO y QA final — ✅ 88%

Sitemap, robots.txt, JSON-LD Schema.org y la suite de accesibilidad con axe-core están implementados y verificados en verde. La única reserva real es sobre 6.4: el "QA end-to-end... cero errores de consola" que el sprint declara cumplido es cierto en su alcance literal (no hay errores de consola en ninguna ruta/viewport probada), pero esta auditoría — haciendo el mismo tipo de QA visual manual que el sprint pedía — encontró 6 bugs reales que una pasada de consola no puede detectar. Lighthouse como herramienta formal no se ejecutó en este entorno (no disponible); la evaluación de performance/SEO/A11y en la sección 8 es cualitativa, basada en inspección de red, bundle y axe-core.

---

## 4. Bugs encontrados (Fase 9-10)

### BUG-001
**Tipo:** BUG (funcional + responsive) · **Severidad:** Crítico · **Sprint relacionado:** Transversal — regresión sobre Header.astro al crecer el nav en Sprint 3 (no asignado a una tarea puntual) · **Pantalla:** Header, todas las páginas · **Ruta:** `/` (y todas) · **Viewport:** 1280px, 1366px, 1440px, 1536px (desktop/laptop)

**Descripción:** el grupo derecho del header (botón "Quiero participar" + toggle de menú mobile) se renderiza parcial o totalmente fuera del viewport.

**Resultado esperado:** el CTA "Quiero participar" visible y clicable en cualquier resolución de escritorio.

**Resultado actual:** medido con `getBoundingClientRect()` sobre Chromium real:

| Viewport | Borde derecho del CTA | Overflow fuera de pantalla |
|---|---|---|
| 1280px | 1482.6px | **202.6px** (el botón es prácticamente invisible) |
| 1366px | 1484.9px | **118.9px** (mayoría del botón invisible) |
| 1440px | 1486.9px | **46.9px** (falta la letra final y el ícono) |
| 1536px | 1569.5px | **33.5px** |
| 1920px | 1766.4px | 0px (recién aquí deja de haber overflow) |

**Cómo reproducir:** 1) abrir `/` en un viewport de 1366×768 (la resolución de laptop más común). 2) Observar el header: el botón "Quiero participar" y el ícono de menú están cortados/ausentes en el borde derecho. 3) Confirmar con DevTools que `document.querySelector('#site-header .flex.items-center.gap-3').getBoundingClientRect().right > window.innerWidth`.

**Posible causa:** `src/components/navigation/Header.astro` — el `<ul>` de navegación (11 ítems desde que Sprint 3 sumó EXPOSITORES/NOTICIAS/CONTACTO/PREGUNTAS a los 7 originales) no tiene `flex-shrink`/límite de ancho, y el contenedor (`Container.astro`, `max-w-[96rem]` = 1536px) no reserva espacio suficiente para logo + nav + CTA + hamburger en el rango 1280-1536px. El motor de flexbox termina empujando el grupo derecho fuera del `<Container>` y, por extensión, fuera del viewport; como `html { overflow-x: clip }` (global.css) oculta el desborde en vez de generar scroll, no hay ninguna señal visual de que algo se rompió — el botón simplemente "no está".

**Evidencia:** `docs/qa/screenshots/BUG-001-header-cta-overflow-1280w.png`, `...-1366w.png`, `...-1440w.png`, `...-1536w.png`

**Fix recomendado:** ver PLAN-FIX.md, tarea P0-1.

---

### BUG-002
**Tipo:** BUG (visual/tipográfico) · **Severidad:** Alto · **Sprint relacionado:** Transversal (mismo origen que BUG-001) · **Pantalla:** Header, todas las páginas · **Ruta:** `/` (y todas) · **Viewport:** todos los desktop ≥1280px (reproducido igual en 1280, 1440, 1920, 2560px)

**Descripción:** el ítem de navegación "LA EXPO" se parte en dos líneas ("LA" / "EXPO") en vez de mostrarse en una sola línea como el resto de los ítems del menú.

**Resultado esperado:** todos los ítems del nav en una sola línea, altura uniforme.

**Resultado actual:** confirmado con `getComputedStyle`: el link "LA EXPO" mide 48.6px de alto vs. 32.3px de todos los demás ítems (single-line); es el único de los 11 labels con un espacio en el texto, y es sistemáticamente el elemento que el motor de flexbox comprime primero (los demás son palabras únicas sin punto de quiebre). Se reproduce igual a 1280px, 1440px, 1920px e incluso 2560px — no depende del ancho de la ventana.

**Cómo reproducir:** 1) abrir `/` en cualquier resolución de escritorio ≥1280px. 2) Mirar el primer ítem del menú, junto al logo: se ve "LA" arriba y "EXPO" abajo en vez de "LA EXPO" en una línea.

**Posible causa:** `src/components/navigation/Header.astro` — los `<a>` del nav no tienen `whitespace-nowrap`; al ser "LA EXPO" el único label de dos palabras, es el único punto de quiebre disponible para que el flexbox "resuelva" la falta de espacio (mismo déficit de ancho que causa BUG-001), sacrificando su tipografía en vez de generar overflow visible.

**Evidencia:** `docs/qa/screenshots/BUG-002-nav-laexpo-wrap-1440w.png`, `...-1920w.png`

**Fix recomendado:** ver PLAN-FIX.md, tarea P0-1 (mismo fix que BUG-001).

---

### BUG-003
**Tipo:** REQUERIMIENTO FALTANTE (Sprint 2.5 explícito) · **Severidad:** Alto · **Sprint relacionado:** Sprint 2 (tarea 2.5) · **Pantalla:** Home, sección "Emprendimientos destacados" · **Ruta:** `/` · **Viewport:** todos

**Descripción:** el párrafo introductorio de la sección Emprendimientos sigue mostrando el texto placeholder original.

**Resultado esperado:** copy real aprobado, según el DoD explícito del Sprint 2.

**Resultado actual:** el texto en pantalla es literalmente `[Párrafo pendiente — ilegible en la referencia]`, entre corchetes e itálica, con el mismo TODO sin resolver desde antes del Sprint 2.

**Cómo reproducir:** 1) abrir `/`. 2) Scrollear hasta "Lo que Jujuy hace posible." 3) Leer el párrafo bajo el título.

**Posible causa:** `src/components/sections/Emprendimientos.astro:28`. El propio comentario del código (línea 23-24) documenta que el texto de referencia era ilegible en el mockup — sigue siendo un bloqueo de contenido, no de código.

**Evidencia:** `docs/qa/screenshots/GEN-emprendimientos-placeholder-copy-1440.png`

**Fix recomendado:** ver PLAN-FIX.md, tarea P1-1.

---

### BUG-004
**Tipo:** BUG (funcional) / enlace muerto · **Severidad:** Medio · **Sprint relacionado:** Sprint 2 (mismo criterio de DoD "cero `href="#"` sin justificar", fuera del alcance de archivos original) · **Pantalla:** Home, sección "Ejes destacados" (FeatureTrio) · **Ruta:** `/` · **Viewport:** todos

**Descripción:** dos de las tres tarjetas de la sección "Ejes destacados" (Gastronomía y Personas) tienen un botón con apariencia 100% funcional ("Descubrir", "Conocer historias") que no lleva a ningún lado.

**Resultado esperado:** cada CTA visualmente accionable lleva a contenido real, o no se presenta como accionable.

**Resultado actual:** `ctaHref="#"` en ambas tarjetas — visualmente indistinguibles de la tercera tarjeta ("Ver programa", que sí funciona y lleva a `/agenda`).

**Cómo reproducir:** 1) abrir `/`. 2) Scrollear a "Ejes destacados de ExpoJuy 2026". 3) Click en "Descubrir" o "Conocer historias": la página no navega a ningún lado (ancla `#` sin destino).

**Posible causa:** `src/components/sections/FeatureTrio.astro` líneas 14 y 23, `ctaHref="#"` hardcodeado — no había contenido real (galería de gastronomía, historias de emprendedores) para enlazar cuando se construyó el componente.

**Evidencia:** `docs/qa/screenshots/BUG-004-featuretrio-dead-cta-1440.png`

**Fix recomendado:** ver PLAN-FIX.md, tarea P1-2.

---

### BUG-005
**Tipo:** BUG (funcional) / UX · **Severidad:** Medio · **Sprint relacionado:** Sprint 2 (mismo criterio, footer no estaba en el alcance de archivos original) · **Pantalla:** Footer, todas las páginas · **Ruta:** todas · **Viewport:** todos

**Descripción:** el formulario de newsletter del footer ("Recibí novedades de ExpoJuy") tiene el botón de envío habilitado, pero no hace nada real al enviarse.

**Resultado esperado:** o el botón está deshabilitado con una nota "próximamente" (mismo patrón honesto que Contacto/Entradas), o envía a un servicio real.

**Resultado actual:** `<form action="#" method="POST">` (implícito) sin `action` real y sin ningún `onsubmit`/handler en `enhance.ts`. Al enviar, el navegador recarga la página actual con `#` — no hay feedback de error ni de éxito, y el email tipeado se pierde silenciosamente.

**Cómo reproducir:** 1) ir a cualquier página, scrollear al footer. 2) Escribir un email y hacer click en el botón de flecha. 3) La página "recarga" sin ningún mensaje.

**Posible causa:** `src/components/navigation/Footer.astro` línea 53-54, `action="#"` con un TODO explícito ("no hay backend. Conectar `action` al proveedor de newsletter real") que nunca se resolvió ni siquiera con el patrón de deshabilitado usado en Contacto/Entradas.

**Evidencia:** `docs/qa/screenshots/GEN-footer-newsletter-1440.png`

**Fix recomendado:** ver PLAN-FIX.md, tarea P1-3.

---

### BUG-006
**Tipo:** PROBLEMA UX/UI · **Severidad:** Bajo · **Sprint relacionado:** General, no asignado a un sprint específico (no está en el plan) · **Pantalla:** Página 404 · **Ruta:** cualquier ruta inexistente (ej. `/ruta-inexistente-qa-test`) · **Viewport:** todos

**Descripción:** una URL inexistente muestra la página 404 genérica por defecto de Astro, sin ningún elemento de marca ExpoJuy.

**Resultado esperado:** una 404 con header/footer del sitio, mensaje en español y un link de vuelta a home, consistente con el resto de la experiencia.

**Resultado actual:** página en blanco con el texto plano "404: Not Found", sin CSS, sin navegación, sin forma de volver al sitio salvo el botón "atrás" del navegador.

**Cómo reproducir:** 1) navegar a cualquier URL que no exista, ej. `/esto-no-existe`.

**Posible causa:** no existe `src/pages/404.astro` en el proyecto.

**Evidencia:** `docs/qa/screenshots/GEN-ruta-inexistente-qa-test-d1440.png`

**Fix recomendado:** ver PLAN-FIX.md, tarea P3-1.

---

## 5. Hallazgos que NO son bugs (clasificación explícita)

Para no confundir incumplimiento de sprint con mejora opcional, según pide la consigna:

| Hallazgo | Clasificación | Por qué no es un bug |
|---|---|---|
| Expositores/Contacto/Entradas muestran estado "pendiente" en vez de datos | REQUERIMIENTO FALTANTE (bloqueado por datos externos) | El código está completo y probado; falta que la organización entregue el dato real. El propio plan de sprints instruye explícitamente "no inventar" |
| Fotografía 100% Unsplash | REQUERIMIENTO FALTANTE (bloqueado, con matiz) | Ídem — pero a diferencia de los anteriores, el DoD de Sprint 5.1 es una condición binaria y verificable ("cero hotlinking") que hoy es 0% cumplida, no parcial |
| Filtros de agenda/productos/sponsors requieren scroll horizontal en mobile sin indicador visual | PROBLEMA UX/UI (oportunidad) | Es un patrón de "rail" intencional y funcional (`overflow-x:auto`, `scroll-snap`), no roto — pero no es obvio para el usuario que hay más contenido a la derecha |
| Página "Próximamente" de Expositores es visualmente austera | MEJORA OPCIONAL | Cumple su función honestamente; podría tener más diseño pero no es un incumplimiento |
| 2 de 21 elementos `.reveal` en la home no se activan tras un salto de scroll instantáneo (`window.scrollTo` directo al fondo) | PROBLEMA DE PERFORMANCE/ANIMACIÓN (menor) | Son 2 miniaturas del rail del Hero fuera del viewport horizontal; con scroll real de usuario (confirmado con `scrollIntoView`, con instant-jump y con `prefers-reduced-motion`) el 100% del contenido se revela correctamente. No afecta a un usuario real, solo a saltos de scroll extremos |

---

## 6. Fase 6 — QA visual y responsive

Viewports probados: **1440×900, 1920×1080 (desktop) · 768×1024 (tablet) · 390×844, 360×800 (mobile)**, sobre 9 rutas reales (`/`, `/expositores`, `/agenda`, `/mapa`, `/entradas`, `/contacto`, `/preguntas-frecuentes`, `/noticias`, `/noticias/se-lanza-el-desafio-digital`).

- **Overflow horizontal:** cero detectado en los 5 viewports objetivo, en las 9 rutas (Playwright `pages.spec.ts`/`homepage.spec.ts` + verificación manual). La única excepción real es el header (BUG-001/002), que no genera scroll horizontal porque `overflow-x: clip` lo oculta en vez de mostrarlo — funcionalmente peor (invisible en vez de evidente).
- **Mobile (390/360):** composición prolija en las 9 rutas revisadas — cards, formularios y footer se apilan correctamente, texto legible, sin recortes. El menú mobile (hamburguesa) abre/cierra correctamente, con foco y Escape funcionando (test Playwright dedicado, verificado también a mano).
- **Tablet (768):** sin roturas; el layout de 2-3 columnas de Emprendimientos/Territorios se adapta bien.
- **Desktop (1440/1920):** correcto **salvo el header** (BUG-001/002). El resto de las secciones (hero, territorios, agenda, mapa, formularios) tiene buena composición y jerarquía en ambos anchos, sin huecos vacíos ni densidad excesiva.
- **Imágenes:** ninguna deformada; todas usan `srcset`/`sizes` con relación de aspecto reservada vía `width`/`height` explícitos (`Photo.astro`), buen indicador de bajo CLS.
- **Formularios (Contacto/Entradas) en mobile:** inputs con altura táctil adecuada (`py-3`, ~44px), sin overlaps, mensaje de "próximamente" legible.

---

## 7. Fase 7 — QA UX/UI (oportunidades, no bugs)

**Descubrimiento:** el hero comunica el evento y las fechas con claridad inmediata (tipografía "JUJUY" enorme, fechas, categorías). La navegación a las secciones clave (Regiones, Emprendimientos, Agenda, Mapa) es directa desde el nav. Punto débil: con 11 ítems en el menú, ninguno se destaca — no hay jerarquía visual entre "páginas de contenido" (Agenda, Mapa, Entradas) y "anclas de la landing" (La Expo, Regiones, Emprendimientos), lo que dificulta que el usuario entienda qué es una página propia y qué es scroll dentro de home.

**Engagement:** las tarjetas de Regiones y Productos (rail horizontal) funcionan pero son estáticas más allá de un hover de color — no hay ninguna pista visual de "hay más" al final de un rail salvo llegar al borde. La sección de Agenda y Mapa son funcionalmente correctas pero visualmente austeras (texto + iconografía mínima) para tratarse de las dos herramientas que un visitante real usaría más (cuándo ir, cómo moverse en el predio). Es la oportunidad más clara de la auditoría — ver propuestas WOW en `ANALISIS-ANIMACIONES.md`.

---

## 8. Fase 8 — Performance y accesibilidad

- **Bundle:** JS de cliente prácticamente inexistente — un único script de ~8KB (`enhance.ts` compilado) para reveals, filtros, mapa, nav mobile y header sticky. CSS ~48KB. Fuentes self-hosted, 4 × 36KB woff2. `dist/` completo pesa 1.3MB. Es una base de performance muy buena, coherente con el principio de minimizar JS en Astro.
- **Imágenes:** `Photo.astro` genera `srcset` con 9 anchos y `sizes` explícito, `loading="lazy"` salvo elementos `priority`, `width`/`height` reservados (bajo riesgo de CLS). El problema no es el manejo de imágenes sino su origen (Unsplash hotlinked, Sprint 5.1) — implica una dependencia de red de terceros fuera de control del sitio y sin cacheo/optimización propios de `astro:assets`.
- **Fuentes:** preload de los 2 pesos críticos (Regular, SemiBold), `font-display: swap` en las 4, sin bloqueo de render.
- **Accesibilidad:** `:focus-visible` global, `prefers-reduced-motion` respetado (reveals forzados a visibles + `!important`), alt text verificado en todas las imágenes de las 9 rutas (test Playwright), axe-core sin violaciones en home en los 3 viewports. **No verificado:** axe-core no corre sobre las páginas interiores (solo home) — no hay violaciones conocidas, pero tampoco hay barrido automatizado ahí. 🚫 NO VERIFICADO explícitamente.
- **Lighthouse:** 🚫 NO VERIFICADO — no se ejecutó como herramienta formal en este entorno de auditoría (sin Chrome DevTools/Lighthouse CLI disponible). La evaluación de performance de esta sección es cualitativa (inspección de red/bundle/build), no un score numérico.
- **JS innecesario / hidratación:** no aplica — es Astro estático puro, sin islands de framework, sin hidratación de componentes.

---

## 9. Verificación técnica (Fase 2-3, resumen)

- **Stack:** Astro 7.2.10 (`output: static`), Tailwind 4.3.3 vía `@tailwindcss/vite`, TypeScript 6.0.3, `@astrojs/sitemap` 3.7.4. Cero frameworks de UI (React/Vue/Svelte), consistente con la regla del proyecto.
- **`npm run build`:** 12 páginas generadas, 0 errores, ~450ms.
- **`npm run check`:** 0 errores / 0 warnings / 0 hints (51 archivos Astro).
- **`npm test` (Playwright):** 156/156 tests en verde, 3 proyectos (desktop/tablet/mobile) × `homepage.spec.ts` + `pages.spec.ts` (9 rutas) + `seo.spec.ts`.
- **Errores de consola / recursos 404:** cero detectados en 9 rutas × 3 viewports (verificación de red con Playwright, `response.status() >= 400` → 0 resultados).
- **SSR/hidratación:** no aplica (sitio 100% estático).

---

## 10. Archivos relevantes citados en esta auditoría

- `src/components/navigation/Header.astro` — BUG-001, BUG-002
- `src/components/layout/Container.astro` — contribuye al ancho insuficiente de BUG-001/002
- `src/components/sections/Emprendimientos.astro` — BUG-003
- `src/components/sections/FeatureTrio.astro` — BUG-004
- `src/components/navigation/Footer.astro` — BUG-005
- `src/data/expositores.ts`, `src/data/photos.ts`, `src/components/sections/Sponsors.astro` — Sprint 3.1 / 5.1 / 5.2
- `src/components/sections/ContactSection.astro`, `src/components/sections/EntradasSection.astro` — Sprint 3.2 / 4.2 (patrón de formulario deshabiltiado)
- `recursos/EXPOJUY_Logo2026/logo_camcomext.png` — asset real no utilizado (Sprint 5.2)

Ver plan de corrección priorizado en `docs/qa/PLAN-FIX.md` y análisis de animaciones en `docs/qa/ANALISIS-ANIMACIONES.md`.
