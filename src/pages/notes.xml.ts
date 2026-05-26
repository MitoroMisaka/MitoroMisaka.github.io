import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedNotes } from '../lib/content-helpers';
import { siteConfig } from '../lib/site-config';

export async function GET(context: APIContext) {
  const notes = await getPublishedNotes();

  return rss({
    title: `${siteConfig.title} — 碎念`,
    description: '短想法、开发随笔、AI 工作流记录。',
    site: context.site ?? siteConfig.siteUrl,
    items: notes.map((note) => {
      const title = note.data.title ?? note.data.slug;
      return {
        title,
        pubDate: note.data.date,
        description: note.data.description ?? `碎念: ${title}`,
        link: `/notes/${note.data.slug}/`,
      };
    }),
  });
}
