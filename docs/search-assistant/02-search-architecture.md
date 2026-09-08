# 02 · Arquitectura de búsqueda

## Principio

Una sola fuente de datos alimenta todo. La búsqueda es un consumidor más de
`src/data/`, igual que la UI. No se indexa HTML generado.

```text
                    src/data/*.ts  +  src/content/noticias/
                    (fuente única, tipada, validada en build)
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
       componentes Astro   lib/search/documents.ts   futuro backend
       (UI ya existente)   (adaptadores a documento)  (cuando exista)
                                   │
                                   ▼
                      pages/search-index.json.ts
                        (endpoint estático, build)
                                   │
                                   ▼
                        dist/search-index.json
                     74 documentos · 59 KB · 10 KB gzip
                                   │
                    ┌──────────────┴──────────────┐
                    │      al abrir el panel      │
                    ▼                             ▼
             lib/search/engine.ts          lib/search/intents.ts
             (Orama, dos índices)          (fecha / franja / tipo)
                    └──────────────┬──────────────┘
                                   ▼
                        scripts/assistant.ts
                     (panel, tarjetas, acciones)
                                   │
                                   ▼
                        /mapa?zona=  /agenda?dia=  /expositores?q=
                        (enhance.ts → manejadores ya existentes)
```

## Por qué NO indexar el HTML

Pagefind, el candidato obvio para un sitio estático, rastrea el HTML construido.
Eso descarta precisamente lo que este proyecto ya tiene bien resuelto:

- Se pierde el tipo. Un resultado deja de ser "expositor" o "servicio" y pasa a
  ser "un fragmento de la página /expositores". Sin tipo no hay facetas, ni
  tarjetas distintas, ni boost por intención.
- Se pierden los campos. `stand`, `rubro`, `zoneId`, `date` y `franja` son
  columnas, no texto corrido. "¿Qué hay el sábado a la tarde?" es un filtro
  sobre dos campos; sobre HTML es imposible.
- Se pierden las acciones. "Ver en el mapa" necesita saber el `zoneId` del
  resultado. Un índice de HTML sólo conoce la URL de la página.
- Se indexa basura. Header, footer, nav y copy repetidos entran al índice en
  todas las páginas.

Teniendo datos estructurados, derivar el índice del HTML sería tirar
información para después intentar adivinarla.

## Elección del motor

| | Orama | Pagefind | Fuse.js | Búsqueda en backend |
| --- | --- | --- | --- | --- |
| Fuente | datos estructurados | HTML construido | datos estructurados | base de datos |
| Ranking | BM25 | BM25 | sólo score difuso | según motor |
| Tolerancia a tipeos | sí (`tolerance`) | parcial | sí | según motor |
| Filtros por campo | sí (`where`) | filtros básicos | no | sí |
| Facetas | sí | sí | no | sí |
| Español (stemming) | sí (`@orama/stemmers`) | sí | no | según motor |
| Geo | `geosearch` incorporado | no | no | según motor |
| Vectorial / híbrida | sí | no | no | según motor |
| Peso en cliente | ~25 KB gzip, diferido | ~100 KB WASM + índice troceado | ~5 KB | 0 |
| Viable hoy | **sí** | sí | sí | **no** — no hay entidades ni runtime |

**Elegido: Orama.** No por moda: es el único que cubre a la vez filtros por
campo, facetas, stemming español y tolerancia a tipeos, y el único cuyo camino
de evolución (geo → vectorial → híbrida) no exige reescribir la capa de
búsqueda cuando lleguen la geolocalización y la IA.

Fuse.js habría alcanzado para un buscador de expositores, pero no da BM25 ni
facetas, y con consultas de varias palabras sobre 74 documentos heterogéneos el
ranking se degrada. La búsqueda en backend está descartada de entrada: no hay
entidades implementadas ni runtime de servidor.

## Índice: JSON plano, no índice serializado

Se descarta `@orama/plugin-data-persistence` para este tamaño. Con 74
documentos:

- El JSON crudo (59 KB, **10 KB gzip**) es más chico que el índice invertido
  persistido.
- Construir los dos índices en el navegador cuesta **~17 ms** (medido).
- El mismo JSON sirve de respaldo: si el chunk del motor no carga, el asistente
  filtra por substring sobre esos documentos en lugar de romperse.

El umbral para revisar esta decisión es del orden de **2.000–3.000
documentos**. A partir de ahí conviene persistir el índice.

## La escalera de búsqueda

Seis etapas, de más precisa a más permisiva. Se sube un escalón **sólo** si el
anterior devolvió cero resultados, así una consulta bien escrita nunca paga el
ruido de las etapas de rescate.

```text
1. exacta, con stemming, todos los términos     ← resuelve la mayoría
2. por término suelto (OR real), exacta         ← al visitante le sobra una palabra
3. por prefijo, con stemming                    ← autocompletado
4. tolerancia 1, SIN stemming                   ← error de tipeo
5. tolerancia 2, SIN stemming                   ← error de tipeo grave
6. sólo filtro de fecha/franja                  ← "esta tarde" sin más términos
```

Cada escalón responde a una falla medida, no a una intuición. Ver
`06-qa-results.md` para las mediciones que justifican el orden.

### Los dos índices

`engine.ts` construye dos bases Orama sobre los mismos documentos: una con
stemming español y otra sin él.

El motivo es concreto: el stemmer **rompe** la tolerancia a tipeos.

```text
stem("estacionamiento") = "estacion"
stem("estacionamieto")  = "estacionamiet"     ← distancia de edición: 8
```

Ninguna `tolerance` razonable cruza esa distancia, y subirla arruina la
precisión. Los escalones 4 y 5 usan el índice sin stemming, donde
`estacionamiento` ↔ `estacionamieto` es distancia 1.

### Campo atrapa-todo

La coincidencia exacta de Orama exige que **todos los términos caigan en el
mismo campo**. Sin eso, "stand de Ledesma" no encontraba a `Ledesma S.A.A.I.`:
"stand" vivía en `keywords` y "Ledesma" en `title`.

`keywords` repite título, subtítulo, stand y zona al indexar. La duplicación
ocurre en memoria del cliente, no en el JSON que se descarga.

## Sinónimos

Se expanden **en build**, dentro del campo `keywords` de cada documento
(`src/lib/search/synonyms.ts`). No hay expansión en tiempo de consulta: cuesta
cero en el cliente y BM25 lo aprovecha para el ranking.

```text
"comer" ─┐
"comida" ├─► keywords del Patio Gastronómico y de los 4 expositores
"hambre" │   de rubro Alimentos & Bebidas
"almorzar"┘
```

Los grupos están organizados por la clave real del dominio (`Expositor['rubro']`,
`TipoServicio`, `AgendaTrack['id']`, `Region['slug']`), así que agregar un
expositor de un rubro existente hereda sus sinónimos sin tocar nada.

Ortografía, plurales y acentos se cubren en tres capas complementarias:
`normalize()` quita tildes y signos, el stemmer resuelve la morfología
(`baños` → `baño`), y los escalones 4–5 el tipeo. No hace falta un LLM para
esto.

## Intención

Deliberadamente mínima (`src/lib/search/intents.ts`). Los sinónimos ya hacen
que "comer" llegue al patio gastronómico sin clasificador alguno; agregar uno
para eso sería sobreingeniería.

La capa existe sólo para las dos cosas que la búsqueda textual no puede hacer:

1. **Filtrar por fecha o franja.** "hoy", "el sábado", "esta tarde" son
   restricciones sobre `date`/`franja`, no términos que matchear.
2. **Priorizar un tipo.** "¿qué empresas hay?" debe rankear expositores antes
   que un FAQ que menciona la palabra "empresas". Se aplica como **boost, no
   como filtro duro**: si la conjetura es errónea, un filtro dejaría al
   visitante sin resultados; un boost sólo reordena.

Fuera de las fechas del evento, "hoy" **no** finge. Muestra la jornada de
apertura y lo aclara: *"ExpoJuy 2026 es del 9 al 12 de octubre."*

## Rendimiento

Medido sobre el build de producción, no estimado.

| | Antes | Después |
| --- | --- | --- |
| JS en la carga inicial | sin cambios | **sin cambios** (0 bytes agregados) |
| Al abrir el asistente | — | 37,8 KB transferidos |
| ↳ `engine.js` (Orama + stemmer) | — | 25,2 KB |
| ↳ `search-index.json` | — | 10,1 KB |
| ↳ `assistant.js` | — | 2,5 KB |
| Construcción del índice | — | ~17 ms |
| Consulta (promedio, 23 consultas) | — | **0,45 ms** |
| Build del sitio | 15 páginas / ~840 ms | 15 páginas + índice / ~800 ms |

El armazón del panel se renderiza en el servidor y viaja en el HTML, así que
abrir el asistente es instantáneo; lo que se descarga en ese momento es el
motor. Quien nunca lo abre no paga nada.

## Comportamiento sin conexión

En una feria la conectividad falla. El diseño degrada en escalones:

1. **Índice cacheado** (`Cache-Control: public, max-age=3600`): las visitas
   siguientes buscan sin red.
2. **Motor caído, índice disponible**: `createFallbackEngine()` filtra por
   substring sobre los mismos documentos.
3. **Todo caído**: el panel muestra un error honesto con enlaces a `/agenda`,
   `/expositores` y `/mapa`, que son páginas estáticas ya cacheadas.

Un service worker convertiría esto en offline real. No está en el MVP porque
implica una estrategia de invalidación que hoy nadie necesita — el índice cambia
sólo con cada build.
