import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '../lib/content-helpers';
import { siteConfig } from '../lib/site-config';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site ?? siteConfig.siteUrl,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/posts/${post.data.slug}/`,
    })),
  });
}
