# 04 · Plan de MVP

## MVP 1 — implementado

Buscador estructurado con lenguaje natural básico.

- `src/data/servicios.ts`: servicios del visitante normalizados desde la prosa
  existente, con procedencia declarada.
- Índice estructurado de 74 documentos emitido en build.
- Orama con BM25, stemming español, tolerancia a tipeos y filtros por campo.
- Sinónimos es-AR horneados en el índice.
- Intención mínima: fecha, franja y tipo preferido.
- Modal flotante centrado con encuadre de marcas de corte (ver `07-visual-design.md`).
- Índice de preguntas sugeridas, filas de resultado editoriales, acciones reales.
- Enlaces profundos `?zona=`, `?dia=`, `?q=`.
- Métrica local y anónima.
- 36 pruebas Playwright en tres viewports.

**Estado: terminado y verificado.** Ver `06-qa-results.md`.

## MVP 2 — más intención, sin IA

Lo que se puede mejorar sin agregar un modelo ni costo variable.

1. **"¿Qué hay ahora?"** — filtrar por hora exacta, no sólo por franja. Los
   campos `startTime`/`endTime` ya están en el índice; falta comparar contra la
   hora actual y ordenar por "empieza en N minutos".
2. **Facetas visibles.** El motor ya devuelve conteos por tipo
   (`ExpoSearchResponse.facets`); falta renderizar los chips y filtrar al
   tocarlos.
3. **Autocompletado en el desplegable.** El escalón por prefijo ya existe; falta
   mostrar sugerencias mientras se escribe.
4. **Historial de la sesión.** Últimas consultas en `sessionStorage`, para no
   reescribir "¿dónde está el stand de X?".
5. **Anclas por elemento.** Dar `id` a cada tarjeta de expositor y de agenda
   para que el enlace profundo lleve al elemento y no sólo a la página filtrada.

## MVP 3 — capa de IA

Detallado en `05-ai-evolution.md`. Resumen: recuperación primero, generación
después, y nunca como fuente de conocimiento.

## MVP 4 — geolocalización

Detallado en `05-ai-evolution.md`. Requiere que la organización publique
coordenadas; hoy no existen.

## Qué NO hacer

- **No migrar `src/data/` a content collections.** Ya cumple lo que aportarían y
  la migración tocaría siete componentes sin ganancia funcional.
- **No convertir el asistente en una island de Preact.** Ship de JavaScript en
  todas las páginas a cambio de nada: el armazón ya se renderiza en el servidor
  y el comportamiento se carga bajo demanda.
- **No agregar un LLM para sinónimos o tipeos.** Está resuelto y cuesta cero por
  consulta.
- **No indexar el HTML** mientras exista la capa de datos estructurados.
- **No inventar datos de dietas, ubicaciones puntuales ni precios** para que el
  asistente "responda mejor". Decir que no se sabe es la respuesta correcta.
