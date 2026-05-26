import { getCollection, type CollectionEntry } from 'astro:content';

type PostEntry = CollectionEntry<'posts'>;

export async function getPublishedPosts(): Promise<PostEntry[]> {
  const posts = await getCollection('posts', ({ data }: { data: { draft: boolean } }) => !data.draft);
  return posts.sort((a: PostEntry, b: PostEntry) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getRecentPosts(limit = 5): Promise<PostEntry[]> {
  const posts = await getPublishedPosts();
  return posts.slice(0, limit);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
