// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export default defineConfig({
  site: 'https://mitoromisaka-blog.pages.dev',
  integrations: [react(), expressiveCode(), mdx(), sitemap()],
  markdown: {
    rehypePlugins: [
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
