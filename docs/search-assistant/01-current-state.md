# 01 · Estado actual del proyecto

Auditoría previa a incorporar el asistente. Todo lo que sigue está verificado
contra el código del repositorio; no hay afirmaciones inferidas.

## Stack verificado

| Concern | Tecnología | Verificado en |
| --- | --- | --- |
| Framework | Astro `^7.2.10`, **salida estática** | `package.json`, `astro.config.mjs` |
| Adapter | **ninguno** | `astro.config.mjs` — no hay `adapter:` ni `output:` |
| Integraciones | `@astrojs/sitemap`, `@astrojs/preact` | `astro.config.mjs` |
| Estilos | Tailwind 4 vía `@tailwindcss/vite`, sin `tailwind.config.js` | `astro.config.mjs`, `src/styles/global.css` |
| Islands | Preact + `@preact/signals`, sólo auth | `src/components/islands/` (3 archivos) |
| TypeScript | `astro/tsconfigs/strict` | `tsconfig.json` |
| Tests | Playwright + `axe-core`, 3 viewports | `playwright.config.ts` |
| Variables de entorno | sólo `PUBLIC_API_BASE_URL` | `src/env.d.ts`, `.env.example` |

**Consecuencia arquitectónica principal:** sin adapter no hay runtime de
servidor. Astro Actions y los endpoints con `prerender: false` no existen en
producción — Nginx sirve `dist/` (`docker/frontend/nginx.conf`). Cualquier
diseño que asuma un servidor está descartado para este MVP.

## Dónde vive la información

El flujo es uniforme y limpio. Ningún componente contiene datos de dominio:
sólo copy.

```text
src/data/*.ts ──► componente de sección ──► página ──► ruta
```

| Dato | Archivo | Componente | Página | Registros |
| --- | --- | --- | --- | --- |
| Expositores | `src/data/expositores.ts` | `sections/Expositores.astro` | `/expositores` | 18 |
| Agenda | `src/data/agenda.ts` | `sections/AgendaSection.astro` | `/agenda` | 18 sesiones, 5 temáticas |
| Zonas del predio | `src/data/plano.ts` | `sections/PredioMap.astro` | `/mapa` | 8 zonas |
| FAQ | `src/data/faq.ts` | `sections/FaqSection.astro` | `/preguntas-frecuentes` | 8 |
| Identidad del evento, nav, sponsors, regiones, productos | `src/data/site.ts` | `Header`, `Footer`, `Hero`, `LaExpo`, `Territorios`, `Emprendimientos`, `Sponsors` | varias | — |
| Fotografía | `src/data/photos.ts` | `ui/Photo.astro` | varias | 20 |
| Noticias | `src/content/noticias/*.md` | `noticias/[slug].astro` | `/noticias/*` | 4 |

Comportamiento cliente: **un solo** archivo, `src/scripts/enhance.ts`
(936 líneas antes de este trabajo, 13 funciones `init*`), importado desde
`BaseLayout.astro` en todas las páginas. Se acopla al markup por `id` y
`data-*`.

## Content Collections

Se usan, pero **sólo para noticias**: `src/content.config.ts` define la
colección `noticias` con `glob()` y schema Zod. El resto del contenido es
TypeScript tipado en `src/data/`, con interfaces y uniones cerradas.

No conviene migrar `src/data/` a content collections. Ya cumple lo que las
colecciones aportarían (tipado, validación en build, fuente única) y la
migración tocaría los 7 componentes de sección sin ganancia funcional. Las
reglas de `src/data/AGENTS.md` ya gobiernan ese directorio.

## Búsqueda existente

Hay una sola, y es mínima: `initExpositoresFilter()` en `enhance.ts:639`.

```ts
const matchesSearch = !searchTerm || searchText.includes(searchTerm);
```

Un `String.includes()` sobre el atributo `data-search-text` de cada tarjeta,
únicamente en `/expositores`. Sin tolerancia a tipeos, sin normalización de
acentos, sin sinónimos, sin ranking, y ciega al resto del sitio: agenda, FAQ,
zonas y noticias no son buscables de ninguna forma.

## Backend

`backend/server/src/` contiene **sólo** el andamiaje de autenticación de
JHipster/NestJS: `user.entity.ts`, `authority.entity.ts`, los controladores de
cuenta y los guards JWT. Ninguna entidad de dominio está implementada.

`expojuy-modelo.jdl` (raíz del repositorio) modela 60+ entidades, incluidas
`UbicacionRecinto`, `Sector`, `Stand`, `Actividad`, `SesionActividad`,
`PosicionGeografica`, `GeometriaStand` y `CapturaGps`. Es un modelo, no código.
El enum `TipoUbicacion` ya define el vocabulario exacto que necesita el
visitante:

```text
STAND, SALA, ESCENARIO, ACCESO, SANITARIO, GASTRONOMIA,
INFORMACION, ASISTENCIA, DESCANSO, ESTACIONAMIENTO, REFERENCIA_GEO, OTRO
```

**El backend no puede ser fuente de datos del MVP.** Sí es el destino natural
cuando las entidades se implementen (ver `05-ai-evolution.md`).

## Problemas encontrados

1. **No existe entidad de servicios.** Baños, estacionamiento, Wi-Fi, primeros
   auxilios, cajeros, guardarropa y áreas de descanso están sólo como prosa
   dentro de dos respuestas de `faq.ts` y la nota de la zona `accesos` en
   `plano.ts`. "¿Dónde están los baños?" no tenía ningún dato estructurado que
   responder.
2. **No existe entidad de gastronomía.** Lo real es la zona `gastronomico` del
   plano más los 4 expositores de rubro `Alimentos & Bebidas`.
3. **No hay ningún dato dietético.** No existe "sin TACC", celiaquía, vegano ni
   alérgenos en el repositorio. El asistente debe decir que no lo sabe.
4. **La agenda no tiene fechas computables.** `day: '9'`, `month: 'OCT.'` y
   `time: '10:00 - 11:30 hs'` son strings. Sin año ni ISO no se puede responder
   "¿qué hay hoy?" sin derivarlos.
5. **No hay coordenadas geográficas.** `plano.ts` tiene `x`/`y` en porcentaje
   del plano y rectángulos SVG. No hay latitud/longitud en ninguna parte del
   frontend.
6. **Acoplamiento por string entre `plano.ts` y `expositores.ts`.** Los nombres
   están duplicados y ya divergen:

   | `expositores.ts` | `plano.ts` |
   | --- | --- |
   | `ClusteAR — Cámara de Empresas TICs de Jujuy` | `ClusteAR TICs` |
   | `Telecom Argentina — Redes Inteligentes` | `Telecom Argentina` |
   | `Bodega El Fernando — Valles Templados` | `Bodega El Fernando` |
   | `Cooperativa Agroganadera de la Puna` | `Cooperativa Agroganadera Puna` |
   | `JEMSE — Jujuy Energía y Minería S.E.` | `JEMSE` |

   Los códigos de stand también difieren: `M-01` contra `Stand M-01`.
7. **No hay enlaces profundos.** Ni las tarjetas de expositor ni las de agenda
   tienen `id` en el DOM, y ningún filtro refleja su estado en la URL. Antes de
   este trabajo, un resultado de búsqueda no podía llevar a un elemento
   concreto.

## Qué se puede reutilizar

- La capa `src/data/` como fuente única — es exactamente la arquitectura que el
  buscador necesita, y ya está tipada y validada por `astro check`.
- El acoplamiento `id`/`data-*` de `enhance.ts`: los enlaces profundos disparan
  los manejadores existentes en vez de duplicar lógica de filtrado.
- Los tokens de diseño de `global.css` y el set de iconos de `ui/Icon.astro`.
- El patrón de import dinámico de `loadMotion()` para no pagar bundle por
  adelantado.
