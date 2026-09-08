# 07 · Diseño visual del asistente

## El problema que resuelve

La primera versión era un panel lateral que funcionaba bien y se veía genérico.
No por estar mal hecho: por **ignorar las decisiones que el sitio ya había
tomado**.

| Eje | Sistema del sitio | Panel v1 |
| --- | --- | --- |
| Radio | `--radius-card: 0.5rem`, uno solo | `rounded-card` **y** `rounded-full` |
| Escala tipográfica | `text-hero` 22rem junto a `eyebrow` 0.68rem | todo entre 0.7 y 1.1rem |
| Firma | eyebrow tracked `.22em` + display con cola en color (`SectionHeading.astro`) | ausente |
| Contraste | cream/night, editorial, alto | gris sobre crema |

Esa incoherencia es exactamente lo que se lee como "generado". La literatura de
diseño lo describe como convergencia hacia la media estadística del corpus de
entrenamiento: bordes redondeados, sombras suaves, chips idénticos, acento
pastel. El síntoma es que **no se percibe ninguna decisión tomada**.

El principio correctivo es uno solo: *para cada eje, elegí un valor y repetilo
en todos lados*. El sitio ya lo había hecho. El asistente ahora lo obedece.

## Decisiones

### Modal, no panel

Centrado y flotante. Es el patrón estándar del command palette y se comporta
igual en escritorio y en mobile — un solo layout, no dos. En mobile conserva
margen contra los bordes: si el modal toca la pantalla, el encuadre se pierde y
vuelve a leerse como hoja inferior.

### Un solo radio, y el encuadre por dentro

El sitio usa `--radius-card: 0.5rem`. El modal también. Las esquinas filosas del
encuadre **no** son las del contenedor: son cuatro marcas de corte dibujadas con
`inset: 0.75rem`, enmarcando el contenido.

Es el gesto de las marcas de corte de imprenta —coherente con una identidad
editorial— y de paso resuelve la tensión sin introducir un segundo radio en el
sistema.

```text
┌─────────────────────────────────┐  ← contenedor, radio 0.5rem
│ ┌─                         ─┐   │  ← marcas de corte, filosas, inset 12px
│                                 │
│   ■ ASISTENTE DE VISITA     ✕   │
│                                 │
│   ¿Qué querés encontrar?        │  ← display + cola magenta
│   ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁      │  ← línea de escritura
│                                 │
│   01 ── ¿Dónde puedo comer?  →  │
│   ─────────────────────────     │
│   02 ── ¿Qué hay hoy?        →  │
│                                 │
│ └─                         ─┘   │
└─────────────────────────────────┘
```

### Superficie clara, y la restricción que impone

`cream`, la misma del sitio. El modal se lee como parte de la página, no como un
modo aparte.

Esa elección **restringe la paleta**, y la restricción es del sistema, no una
preferencia. Sobre `cream #f7efe1`:

| Color | Ratio aprox. | ¿Sirve como texto? |
| --- | --- | --- |
| `night` | ~16:1 | sí |
| `magenta` | ~4.9:1 | sí |
| `gold` | ~1.9:1 | **no** |
| `teal` | ~2:1 | **no** — `AGENTS.md` ya lo advierte |

Así que el acento de texto es `magenta`, el mismo que usa `SectionHeading` por
defecto en superficies claras. `gold` sobrevive en un solo lugar: el badge de
stand, donde es **fondo** y el texto es `night`, exactamente como ya lo resuelve
`Expositores.astro`.

El lanzador se mantiene en `night`: es un CTA que flota sobre bandas claras y
oscuras, y el sitio ya resuelve así sus botones principales.

### El input es una línea, no una caja

El cambio que más aleja al modal del formulario genérico. Sólo borde inferior;
el foco lo colorea en `magenta` en lugar de dibujar un anillo. El texto usa
`--font-display` a `text-title`: escribir se siente como escribir un titular, no
como llenar un campo.

Se oculta la ✕ nativa de `input[type="search"]`: competía con el botón de cerrar
del modal y rompía la línea.

### Sugerencias como índice, no como chips

Seis chips idénticos con icono y caja no tienen jerarquía — es una lista de
botones. El reemplazo es un sumario de revista: numeral tabular en `magenta`,
separadores hairline, y la flecha que entra al hacer hover. Los numerales dan
orden de lectura; las cajas no daban nada.

### Resultados como filas, no como tarjetas

Una tarjeta con borde y fondo dentro de un modal es una caja dentro de otra
caja: duplica el marco y aplana la jerarquía. Ahora la separación la da un
hairline y la jerarquía la da la escala:

```text
SERVICIO                          ← eyebrow magenta, tracked .2em
Patio Gastronómico "Sabores…"     ← display 1.125rem, night
EN CADA PABELLÓN DEL PREDIO       ← meta uppercase, night/55
Área al aire libre con food…      ← body, night/70, máx 52ch
VER EN EL MAPA →                  ← acción como link de texto
```

El metadato se deduplica contra el título: sin eso, "Patio Gastronómico" se
leía tres veces en la misma fila.

### El indicador que hace un trabajo

La dirección elegida incluía un punto "● REC". Se descartó el literal: imitar la
UI de una cámara es decorativo y envejece mal.

En su lugar hay un **cuadrado** de 6px en `magenta` —cuadrado, no círculo,
porque el punto redondo *es* la convención de grabación— que late **sólo
mientras se está buscando**. En reposo es una marca de color. El guiño se
mantiene; el elemento además comunica estado.

### Lanzador

Rectángulo con `--radius-card`, no píldora. La píldora era el segundo radio del
sistema.

## El bug de scroll, y por qué no era obvio

Con el modal abierto, el contenido desbordado **no scrolleaba con la rueda del
mouse** en escritorio. El diagnóstico descartó lo evidente:

- `overflow-y: auto` estaba aplicado.
- `scrollHeight` (1027px) superaba ampliamente a `clientHeight` (302px).
- `el.scrollTop = 200` funcionaba: el contenedor **sí** era scrolleable.
- `elementsFromPoint` sobre el centro del cuerpo no mostraba nada tapándolo.

La causa estaba fuera del componente. `initSmoothScroll()` monta **Lenis** con
`smoothWheel: true`, y Lenis captura el evento `wheel` a nivel de documento para
traducirlo a su propio scroll. Con la página bloqueada en `overflow: hidden`
mientras el modal está abierto, ese scroll no iba a ningún lado — y el modal
nunca recibía el evento.

Lenis sólo se monta si existe `[data-parallax]`, no hay `prefers-reduced-motion`
y el viewport cumple `(min-width: 64rem) and (pointer: fine)`. Por eso el bug
aparecía **sólo en escritorio y sólo en la home**, que es justo donde se lo
encontró.

La solución es el mecanismo previsto por Lenis: `data-lenis-prevent` en el
contenedor scrolleable.

Está cubierto por una prueba que usa la rueda real (`page.mouse.wheel`), no
`scrollTop`: con `scrollTop` la prueba pasaría igual con el bug presente. Se
verificó que la prueba **falla** al quitar el atributo.

## Accesibilidad

Contraste sobre `cream #f7efe1`: `night` ≈16:1, `night/70` ≈9:1, `night/55`
≈5.5:1, `magenta` ≈4.9:1. Todos pasan AA. `gold` aparece únicamente como fondo
de badge, con texto `night` encima.

El anillo global de `:focus-visible` se suprime **sólo** en el input, donde el
foco ya se comunica con el color del subrayado. Todo el resto lo conserva.

`prefers-reduced-motion` desactiva la entrada del modal y el latido del
indicador.

Las marcas de corte son `aria-hidden`.

## Verificación

`astro check` 0/0 sobre 74 archivos. Playwright **249 aprobadas / 3 fallidas** —
las 3 son la línea de base preexistente de `/contacto`. Los 39 tests del
asistente están en verde: los dos rediseños preservaron todos los hooks
`data-assistant-*`.
