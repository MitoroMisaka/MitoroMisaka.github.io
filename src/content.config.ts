import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    slug: z.string(),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    pinned: z.boolean().default(false),
  }),
});

const garden = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/garden' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    stage: z.enum(['seedling', 'budding', 'evergreen']).default('seedling'),
    related: z.array(z.string()).default([]),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    slug: z.string(),
    pinned: z.boolean().default(false),
    mood: z.string().optional(),
  }),
});

const timeline = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/timeline' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    type: z.enum(['post', 'note', 'project', 'milestone', 'life']).default('milestone'),
    url: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const projectLink = z.object({
  label: z.string(),
  href: z.string().url(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    status: z.enum(['active', 'archived', 'planned']).default('active'),

    // Phase 2 optional fields
    slug: z.string().optional(),
    date: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    stack: z.array(z.string()).default([]),
    role: z.string().optional(),
    links: z.array(projectLink).default([]),
    weight: z.number().default(0),
  }),
});

export const collections = {
  posts,
  notes,
  timeline,
  projects,
  garden,
};
