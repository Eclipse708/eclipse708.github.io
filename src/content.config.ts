// src/content.config.ts
// Astro 6+ requires each collection to declare a `loader`.
// The `glob` loader reads .md files from disk and generates an `id` per file
// from its filename (slugified). Use entry.id in routes/links, not entry.slug.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const primers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/primers' }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    date: z.coerce.date(),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    tags: z.array(z.string()),
    readingTime: z.number().int().positive(),
    draft: z.boolean().optional().default(false),
  }),
});

// Future: add `log` collection here when you start writeups.
// const log = defineCollection({
//   loader: glob({ pattern: '**/*.md', base: './src/content/log' }),
//   schema: z.object({ /* same shape */ }),
// });

export const collections = { primers };
