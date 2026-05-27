import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeWikiLinks from './src/lib/rehype-wiki-links.mjs';
import { readdirSync } from 'fs';
import { resolve } from 'path';

const gardenDir = resolve('src/content/garden');

function getGardenSlugs() {
  try {
    const files = readdirSync(gardenDir);
    const slugs = new Set();
    for (const file of files) {
      if (file.endsWith('.mdx') || file.endsWith('.md')) {
        slugs.add(file.replace(/\.mdx?$/, ''));
      }
    }
    return slugs;
  } catch {
    return new Set();
  }
}

export default defineConfig({
  site: 'https://mitoromisaka-blog.pages.dev',
  integrations: [react(), expressiveCode(), mdx(), sitemap()],
  markdown: {
    rehypePlugins: [
      [rehypeWikiLinks, { gardenSlugs: getGardenSlugs() }],
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: {
            'class': 'heading-anchor',
            'aria-label': 'Link to this heading',
          },
          content: {
            type: 'text',
            value: '#',
          },
        },
      ],
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
