/**
 * Índice buscable, emitido como archivo estático en build → `dist/search-index.json`.
 *
 * Se sirve como JSON plano, NO como índice de Orama serializado. Con ~75
 * documentos el JSON crudo es más chico que el índice invertido persistido, y
 * construir el índice en el cliente cuesta pocos milisegundos. Además el JSON
 * sirve de respaldo legible: si Orama no carga (chunk caído, red mala en el
 * predio), el asistente todavía puede filtrar por substring sobre estos mismos
 * documentos.
 *
 * Si el corpus creciera al orden de miles de documentos, conviene revisar la
 * decisión y pasar a `@orama/plugin-data-persistence`.
 */

import type { APIRoute } from 'astro';

import { buildDocuments } from '../lib/search/documents';
import type { SearchIndexPayload } from '../lib/search/types';

export const prerender = true;

export const GET: APIRoute = async () => {
  const documents = await buildDocuments();

  const payload: SearchIndexPayload = {
    generatedAt: new Date().toISOString(),
    documents,
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
