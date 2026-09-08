# 03 · Modelo de datos buscable

## `ExpoDocument`

Un único tipo plano (`src/lib/search/types.ts`). Plano a propósito: Orama indexa
mejor sin anidamiento y la UI renderiza una sola clase de tarjeta.

```ts
interface ExpoDocument {
  id: string;              // `<type>:<slug>`, estable entre builds
  type: ExpoDocType;       // expositor | actividad | zona | servicio | faq | noticia | info

  title: string;
  subtitle?: string;       // rubro, jornada+horario, o ubicación textual
  body: string;
  keywords: string;        // sinónimos; campo de recall, nunca se muestra

  // Ubicación: la que existe (zonas del plano), no GPS
  zoneId?: string;         // FK a plano.ts
  zoneName?: string;
  stand?: string;          // "M-01"
  pabellon?: string;
  posX?: number;           // % del marcador en el plano
  posY?: number;

  // Agenda (derivado de agenda.ts)
  date?: string;           // ISO "2026-10-09"
  startTime?: string;      // "10:00"
  endTime?: string;
  franja?: 'manana' | 'tarde' | 'noche';

  url: string;             // ruta real del sitio, siempre existe
  actions: ExpoAction[];   // sólo acciones que la app puede cumplir hoy
}
```

Diferencias respecto del modelo genérico habitual, y por qué:

- **No hay `latitude`/`longitude`.** No existen en el repositorio. Un campo
  vacío invita a llenarlo con datos inventados. La ubicación real del dominio
  es la zona del plano; cuando haya GPS se agrega (ver `05-ai-evolution.md`).
- **`franja` es un campo, no un cálculo.** Se deriva en build de `startTime` y
  se indexa como `enum` para que Orama pueda filtrarlo con `where`.
- **`actions` es una lista cerrada de rutas verificadas.** No se declara una
  acción sin ruta real.

## Corpus generado

74 documentos. Todos derivados; ninguno inventado.

| Tipo | N | Origen | Etiqueta en la tarjeta |
| --- | --- | --- | --- |
| `expositor` | 18 | `src/data/expositores.ts` | Empresa |
| `actividad` | 18 | `src/data/agenda.ts` | Actividad |
| `servicio` | 13 | `src/data/servicios.ts` (nuevo) | Servicio |
| `zona` | 8 | `src/data/plano.ts` | Zona del predio |
| `faq` | 8 | `src/data/faq.ts` | Información |
| `info` | 5 | `src/data/site.ts` (evento + 4 regiones) | ExpoJuy |
| `noticia` | 4 | `src/content/noticias/` | Noticia |

## Derivaciones

Tres, todas explícitas y auditables en `src/lib/search/documents.ts`.

**1. Fecha ISO de la agenda.** `day: '9'` + octubre 2026 → `2026-10-09`. El mes
y el año están confirmados por `site.ts` (`datesLong: 'OCTUBRE 2026'`) y por el
JSON-LD de `BaseLayout.astro` (`startDate: '2026-10-09T10:00:00-03:00'`).

**2. Horarios y franja.** `'10:00 - 11:30 hs'` → `startTime: '10:00'`,
`endTime: '11:30'`. La franja sale de la hora de inicio: mañana < 13, tarde
< 19, noche a partir de las 19.

**3. Zona de cada expositor, por prefijo de código de stand.** Éste es el punto
importante:

```text
plano.ts declara  stands: ['Stand M-01', 'Stand M-02', ...]
                                   ▲
                          prefijo 'M' → zona 'mineria'

expositores.ts declara  stand: 'M-01'  →  prefijo 'M'  →  zona 'mineria'
```

El mapa se construye **leyendo `plano.ts`**, no escrito a mano. Si mañana cambia
una zona, se recalcula solo. Resuelve los 18 expositores.

Deliberadamente **no** se emparejan por nombre: `plano.ts` y `expositores.ts`
ya divergen en cinco de las razones sociales (ver `01-current-state.md`,
problema 6). Emparejar por código es exacto; por nombre sería adivinar.

Para la agenda, `location` es texto libre. Se resuelve primero contra las salas
con nombre propio declaradas en `servicios.ts` y después por coincidencia con
el nombre y los stands de cada zona. Lo que no resuelve **queda sin zona**:
`Espacio Talleres` no está en `plano.ts`, así que esa actividad no ofrece "ver
en el mapa". Es preferible no ofrecer la acción a mandar al visitante al lugar
equivocado.

## `src/data/servicios.ts` — el archivo nuevo

Es la única adición de datos, y **no aporta información nueva**. Normaliza prosa
que ya estaba en el repositorio. Cada entrada declara su origen en un campo
`fuente`, auditable:

| Servicio | Fuente |
| --- | --- |
| Sanitarios | `faq.ts` — "sanitarios accesibles y adaptados en cada pabellón" |
| Estacionamiento | `faq.ts` — "playa de estacionamiento custodiada… más de 1.500 vehículos" |
| Wi-Fi, cajeros, áreas de descanso | `faq.ts` — servicios del recinto |
| Primeros auxilios, guardarropa | `plano.ts` — nota de la zona `accesos` |
| Boleterías, acreditaciones, mesa de informes | `plano.ts` — stands de la zona `accesos` |
| Patio Gastronómico, Escenario Cultural | `plano.ts` — zona `gastronomico` |
| Auditorio Principal | `plano.ts` — stand "Auditorio Central (450 cap)" |

`zoneId: null` significa **distribuido o sin ubicación puntual publicada**, y la
UI lo dice así ("En cada pabellón del predio"). No se inventa un punto en el
mapa para un baño cuya posición exacta nadie publicó.

## Lo que el asistente no sabe, y lo dice

- **Dietas.** No hay "sin TACC", celiaquía, vegano ni alérgenos en ningún
  archivo. "¿Hay comida sin TACC?" devuelve las opciones gastronómicas reales,
  sin afirmar nada sobre celiaquía. Cuando la organización provea el dato, el
  camino es un campo `dietas?: string[]` en los expositores gastronómicos, que
  entra al índice sin tocar el motor.
- **Ubicación puntual de sanitarios y estacionamiento.**
- **Precios más allá de los dos de `faq.ts`** ($3.500 general, $10.000 abono).
- **Coordenadas geográficas de cualquier cosa.**

## Acciones disponibles hoy

Sólo se declaran acciones que la aplicación puede cumplir. Los tres enlaces
profundos se implementaron como parte de este trabajo (`initDeepLinks()` en
`enhance.ts`) y reutilizan los manejadores de filtro existentes.

| Acción | Ruta | Estado |
| --- | --- | --- |
| Ver en el directorio | `/expositores?q=<nombre>` | ✅ implementado |
| Ver en la agenda | `/agenda?dia=<9\|10\|11\|12>` | ✅ implementado |
| Ver en el mapa | `/mapa?zona=<zoneId>` | ✅ implementado |
| Ver el plano del predio | `/mapa` | ✅ ya existía |
| Ver preguntas frecuentes | `/preguntas-frecuentes` | ✅ ya existía |
| Leer la noticia | `/noticias/<slug>` | ✅ ya existía |
| Cómo llegar | — | ❌ no existe ruta ni dato de acceso; no se declara |

## Reglas para quien agregue datos

Valen las de `src/data/AGENTS.md`, más dos propias del buscador:

1. **Un expositor nuevo hereda sus sinónimos del rubro.** Si el rubro es nuevo,
   agregar su grupo en `rubroSynonyms` — si no, el visitante no llega por
   vocabulario, sólo por nombre exacto.
2. **Un stand nuevo con prefijo desconocido queda sin zona.** Agregar el stand a
   la zona correspondiente en `plano.ts` para que el mapa lo resuelva.
