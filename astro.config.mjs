// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://mitoromisaka-blog.pages.dev',
  integrations: [react(), expressiveCode(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
