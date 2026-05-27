import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeWikiLinks from './src/lib/rehype-wiki-links.mjs';
import remarkMermaid from './src/lib/remark-mermaid.mjs';
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
  integrations: [
    react(),
    expressiveCode({
      // Only enable syntax highlighting for explicit languages.
      // 'mermaid' is NOT listed so its code blocks stay as raw <pre><code>
      // and are rendered client-side by mermaid.astro.
      languages: [
        'bash', 'sh', 'shell', 'zsh',
        'js', 'javascript', 'cjs', 'mjs',
        'ts', 'typescript',
        'tsx', 'jsx',
        'json', 'jsonc', 'json5',
        'yaml', 'yml',
        'md', 'mdx',
        'html', 'css', 'scss',
        'python', 'py',
        'rust', 'rs',
        'go',
        'swift',
        'java', 'kotlin',
        'c', 'cpp', 'csharp', 'cs',
        'diff',
        'sql',
        'text', 'plaintext', 'txt',
        'xml', 'svg',
        'graphql', 'gql',
        'toml',
        'ini', 'env',
        'dockerfile', 'docker',
        'makefile',
        'nginx',
        'php',
        'ruby', 'rb',
        'lua',
        'powershell', 'ps1',
        'astro',
      ],
      // frames plugin is enabled by default in 0.42,
      // supporting title="filename.py" syntax on code fences.
      styleOverrides: {
        // Keep frames styling clean and aligned with the 日系 aesthetic.
        frames: {
          frameBoxShadowCssValue: 'none',
          tooltipSuccessBackground: 'var(--brand)',
        },
      },
    }),
    mdx({
      remarkPlugins: [remarkMermaid],
    }),
    sitemap(),
  ],
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
