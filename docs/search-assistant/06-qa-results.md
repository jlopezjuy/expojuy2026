# 06 · Resultados de QA

Todo lo que sigue es salida real de comandos ejecutados, no estimaciones.

## Compilación

```text
npm run check   →  0 errores, 0 advertencias  (73 archivos)
npm run build   →  15 páginas + dist/search-index.json  (~800 ms)
```

La línea de base del repositorio era 0/0 sobre 64 archivos; los 9 archivos
nuevos no introdujeron diagnósticos.

## Playwright

```text
246 passed
  3 failed
```

Los 3 fallos son **los preexistentes y documentados** en `AGENTS.md`:
`/contacto — WCAG AA con axe-core sin violaciones` en los tres viewports, por
`color-contrast` de `.text-teal` sobre `bg-cream` (`ContactSection.astro:28`).
No tienen relación con este trabajo.

Descomposición: línea de base 210 aprobadas + 36 nuevas de
`tests/assistant.spec.ts`, todas en verde en desktop, tablet y mobile.

## Consultas del pliego

Ejecutadas contra el índice de producción, con reloj fijado al 10/10/2026 15:00.

| Consulta | Res. | Primer resultado |
| --- | --- | --- |
| ¿Dónde puedo comer? | 5 | Patio Gastronómico "Sabores Jujeños" · servicio |
| ¿Hay comida sin TACC? | 5 | Patio Gastronómico "Sabores Jujeños" · servicio |
| ¿Dónde están los baños? | 1 | Sanitarios · servicio |
| ¿Dónde puedo estacionar? | 1 | Estacionamiento · servicio |
| ¿Qué actividades hay hoy? | 4 | Rondas Internacionales — Bloque Vespertino · `{Hoy}` |
| ¿Qué puedo hacer esta tarde? | 9 | Recorrido Oficial de Autoridades · `{A la tarde}` |
| ¿Qué empresas participan? | 23 | ClusteAR — Cámara de Empresas TICs |
| ¿Qué empresas de tecnología hay? | 3 | ClusteAR, Nubeliu, Telecom |
| ¿Dónde está el escenario? | 5 | Escenario Cultural · servicio |
| ¿Qué actividades hay el sábado? | 4 | Rondas Internacionales · `{Sábado 10}` |
| ¿Dónde encuentro productores de Jujuy? | 6 | Sales de Jujuy · expositor |
| ¿Dónde está el stand de Ledesma? | 2 | Ledesma S.A.A.I. · expositor |

`¿Hay comida sin TACC?` devuelve las opciones gastronómicas reales **sin
afirmar nada sobre celiaquía**: el dato no existe en el repositorio y el sistema
no lo inventa.

## Casos mínimos y de borde

Ejecutados en el navegador, contra el panel real. El panel recorta a 12
resultados (`MAX_RESULTS`), así que los conteos de esta tabla topan en 12
mientras los de la tabla anterior —tomados directamente del motor— llegan hasta 24.

| Entrada | Resultado |
| --- | --- |
| `comer` | 5 · Patio Gastronómico |
| `gastronomía` | 11 · Patio Gastronómico |
| `empresa` | 12 · ClusteAR |
| `stand` | 12 · FAQ de reserva de stand |
| `actividad` | 12 · Taller de Cerámica |
| `hoy` | 5 · jornada de apertura **+ aviso** |
| `baño` | 1 · Sanitarios |
| `estacionamiento` | 3 · Estacionamiento |
| `gastrnomia` (tipeo) | 11 · Patio Gastronómico **+ aviso de corrección** |
| `estacionamieto` (tipeo) | 3 · Estacionamiento **+ aviso** |
| `emrpesa` (tipeo) | 12 · JEMSE **+ aviso** |
| `` (vacía) | vuelve a las preguntas sugeridas |
| `   ` (espacios) | vuelve a las preguntas sugeridas |
| `!!!@@@###` | estado vacío, sin aviso residual |
| `zzzqqqxxx` | estado vacío |
| consulta de 120 caracteres · | 12 · **Nubeliu Cloud Solutions** |
| `qué actividades hay el sábado a la tarde` | 2 · combina ambos filtros |

La consulta larga era: *"¿Cuál es el stand de la empresa de tecnología que hace
software en la nube y dónde queda exactamente dentro del predio ferial?"*.

El aviso de fuera de fecha, verbatim:

> ExpoJuy 2026 es del 9 al 12 de octubre. Te muestro la jornada de apertura.

## Enlaces profundos

Verificados en el navegador contra el build de producción.

| URL | Resultado |
| --- | --- |
| `/mapa?zona=gastronomico` | zona con `aria-current="true"`, tarjeta y región `aria-live` actualizadas |
| `/agenda?dia=11` | 5 de 18 visibles, todas del día 11, chip "Día 11 de Octubre" presionado |
| `/expositores?q=Nubeliu Cloud Solutions` | 1 de 18, "Mostrando 1 de 18 expositores" |

## Rendimiento medido

Recursos transferidos (`encodedBodySize`, build de producción):

```text
carga inicial      sin cambios · 0 bytes agregados
al abrir el panel  37,8 KB
  engine.js        25,2 KB   (Orama + stemmer español)
  search-index     10,1 KB   (74 documentos, gzip)
  assistant.js      2,5 KB
```

```text
construcción de los dos índices   ~17 ms
consulta, promedio de 23          0,45 ms
consulta, peor caso (tipeo tol.2)  2,2 ms
```

## Hallazgos durante la implementación

Cinco comportamientos de Orama v3 que no eran evidentes y que se descubrieron
midiendo. Están documentados en los comentarios de `engine.ts` para que nadie
los "simplifique" sin saber por qué están.

1. **Orama busca por prefijo por defecto.** Con stemming español eso es
   destructivo: `stem("comer") = "com"`, prefijo de "comercio" y "comercial".
   Sin `exact: true`, *"¿dónde puedo comer?"* devolvía la Cámara de Comercio
   Exterior primero y el Patio Gastronómico ni entraba al podio.
2. **Con `exact: true`, `threshold` no afloja nada.** Orama exige todos los
   términos: `"comida tacc"` → 0 resultados, aunque `"comida"` sola devuelva 5.
   De ahí el escalón de rescate por término suelto.
3. **La coincidencia exacta es por campo.** `"stand de Ledesma"` no encontraba a
   Ledesma S.A.A.I. porque "stand" estaba en `keywords` y "Ledesma" en `title`.
   Se resolvió con un campo atrapa-todo.
4. **El stemmer rompe la tolerancia a tipeos.**
   `stem("estacionamiento") = "estacion"` pero
   `stem("estacionamieto") = "estacionamiet"`: distancia 8. Por eso hay un
   segundo índice sin stemming.
5. **`where` sobre `enum` necesita operador.** `{ date: '2026-10-10' }` lanza
   `INVALID_FILTER_OPERATION` contando los caracteres como operaciones; la forma
   correcta es `{ date: { eq: '2026-10-10' } }`. Y para filtrar sin término hay
   que **omitir** `term`, no mandar `term: ''`.

Y dos bugs propios, encontrados y corregidos en QA:

6. **`requestAnimationFrame` se posterga en pestañas en segundo plano.** El
   panel quedaba visible pero desplazado fuera de pantalla por su `transform`
   inicial, porque el atributo `data-open` nunca llegaba a aplicarse. Se
   reemplazó por un reflow forzado.
7. **`<header>` y `<footer>` dentro del panel rompían 27 pruebas.** El sitio
   garantiza exactamente uno de cada (`tests/pages.spec.ts:80`). Eran bandas
   visuales, no landmarks: pasaron a ser `div`.

## Accesibilidad

- El panel es `role="dialog"` con `aria-modal="true"` y `aria-labelledby`.
- Trampa de foco con Tab y Shift+Tab; Escape cierra y devuelve el foco al
  lanzador.
- El lanzador declara `aria-haspopup`, `aria-expanded` y `aria-controls`.
- El contador de resultados es `role="status"` con `aria-live="polite"`.
- El input tiene etiqueta asociada, oculta visualmente.
- Sin JavaScript el lanzador no se muestra (`html:not(.js) .assistant`), y el
  sitio funciona igual que antes.
- axe-core no reporta ninguna violación nueva en ninguna ruta.
- Las transiciones respetan `prefers-reduced-motion`.
