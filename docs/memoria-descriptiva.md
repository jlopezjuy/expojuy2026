# Memoria descriptiva

Propuesta conceptual para el sitio web oficial de **ExpoJuy 2026** — Desafío Digital ExpoJuy 2026,
**Primera etapa** (Anexo III de `recursos/BASES Y CONDICIONES.pdf`).

> **Borrador de trabajo.** Los campos marcados con `TODO` (identidad del equipo, link al mockup)
> deben completarse con datos reales antes de la entrega. Se generó a partir del estado real del
> repositorio y de `docs/design-spec.md`; **no se inventó** contenido de marca.

---

## 1. Datos generales

| Campo                  | Valor |
| ---------------------- | ----- |
| Nombre del equipo      | `TODO` — completar |
| Integrantes            | `TODO` — completar |
| Nombre de la propuesta | Propuesta 1 — Jujuy Cinematográfico |
| Concepto               | "Jujuy Cinematográfico" |
| Link al mockup         | `TODO` — link al mockup navegable (Figma o equivalente) |

---

## 2. Resumen de la propuesta

ExpoJuy 2026 es una propuesta de sitio web institucional para la feria homónima que se celebra del
**17 al 20 de septiembre de 2026** en el **Predio Ferial Jujuy**, San Salvador de Jujuy. La idea
central es presentar a Jujuy como una tierra que **produce, crea y emprende** a través de una
experiencia visual **cinematográfica**: tipografía editorial de gran escala, fotografía cálida y de
documental, y un lenguaje cromático que evoca la Quebrada.

La propuesta cubre la **Marca mínima** de funcionalidades de la primera etapa (ver §7) y se entrega
como una **landing one-page** navegable y responsive, lista para evolucionar a sitio multipágina en
las etapas siguientes.

## 3. Concepto: "Jujuy Cinematográfico"

- **Mirada:** la cinematografía como metáfora — luz dorada, paisaje de la Quebrada, protagonistas
  reales (artesanos, productores, tejedores) y un tono documental, no de folleto turístico.
- **Ejes narrativos:** Negocios, Turismo, Cultura y Experiencia; desarrollo, potencia y futuro.
- **Tono:** sobrio, cálido y con identidad jujeña, sin caer en clichés.

## 4. Identidad visual

La paleta y la tipografía están definidas en `src/styles/global.css` (`@theme`) y documentadas en
`docs/design-spec.md`. **Todos los valores de color están marcados como INFERRED**: fueron
muestreados del mockup aprobado, no provienen de un manual de marca oficial.

### Color (tokens `@theme`)

- **Acentos:** `gold #dba649`, `gold-bright #eab21e`, `magenta #d62a79`, `teal #64baba`,
  `blue #1f6399`, `ink #2f2e2f`, `sand #dad2c6`.
- **Superficies:** `cream #f7efe1`, `cream-deep #ece3d4`, `night #07121e`, `night-soft #0d1b2a`,
  `night-line #1d2c3c`.

### Tipografía

- **Display / editorial:** Playfair Display (400–700) — titulares.
- **UI / cuerpo:** Manrope (variable 400–800) — copy de interfaz.

> **Nota:** estas familias se sirven como *staging* vía Google Fonts. Las tipografías oficiales del
> concurso (`recursos/Fuentes_Oficiales/Ambit-*.otf`) se integrarán en la Etapa 1 del plan (Sprint 1),
> reemplazando a Playfair/Manrope. El logo actual (`src/components/ui/Logo.astro`) es un SVG
> original; el logo oficial está en `recursos/EXPOJUY_Logo2026/`.

### Retícula y movimiento

- Gutter único: `--spacing-gutter` → `clamp(1.25rem, 0.6rem + 2.7vw, 3.5rem)`.
- Contenido: `max-w-[96rem]` (ancho) y `max-w-[76rem]` (normal).
- Easing único: `--ease-out-expo` → `cubic-bezier(0.16, 1, 0.3, 1)`.
- Breakpoints: `xl` (1280px) umbral del nav de escritorio; `lg` (1024px) umbral de dos columnas.

## 5. Estructura de la página y experiencia de usuario

La página sigue `src/pages/index.astro`, con componentes organizados en `src/components/`:

1. **Header** (`navigation/Header.astro`) — fijo, transparente sobre el hero; blur al hacer scroll;
   nav de escritorio desde `xl`, panel hamburguesa en el resto.
2. **Hero** (`hero/Hero.astro` + `hero/HeroCollage.astro`) — opener a pantalla completa con colage
   de tres fotos (desde `lg`), fechas, statement y scroll cue.
3. **La Expo** (`sections/LaExpo.astro`) — split 38/62, cinco pilares, CTA outline.
4. **Nuestros territorios** (`sections/Territorios.astro` / `cards/RegionCard.astro`) — grilla
   oscura de cuatro regiones (Puna, Quebrada, Valles, Yungas), rail horizontal en mobile.
5. **Emprendimientos** (`sections/Emprendimientos.astro`) — filtros por categoría (accesibles con
   `aria-pressed`) + carril continuo de productos.
6. **Feature trio** (`sections/FeatureTrio.astro` / `cards/FeatureCard.astro`) — gastronomía,
   historias y agenda.
7. **CTA banner** (`sections/CtaBanner.astro`) — fotografía con scrim, "Quiero exponer".
8. **Sponsors** (`sections/Sponsors.astro`) — wordmarks institucionales (logos reales pendientes).
9. **Footer** (`navigation/Footer.astro`) — marca, columnas de links, redes sociales y newsletter.

**Responsive:** la página se adapta en desktop (`1440px`), tablet (`1024px`) y mobile (`390px`),
con rail horizontal y reflujo de bloques por debajo de `lg`.

## 6. Solución técnica

- **Astro 7** — renderizado estático, cero JavaScript en el servidor.
- **Tailwind CSS 4** vía `@tailwindcss/vite` — estilos con tokens de diseño (`@theme`).
- **TypeScript 6** — tipado estricto, `astro check` (0 errores/warnings).
- **Mejora progresiva:** un único módulo JS (~2 KB, `src/scripts/enhance.ts`) para reveals,
  estado del header, nav mobile, filtros y parallax. Sin JS la página queda completa y navegable.
- **Foto:** `src/data/photos.ts` cataloga fotografías placeholder (servidas desde Unsplash) y se
  renderizan vía `components/ui/Photo.astro`. Se migrará a `astro:assets <Image>` con material real.
- **Sin framework de UI** (React/Vue/Svelte) y **sin dependencias añadidas** más allá del stack base.

## 7. Cobertura de funcionalidades (Anexo II)

La propuesta contempla la funcionalidad mínima sugerida de Anexo II, cubierta de forma conceptual en
esta etapa:

- Inicio institucional ✓
- Información general de ExpoJuy ✓
- Agenda de actividades (vista simplificada en FeatureTrio) ✓
- Expositores, Noticias, Mapa interactivo, Compra de entradas — en `TODO` para etapas
  posteriores (Sprints 3-4).

## 8. Accesibilidad y performance

- Landmarks `header`/`main`/`footer`/`nav`, un solo `h1`, sin saltos de nivel de encabezado
  (verificado en `tests/homepage.spec.ts`).
- Skip link, `:focus-visible` en `gold-bright`, botones/enlaces semánticos y `sr-only` en controles
  solo-icono.
- `prefers-reduced-motion: reduce` desactiva parallax y reveals.
- Fuentes self-hosted con `swap` y preload; preconnect al CDN de imágenes; imágenes bajo el fold con
  lazy y `decoding="async"`.

## 9. Tecnologías propuestas

| Capa        | Tecnología                          | Versión |
| ----------- | ----------------------------------- | ------- |
| Framework   | Astro                               | ^7.2.10 |
| Estilos     | Tailwind CSS (vía `@tailwindcss/vite`) | ^4.3.3 |
| Lenguaje    | TypeScript                          | ^6.0.3  |
| Check       | `@astrojs/check`                    | ^0.9.10 |
| Tests       | Playwright (`@playwright/test`)     | ^1.62.1 |
| Runtime     | Node.js                             | >=22.12.0 |

## 10. Uso de Inteligencia Artificial

Se detalla en `docs/declaracion-uso-ia.md` (entregable de Anexo III).

---

## Pendientes del equipo antes de la entrega

- `TODO` — completar **nombre del equipo** e **integrantes**.
- `TODO` — subir y enlazar el **mockup navegable** (Figma o equivalente); `docs/design-spec.md` es
  la base de trabajo.
- `TODO` — **exportar esta memoria a PDF** y adjuntarla al formulario oficial.
- `TODO` — completar las **tecnologías** de la sección 9 si el equipo ajusta el stack en la entrega.
