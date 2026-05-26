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

export async function getAllTags(): Promise<Map<string, number>> {
  const posts = await getPublishedPosts();
  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }
  return new Map([...tagCounts.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

export async function getAllCategories(): Promise<Map<string, number>> {
  const posts = await getPublishedPosts();
  const catCounts = new Map<string, number>();
  for (const post of posts) {
    const cat = post.data.category;
    catCounts.set(cat, (catCounts.get(cat) || 0) + 1);
  }
  return catCounts;
}
