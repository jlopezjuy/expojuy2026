# 05 · Evolución: IA y geolocalización

## Bloqueo arquitectónico previo

El sitio es estático y **no tiene adapter**. Sin `@astrojs/node` (o Vercel,
Cloudflare, etc.) no existe runtime de servidor en producción: Nginx sirve
`dist/`. Ni Astro Actions ni un endpoint `/api/assistant` funcionan hoy.

**Ese es el primer paso de cualquier fase con IA**, y hay que decidirlo
conscientemente: agregar un adapter convierte un sitio estático de 15 páginas en
un sitio con servidor, con todo lo que implica de despliegue, monitoreo y costo.

## Actions contra endpoint

Una vez agregado el adapter:

| | Astro Actions | `/api/assistant` (endpoint) |
| --- | --- | --- |
| Tipado extremo a extremo | sí | manual |
| Invocación | `actions.assistant.ask()` | `fetch()` |
| Consumidores externos | no | sí |
| Streaming de la respuesta | incómodo | natural |
| Encaje con el código actual | el sitio no usa Actions en ninguna parte | `src/lib/api/client.ts` ya es un envoltorio de `fetch` |

**Recomendación: endpoint.** Tres razones concretas:

1. El proyecto ya tiene un patrón de acceso HTTP establecido y documentado
   (`src/lib/api/`, con `apiRequest<T>`). Un endpoint entra ahí sin inventar
   una segunda forma de hablar con el servidor.
2. El asistente vive en `scripts/assistant.ts`, TypeScript plano fuera del grafo
   de componentes de Astro. Las Actions rinden dentro de componentes y formularios.
3. La respuesta de un LLM se quiere en streaming. Un `Response` con
   `ReadableStream` es directo; con Actions es incómodo.

## Arquitectura de la respuesta

```text
pregunta del visitante
        │
        ▼
normalización + intención          ← ya existe, en el cliente
        │
        ▼
Orama · top K resultados           ← ya existe, en el cliente
        │
        ▼
POST /api/assistant                ← nuevo: sólo los K documentos + la pregunta
        │
        ▼
LLM con contexto recuperado        ← clave del servidor, nunca del cliente
        │
        ▼
respuesta en lenguaje natural + las mismas tarjetas de resultado
```

Lo importante: **la recuperación se mantiene en el cliente**. El servidor recibe
los documentos ya seleccionados, no una consulta libre contra una base. Eso
acota el gasto, hace la respuesta auditable y deja el buscador funcionando
aunque la IA esté caída o se acabe el presupuesto.

## Reglas irrenunciables

La IA **nunca** es fuente de conocimiento de ExpoJuy. Responde exclusivamente
con lo recuperado.

```text
Si la información no está en los documentos recuperados:
  "No encontré esa información disponible actualmente."
```

Nunca inventa horarios, stands, empresas, actividades, servicios, ubicaciones,
precios ni fechas. El sistema ya se comporta así sin IA — "¿Hay comida sin
TACC?" devuelve las opciones gastronómicas reales sin afirmar nada sobre
celiaquía — y la capa de IA no debe relajarlo.

Instrucción de sistema, en lo esencial:

- Respondé sólo con los documentos provistos.
- Si no alcanzan, decilo con esa frase exacta.
- No completes con conocimiento general sobre ferias, Jujuy ni las empresas.
- Citá siempre el título del documento que sustenta cada afirmación.
- Castellano rioplatense, breve.

## Seguridad de la fase con IA

| Riesgo | Mitigación |
| --- | --- |
| Clave de API expuesta | Sólo server-side. **Nunca** `PUBLIC_*` — Astro expone al cliente todo lo que lleve ese prefijo. `src/env.d.ts` hoy sólo declara `PUBLIC_API_BASE_URL`, que no es secreto. |
| Inyección de prompt vía la consulta | La consulta va en un bloque delimitado y marcado como dato, nunca concatenada a la instrucción de sistema. Límite de longitud. |
| Manipulación del contexto | El contexto lo arma el servidor a partir de IDs de documento validados contra el índice, no del texto que mande el cliente. |
| Contenido de terceros | Hoy no hay: todo el corpus es del repositorio. Si más adelante entran datos cargados por expositores, hay que sanearlos antes de indexarlos. |
| Abuso y costo | Rate limiting por IP en el endpoint, presupuesto máximo diario, y degradación a búsqueda sin IA al agotarse. |
| XSS en la respuesta | La respuesta del LLM se renderiza con `textContent`, igual que las tarjetas actuales. Nunca `innerHTML`. |

## Geolocalización

### Qué existe hoy

`src/data/plano.ts` tiene, por zona:

- `x` / `y`: porcentaje 0–100 del marcador sobre el plano.
- `svg`: rectángulo en el `viewBox` de 1000×620 de `PredioMap.astro`.

Eso es **espacio del plano, no del terreno**. No hay latitud ni longitud en
ninguna parte del frontend. Sin ellas, "¿qué hay cerca mío?" no es respondible:
el navegador entrega coordenadas del mundo y el sitio sólo conoce porcentajes de
una imagen.

### Qué ya está preparado

- `ExpoDocument` lleva `posX`/`posY` y `zoneId` en todos los documentos con
  ubicación. El 100% de los expositores tiene zona resuelta.
- Orama trae `geosearch` incorporado: agregar un campo `geopoint` al esquema no
  cambia la arquitectura, sólo el esquema y los adaptadores.
- El enlace profundo `/mapa?zona=` ya funciona, así que "llevame ahí" tiene
  destino.

### El camino, y ya está modelado

`expojuy-modelo.jdl` describe exactamente esta transformación:

- `PuntoGeorreferencia`: puntos de control con `posicionX`/`posicionY`
  normalizados **y** `latitud`/`longitud`. El puente entre los dos espacios.
- `GeorreferenciaPlano`: la transformación afín (`a0…a2`, `b0…b2`) de plano a
  coordenadas métricas, con error de ajuste y tolerancia.
- `PosicionGeografica`: la coordenada publicada, con método, estado e
  incertidumbre.

Los pasos, en orden:

1. La organización releva 4–6 puntos de control del predio con GPS.
2. Se calcula la transformación afín y se valida el error.
3. Se derivan latitud y longitud de cada zona a partir de su `x`/`y`.
4. Se agrega `geopoint` al esquema de Orama y se puebla desde los adaptadores.
5. Se agrega el intent `NEARBY` y `navigator.geolocation` **con permiso
   explícito**, degradando a "elegí tu zona" si se deniega.

**No hay que implementar nada de esto en el MVP.** Lo que importa es que no
está cerrado el camino: el modelo de documento tiene los campos, el motor
soporta geo, y el mapa ya recibe enlaces profundos.

### Precisión, con honestidad

Aun con georreferenciación, un predio ferial es un entorno hostil para el GPS de
un celular: techos metálicos, multitud, poca visibilidad de satélites. Los 10–30
metros de error típicos son comparables al tamaño de un pabellón. Por eso
`PosicionGeografica` modela `incertidumbreEstimadaMetros`: la UI debería decir
"estás cerca del Pabellón Agroindustrial" y no "estás a 12 metros del stand
A-02".
