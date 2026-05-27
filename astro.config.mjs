// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeWikiLinks from './src/lib/rehype-wiki-links.ts';

// Scan garden directory to build a set of known garden slugs.
// These are used by the rehype-wiki-links plugin to decide whether
// a [[slug]] link points to an existing garden entry or is "pending".
const gardenModules = import.meta.glob('/src/content/garden/*.mdx');
const gardenModulesMd = import.meta.glob('/src/content/garden/*.md');
const gardenSlugs = new Set<string>();
for (const path of [...Object.keys(gardenModules), ...Object.keys(gardenModulesMd)]) {
  const filename = path.split('/').pop()!;
  gardenSlugs.add(filename.replace(/\.mdx?$/, ''));
}

export default defineConfig({
  site: 'https://mitoromisaka-blog.pages.dev',
  integrations: [react(), expressiveCode(), mdx(), sitemap()],
  markdown: {
    rehypePlugins: [
      [rehypeWikiLinks, { gardenSlugs }],
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
