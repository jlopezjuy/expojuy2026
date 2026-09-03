# Análisis de animaciones y experiencias avanzadas

Fases 12-14 de la auditoría. Se hace **después** de terminar el QA funcional/visual/técnico (`AUDITORIA-6-SPRINTS.md`) y sobre las pantallas reales del proyecto, no como catálogo genérico de qué hace cada librería.

**Punto de partida real (no teórico):** el sitio hoy tiene **cero dependencias de animación** — solo CSS (`@keyframes rise`, transiciones Tailwind) y ~200 líneas de `src/scripts/enhance.ts` vanilla para reveals por `IntersectionObserver`, header sticky, nav mobile, filtros de agenda/productos y el mapa del predio. El bundle de cliente pesa ~8KB. Cualquier recomendación de esta sección compite contra esa base — que ya es rápida y accesible — así que la barra para justificar una librería nueva es alta.

---

## 12. Dónde aportarían valor Motion / Anime.js / Lenis / Three.js / Theatre.js

| Pantalla | Sección | Librería | Efecto propuesto | Beneficio UX | Complejidad | Impacto performance | Recomendación |
|---|---|---|---|---|---|---|---|
| Home | Hero (`Hero.astro`/`HeroCollage.astro`) | Motion | Stagger de entrada de las 4 fotos del collage + parallax sutil al hacer scroll (ya hay `data-parallax` rudimentario en `CtaBanner.astro`, generalizarlo) | Jerarquía y sensación "cinematográfica" que el propio concepto de diseño ("Jujuy Cinematográfico") ya promete pero el `@keyframes rise` genérico no entrega | Baja | Bajo (una vez, on-load) | **Implementar** |
| Home | LaExpo (banda de 5 pilares) | Motion | Stagger de los 5 íconos al entrar en viewport, con un hover que separa ícono/label | Refuerza que son 5 pilares distintos, hoy se leen como una fila plana | Baja | Bajo | **Implementar** |
| Home | Territorios (4 tarjetas de región) | Motion | Hover con leve escala + overlay de color por región (ya existe la paleta: teal, gold, magenta, blue) en vez de solo cambio de opacidad | Refuerza identidad de cada región antes del click | Baja | Bajo | **Implementar** |
| Home | Emprendimientos (rail de productos + filtro) | Motion | Transición de layout (`FLIP`) al filtrar por rubro, en vez de `hidden` instantáneo | El filtro ya funciona (probado); hoy el cambio es un corte seco, una transición breve comunica "se actualizó la lista" sin ruido | Media | Bajo | **Evaluar** (ganancia real pero no crítica) |
| Home | FeatureTrio (3 tarjetas: Sabores/Personas/Agenda) | Motion | Reveal con stagger + hover de imagen con leve zoom | Consistente con el resto de reveals, bajo costo | Baja | Bajo | **Implementar** |
| Home | CtaBanner | Motion | Nada más allá del parallax ya iniciado — no agregar texto animado | El banner ya cumple su función (CTA claro); más movimiento compite con el CTA en vez de ayudarlo | — | — | **Descartar** (más animación acá es decoración) |
| Home | Sponsors (franja) | — | Ninguna | Es información de baja frecuencia de interacción (logos institucionales); animarla es puro ruido | — | — | **Descartar** |
| `/agenda` | Grilla filtrable (día + jornada) | Motion | Mismo `FLIP` que Emprendimientos al cambiar de filtro; contador (`#agenda-count`) con transición de número | Hoy el filtro es instantáneo y correcto mostrar 2 grupos de filtro combinados no es obvio sin mirar dos veces — una transición ayuda a leer el cambio | Media | Bajo | **Evaluar** |
| `/mapa` | Plano SVG esquemático + 6 marcadores | Anime.js | Animar el trazado (`stroke-dashoffset`) de los pasillos del SVG al cargar la sección, y un pulso sutil en el marcador seleccionado | El plano es SVG puro (ideal para Anime.js), y hoy es 100% estático — es la sección con más margen de mejora sin tocar la lógica de negocio (los datos siguen siendo esquemáticos, ya documentado) | Media | Bajo (SVG liviano, sin imágenes) | **Implementar** |
| `/expositores` | Estado "Próximamente" | — | Ninguna | Es un estado de espera, no una experiencia — priorizar resolver el contenido real (Sprint 3.1) antes que animar el placeholder | — | — | **Descartar** |
| `/noticias`, `/noticias/[slug]` | Grilla de notas + detalle | Motion | Stagger de tarjetas al cargar el listado | Refuerzo menor de jerarquía editorial | Baja | Bajo | **Evaluar** (bajo impacto, la grilla ya es clara) |
| `/contacto`, `/entradas` | Formularios | Motion | Micro-feedback de validación (shake sutil en error, check al completar un campo) | Los formularios están deshabilitados hoy (Sprint 3.2/4.2 pendientes) — priorizar que funcionen antes de pulir su microinteracción | Baja | Bajo | **Evaluar** (implementar junto con el fix del endpoint, no antes) |
| Global | Scroll general del sitio | Lenis | Smooth scroll global | Ver análisis dedicado abajo — **no es un sí automático** | — | — | **Descartar por ahora** |
| Global | Cualquier escena | Three.js | Ver análisis dedicado abajo | — | — | — | **Descartar por ahora** |
| Global | Cualquier secuencia | Theatre.js | Ver análisis dedicado abajo | — | — | — | **Descartar** |

### Motion — veredicto

Es la única librería de esta lista con una relación esfuerzo/beneficio claramente positiva para este sitio **tal como es hoy**: reveals con stagger, hover/estado de cards y transiciones de filtro son exactamente su caso de uso, y Astro permite cargarla como un único script pequeño sin hidratar ningún framework. El propio `enhance.ts` ya tiate la arquitectura correcta para incorporarla (funciones puras, `IntersectionObserver` existente) — sería una migración incremental de `@keyframes rise` a `animate()`/`inView()` de Motion, no una reescritura.

### Anime.js — veredicto

Tiene un único caso de uso legítimo en todo el sitio: el SVG del mapa del predio (`PredioMap.astro`). En cualquier otro lugar (cards, texto, botones) sería redundante con lo que Motion ya resuelve mejor y más liviano. No se recomienda para nada fuera del mapa.

### Lenis — veredicto (análisis dedicado, según pide la consigna)

**No se recomienda incorporarlo por ahora.** Razones concretas, no genéricas:

1. El sitio **no tiene storytelling de scroll largo por sección** que se beneficie de scroll-driven animations — es una landing con secciones bien delimitadas y 8 páginas propias cortas, no un scrollytelling de una sola página.
2. `html { scroll-behavior: smooth; scroll-padding-top: 6rem }` (ya en `global.css`) resuelve el 90% del caso de uso real (anclas del nav) sin JS ni librería.
3. Lenis intercepta el scroll nativo, lo que típicamente **degrada** el comportamiento en mobile (donde este sitio ya midió que el rebote/inercia nativo funciona bien) y complica la compatibilidad con `prefers-reduced-motion` — habría que reimplementar a mano lo que el navegador ya da gratis.
4. El filtro de agenda/productos y el mapa dependen de scroll normal + `IntersectionObserver`; Lenis puede desincronizar esos observers si no se configura con cuidado (causa común de bugs reportados en la comunidad de Lenis con `IntersectionObserver`).

**Cuándo reconsiderarlo:** si en el futuro se agrega una página de storytelling largo (ej. "La ruta de Jujuy" con scroll narrativo por región), ahí sí Lenis + Motion en combo tiene sentido — hoy no.

### Three.js — veredicto (análisis dedicado)

**No se recomienda por ahora**, con una excepción a evaluar a futuro:

- El caso de uso más obvio para 3D en este proyecto sería un **mapa interactivo real del territorio de Jujuy** (las 4 regiones) o del predio ferial. Hoy el mapa del predio es un SVG esquemático 2D **explícitamente etiquetado como referencia** (Sprint 4.1) — construir una escena 3D sobre datos que la propia organización todavía no confirmó (el plano real del predio no existe en el repo) sería invertir esfuerzo en una capa visual sobre una base de datos que va a cambiar.
- Costo real: peso inicial (aun con Three.js tree-shaken, la escena + geometrías + texturas suman cientos de KB frente a los 8KB actuales de JS), consumo de GPU/batería en mobile (el público de una feria regional incluye muchos dispositivos gama media), y mantenimiento (nadie en el equipo documentó experiencia previa con WebGL en este repo).
- **Cuándo reconsiderarlo:** una vez que exista el plano oficial del predio (Sprint 4.1 resuelto con datos reales) y si el objetivo es una experiencia "hero inmersiva" de las 4 regiones (Puna/Quebrada/Valles/Yungas) como pieza central de marketing — ahí un Three.js acotado (una escena, no un motor 3D completo del sitio) podría justificarse. No antes.

### Theatre.js — veredicto

**Descartar.** Theatre.js se justifica cuando hay una secuencia cinematográfica compleja que sincronizar (cámara + texto + 3D + timeline), típicamente sobre una base de Three.js ya en producción. Este sitio no tiene ninguna escena 3D ni secuencia con ese nivel de coordinación, y agregar Theatre.js sin un caso de uso 3D previo sería la definición de complejidad injustificada que la consigna pide evitar.

---

## 13. Arquitectura de animación recomendada

**No hacen falta los 6 niveles.** La combinación mínima con mayor impacto para este sitio, en su estado actual, es:

```
Nivel 1 — CSS/Tailwind (ya existe, mantener)
  → transiciones de hover/focus, :focus-visible, prefers-reduced-motion
  → NO tocar: ya está bien resuelto

Nivel 2 — Motion (única librería nueva a incorporar)
  → reemplaza gradualmente @keyframes rise por animate()/inView()
  → reveals con stagger, hover de cards, transición de filtros (FLIP)
  → un solo script, sin build step adicional relevante (ESM directo)

Nivel 3 — Anime.js (acotado, un solo componente)
  → SOLO PredioMap.astro (trazo del SVG, pulso del marcador activo)
  → no se usa en ningún otro lugar del sitio

Niveles 4-6 (Lenis / Three.js / Theatre.js) — NO IMPLEMENTAR AHORA
  → reevaluar Lenis si aparece una página de scrollytelling real
  → reevaluar Three.js si el plano oficial del predio o una escena de
    regiones se vuelve prioridad de marketing
  → Theatre.js queda descartado salvo que ambos anteriores ya estén
    en producción y haya una secuencia que sincronizar
```

**Por qué esta combinación y no otra:** el sitio ya demostró (Sprint 6, bundle de 8KB) que la performance es una fortaleza competitiva real para un evento con público de dispositivos mixtos. Motion solo (sin Lenis, sin Three.js) resuelve el 90% de las oportunidades identificadas en la tabla de la sección 12 — reveals, hover, transición de filtros — que son exactamente los puntos donde hoy la experiencia se siente "genérica" (ver Fase 7 de la auditoría). Anime.js queda limitado a una sola pantalla porque es el único lugar (SVG del mapa) donde aporta algo que Motion no resuelve igual de bien. Agregar más niveles hoy sería "ensalada de librerías" sin una necesidad de producto que lo pida — la propia auditoría (Fase 7) identificó falta de *microinteracciones* y *jerarquía*, no falta de efectos grandes.

---

## 14. Propuestas WOW (5-10 experiencias concretas)

Todas ancladas a pantallas y datos reales del proyecto — nada genérico que podría pertenecer a cualquier landing de startup.

### 1. Territorio vivo — hover de regiones con "respiración" de paisaje
- **Pantalla:** Home, sección Territorios (`Territorios.astro`)
- **Concepto:** las 4 tarjetas de región (Puna, Quebrada, Valles, Yungas) hoy son foto + nombre + flecha. Al hacer hover, la foto hace un zoom/pan lento (Ken Burns) con la paleta de esa región tiñendo el overlay (los 4 colores de marca ya existen: teal, gold, magenta, blue — cada uno podría asociarse a una región).
- **Interacción:** hover en desktop, tap-and-hold o auto-play breve en mobile.
- **Tecnología:** Motion (`animate()` en scale/filter) — sin librería nueva más allá de la ya recomendada.
- **Dificultad:** Baja · **Impacto visual:** 7/10 · **Impacto UX:** 6/10 · **Impacto performance:** Bajo
- **Recomendación:** Implementar

### 2. El predio cobra vida — mapa con trazo animado
- **Pantalla:** `/mapa` (`PredioMap.astro`)
- **Concepto:** al entrar a la sección, los pasillos del plano (hoy líneas punteadas estáticas) se "dibujan" con una animación de trazo, y cada zona aparece con un stagger de 80ms en el orden lógico de recorrido (accesos → pabellón central → resto).
- **Interacción:** automática al hacer scroll a la sección; el click en un marcador sigue funcionando igual que hoy (ya accesible por teclado).
- **Tecnología:** Anime.js (`stroke-dashoffset` sobre el SVG existente) + el mismo `IntersectionObserver` que ya dispara los reveals.
- **Dificultad:** Media · **Impacto visual:** 8/10 · **Impacto UX:** 6/10 · **Impacto performance:** Bajo (SVG vectorial, sin imágenes)
- **Recomendación:** Implementar

### 3. Cuatro días, cuatro momentos — agenda como línea de tiempo
- **Pantalla:** `/agenda` (`AgendaSection.astro`)
- **Concepto:** hoy la agenda es una grilla de 4 tarjetas. Convertirla en una línea de tiempo horizontal (scroll-snap, ya usado en los rails del sitio) donde cada día es una "estación" con su color de jornada, y al filtrar por track las tarjetas no coincidentes se atenúan en vez de desaparecer instantáneamente (permite comparar visualmente la carga de cada día).
- **Interacción:** los mismos filtros de día/jornada que ya existen y funcionan; scroll horizontal con snap en mobile.
- **Tecnología:** Motion (`FLIP` para la transición de filtro) + CSS `scroll-snap` (ya usado en `@utility rail`).
- **Dificultad:** Media · **Impacto visual:** 7/10 · **Impacto UX:** 7/10 · **Impacto performance:** Bajo
- **Recomendación:** Implementar

### 4. Del campo a la feria — historia del producto regional
- **Pantalla:** Home, Emprendimientos (rail de productos filtrable)
- **Concepto:** cada producto (miel, textiles, cerámica, hierbas...) hoy es solo una foto + categoría, sin nombre de marca (correctamente, porque no hay datos reales todavía). En vez de esperar el dato de "nombre de marca", se puede enriquecer con el dato que sí existe: el `alt` descriptivo ya redactado en `photos.ts` ("Manos de alfarero modelando arcilla") — mostrarlo como micro-caption al hover, dándole contexto humano al producto sin inventar ninguna marca.
- **Interacción:** hover/tap revela la descripción sobre la foto con un fade corto.
- **Tecnología:** Motion (`animate()` de opacity/transform) — cero datos nuevos, solo exponer visualmente lo que ya está en `photos.ts`.
- **Dificultad:** Baja · **Impacto visual:** 6/10 · **Impacto UX:** 7/10 · **Impacto performance:** Bajo
- **Recomendación:** Implementar

### 5. Contador regresivo al Desafío / a la feria
- **Pantalla:** Home, Hero o CtaBanner
- **Concepto:** un contador en vivo a los días/horas para el 17 de septiembre de 2026 (o, mientras el Desafío Digital esté activo, a su fecha de cierre real del 8/sep, que ya está en `src/content/noticias/`). Genera urgencia real y reutiliza una fecha que el sitio ya conoce con certeza (no es un dato inventado).
- **Interacción:** pasiva, se actualiza sola; opcionalmente un micro-tick al cambiar cada dígito.
- **Tecnología:** JS vanilla (cálculo de fecha) + Motion solo para el tick de dígitos. No requiere ninguna librería de animación compleja.
- **Dificultad:** Baja · **Impacto visual:** 5/10 · **Impacto UX:** 7/10 · **Impacto performance:** Bajo
- **Recomendación:** Implementar

### 6. Newsletter con confirmación real
- **Pantalla:** Footer (todas las páginas)
- **Concepto:** no es una animación por sí sola, pero una vez resuelto BUG-005 (P1-3 del plan de fix), el estado de éxito puede tener un micro-feedback (check animado + mensaje) en vez de un simple reload de página — completa la corrección del bug con una experiencia mejor, no solo "arreglada".
- **Interacción:** submit → estado de carga breve → confirmación animada.
- **Tecnología:** Motion, una vez exista el endpoint real (depende de P1-3).
- **Dificultad:** Baja · **Impacto visual:** 4/10 · **Impacto UX:** 6/10 · **Impacto performance:** Bajo
- **Recomendación:** Evaluar (depende de que el bug de fondo se resuelva primero)

### 7. Vista aérea de regiones (3D) — a futuro, no ahora
- **Pantalla:** Home, Hero (como reemplazo/complemento del collage actual)
- **Concepto:** una representación 3D simplificada del territorio jujeño (4 regiones como planos/terrenos estilizados con parallax de profundidad al mover el mouse/girar el dispositivo), como pieza de marca para redes y como hero alternativo.
- **Interacción:** parallax por mouse/giroscopio, click para saltar a la sección de esa región.
- **Tecnología:** Three.js (geometría simple, sin texturas fotorrealistas — estilo "low poly" para mantener el peso bajo).
- **Dificultad:** Alta · **Impacto visual:** 9/10 · **Impacto UX:** 5/10 · **Impacto performance:** Medio-Alto
- **Recomendación:** **Evaluar a futuro** — no ahora. Requiere decidir presupuesto de performance/mobile y no tiene un dato bloqueante como el mapa del predio (las 4 regiones y sus nombres son datos reales y estables), así que es la única candidata 3D del proyecto que podría justificarse *más adelante*, pero no es una prioridad frente a los P0/P1 del plan de fix.

### 8. Empresas y PyMEs — grilla de expositores con revelado editorial
- **Pantalla:** `/expositores`, una vez exista el listado real (Sprint 3.1)
- **Concepto:** cuando la organización confirme el padrón, presentar cada expositor con un reveal en stagger agrupado por rubro (no todos a la vez), reforzando la variedad de la producción jujeña en vez de una tabla plana.
- **Interacción:** pasiva al hacer scroll; filtro por rubro (mismo patrón ya construido y probado en Emprendimientos).
- **Tecnología:** Motion + el mismo patrón de filtro de `enhance.ts` ya existente.
- **Dificultad:** Baja (una vez exista el dato) · **Impacto visual:** 6/10 · **Impacto UX:** 7/10 · **Impacto performance:** Bajo
- **Recomendación:** Evaluar (depende de Sprint 3.1 — no implementar la grilla final hasta tener el dato real, para no construir sobre datos vacíos)

---

## Resumen de recomendaciones

| Librería | Incorporar ahora | Motivo breve |
|---|---|---|
| **Motion** | Sí | Cubre el 90% de las oportunidades reales (reveals, hover, filtros) con bajísimo costo; encaja con la arquitectura ya minimalista de `enhance.ts` |
| **Anime.js** | Sí, acotado | Único caso de uso real: el SVG del mapa del predio. No usar en ningún otro lugar |
| **Lenis** | No | El sitio no tiene scrollytelling que lo justifique; `scroll-behavior:smooth` nativo ya resuelve el caso de uso actual; riesgo de romper `IntersectionObserver` existente |
| **Three.js** | No | Sin dato oficial del predio ni presupuesto de performance definido; único candidato futuro es una escena de regiones para el Hero, no antes de resolver P0/P1 |
| **Theatre.js** | No | No hay ninguna escena 3D ni secuencia que sincronizar — no tiene base sobre la cual justificarse |

**Las 3 mejoras de mayor impacto, en orden:** (1) Motion en reveals/hover/filtros existentes — impacto inmediato y transversal a todo el sitio; (2) mapa del predio con trazo animado en Anime.js — la pantalla con más margen de mejora visual sin depender de datos externos; (3) agenda como línea de tiempo — convierte la herramienta más usada por un visitante real (cuándo ir) en la pieza más memorable del sitio.
