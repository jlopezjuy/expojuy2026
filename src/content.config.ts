import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Content collections (Astro content layer).
 *
 * `noticias` — news posts written as native Markdown under
 * src/content/noticias/. No extra dependencies are needed: Astro parses the
 * markdown and renders it through `astro:content`'s `render()`.
 */
const noticias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/noticias' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    image: z.string().optional(),
    category: z.string().optional(),
  }),
});

export const collections = { noticias };
