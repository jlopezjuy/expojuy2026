# ExpoJuy 2026 — Sitio oficial

Sitio web oficial de **ExpoJuy 2026** para el **Desafío Digital ExpoJuy 2026**. Es la propuesta
conceptual de la **Etapa 1** del desafío (no es el sitio completo de producción), construida en
Astro 7 + Tailwind 4 sin frameworks de UI.

- Evento: **ExpoJuy 2026** — del **17 al 20 de septiembre de 2026** en el **Predio Ferial Jujuy**,
  San Salvador de Jujuy.
- Concepto de la propuesta: *"Propuesta 1 — Jujuy Cinematográfico"* (ver `docs/design-spec.md`).
- Backlog priorizado: `docs/sprint-plan.md`. **Antes de tocar código, leerlo completo.**

> Este README reemplaza el starter genérico de Astro. Documenta el estado real del proyecto.

## Stack

- [Astro](https://astro.build) `^7.2.10` — renderizado estático, sin JavaScript de servidor.
- [Tailwind CSS](https://tailwindcss.com) `^4.3.3` vía `@tailwindcss/vite` — estilos y tokens de
  diseño (`@theme` en `src/styles/global.css`).
- TypeScript `^6.0.3` — tipado estricto.
- **Sin** React / Vue / Svelte / Preact. Todos los componentes son `.astro`.

## Requisitos

- Node.js `>=22.12.0` (ver `engines` en `package.json`).

## Comandos

Todos los comandos se ejecutan desde la raíz del proyecto:

| Comando           | Acción                                                       |
| :---------------- | :----------------------------------------------------------- |
| `npm install`     | Instala las dependencias                                      |
| `npm run dev`     | Servidor de desarrollo en `http://localhost:4321`             |
| `npm run build`   | Build de producción en `dist/`                                |
| `npm run preview` | Sirve el build local en `http://localhost:4321`               |
| `npm run check`   | `astro check` — diagnóstico de TypeScript + plantillas        |
| `npm test`        | Suite de humo de Playwright contra la salida compilada        |
| `npm run astro ...` | CLI de Astro (p. ej. `astro add`, `astro check`)            |

La suite de Playwright se ejecuta contra el **build**, no contra el dev server, en el puerto
`4331` (definido en `playwright.config.ts`). No arrancar otro servidor en ese puerto.

## Estructura del proyecto

```text
/
├── docs/                    # Diseño, backlog y documentación del desafío
│   ├── design-spec.md       # Spec visual de la propuesta (fuente de verdad del diseño)
│   └── sprint-plan.md       # Backlog priorizado (leer antes de implementar)
├── recursos/                # Recursos oficiales del concurso (no modificar sin aviso)
│   ├── BASES Y CONDICIONES.pdf
│   ├── CONSIGNAS TÉCNICAS DEL DESAFÍO.pdf
│   ├── EXPOJUY_Logo2026/    # Logos oficiales (CMYK y RGB)
│   └── Fuentes_Oficiales/   # Ambit-*.otf (tipografías oficiales)
├── public/                  # Estáticos servidos tal cual (favicon, etc.)
├── src/
│   ├── components/
│   │   ├── layout/          # Container
│   │   ├── navigation/      # Header, Footer
│   │   ├── hero/            # Hero, HeroCollage
│   │   ├── sections/        # LaExpo, Territorios, Emprendimientos, FeatureTrio, CtaBanner, Sponsors
│   │   ├── cards/           # FeatureCard, ProductCard, RegionCard
│   │   └── ui/              # Logo, Photo, Icon, ButtonLink, SectionHeading, ArrowCircle
│   ├── data/
│   │   ├── site.ts          # TODO el contenido visible (fuente de verdad de copy)
│   │   └── photos.ts        # Catálogo de fotografía (placeholders de Unsplash)
│   ├── layouts/BaseLayout.astro  # <head>, metadatos OG, fuentes, skip-link
│   ├── pages/index.astro    # Única página actual (landing one-page)
│   ├── scripts/enhance.ts   # JS de mejora progresiva (~2 KB)
│   └── styles/global.css    # Tokens de diseño (@theme) + base + utilities
├── tests/                   # Specs de Playwright
└── astro.config.mjs         # site, fuentes, dominios de imagen
```

## Tokens de diseño

Viven en `src/styles/global.css` bajo el bloque `@theme` de Tailwind 4. **Reusarlos, no crear valores
arbitrarios.** Usar las utilidades generadas (`bg-night`, `text-magenta`, `text-display`,
`px-gutter`, etc.). La paleta está marcada como **INFERRED** en `docs/design-spec.md` (muestreada
del mockup, no de un manual de marca).

## Contenido y reglas del proyecto

- **No inventar copy ni datos.** El contenido visible se transcribe de fuentes reales
  (`src/data/site.ts` a partir del mockup aprobado). Si falta un dato real, dejar un `TODO`
  explícito en vez de inventarlo — es la convención del proyecto.
- **No agregar dependencias nuevas** sin que lo pida explícitamente la tarea del sprint.
- **Recursos oficiales** (logo, tipografías, PDFs) están en `recursos/` — usarlos tal cual, no
  recrearlos a mano.
- **Componentización**: seguir las carpetas existentes en `src/components/`
  (`layout / navigation / hero / sections / cards / ui`) en vez de crear estructura nueva.
- **Instagram/Facebook/X/etc. y links del footer** que hoy son `href: '#'` son placeholders
  pendientes (ver `docs/sprint-plan.md` Sprint 2). No completarlos con URLs inventadas.

## Estado actual (transparencia)

La propuesta está funcionalmente completa como **landing one-page**, pero varios elementos son
**placeholders** que se resuelven en sprints posteriores, según `docs/sprint-plan.md`:

- Logo: el de `src/components/ui/Logo.astro` es un **SVG original**; el logo oficial vive en
  `recursos/EXPOJUY_Logo2026/` (integración en Sprint 1).
- Tipografías: se sirven **Playfair Display** y **Manrope** vía Google Fonts; las oficiales
  (`recursos/Fuentes_Oficiales/Ambit-*.otf`) se integran en Sprint 1.
- Fotografía: **placeholders hot-linkeados** de `images.unsplash.com` (ver `src/data/photos.ts`);
  se migran a assets reales y `astro:assets <Image>` en Sprint 5.
- Nav **VISITAR** y varios enlaces con `href: '#'`: placeholders (Sprint 2).

## Documentación del desafío

- `docs/design-spec.md` — reconstrucción de la propuesta visual (tokens, secciones, copy,
  accesibilidad, performance).
- `docs/sprint-plan.md` — plan de sprints priorizado y reglas de ejecución.
