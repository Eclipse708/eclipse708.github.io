// src/pages/rss.xml.ts
// Generates /rss.xml at build time. When LOG is added later, fetch that
// collection too and merge into `items` before sorting.
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const primers = (await getCollection('primers', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'eclipse708',
    description:
      'security primers, research, and notes — asfandyar nawaz khan / eclipse708',
    site: context.site!,
    items: primers.map((p) => ({
      title: p.data.title,
      description: p.data.dek,
      pubDate: p.data.date,
      link: `/primers/${p.id}/`,
      categories: p.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}