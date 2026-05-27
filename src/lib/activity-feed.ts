import { getCollection, type CollectionEntry } from 'astro:content';

export interface ActivityItem {
  /** Content type */
  type: 'post' | 'note' | 'garden' | 'project';
  /** Display title */
  title: string;
  /** Link URL */
  url: string;
  /** Date of the activity */
  date: Date;
  /** Action label */
  action: 'created' | 'updated';
}

type GardenEntry = CollectionEntry<'garden'>;
type ProjectEntry = CollectionEntry<'projects'>;

function getGardenSlug(entry: GardenEntry): string {
  return entry.id;
}

function getProjectSlug(entry: ProjectEntry): string {
  return entry.data.slug ?? entry.id;
}

/**
 * Build a sorted activity feed from posts, notes, garden, and projects.
 * Sorts by date descendant, deduplicates entries with the same URL,
 * and returns up to `limit` items.
 */
export async function getActivityFeed(limit = 10): Promise<ActivityItem[]> {
  const [posts, notes, garden, projects] = await Promise.all([
    getCollection('posts', ({ data }) => !data.draft),
    getCollection('notes', ({ data }) => !data.draft),
    getCollection('garden', ({ data }) => !data.draft),
    getCollection('projects'),
  ]);

  const items: ActivityItem[] = [];

  for (const post of posts) {
    items.push({
      type: 'post',
      title: post.data.title,
      url: `/posts/${post.data.slug}`,
      date: post.data.updated ?? post.data.date,
      action: post.data.updated ? 'updated' : 'created',
    });
  }

  for (const note of notes) {
    const title = note.data.title ?? note.data.slug;
    items.push({
      type: 'note',
      title,
      url: `/notes/${note.data.slug}`,
      date: note.data.updated ?? note.data.date,
      action: note.data.updated ? 'updated' : 'created',
    });
  }

  for (const entry of garden) {
    items.push({
      type: 'garden',
      title: entry.data.title,
      url: `/garden/${getGardenSlug(entry)}`,
      date: entry.data.updated ?? entry.data.date,
      action: entry.data.updated ? 'updated' : 'created',
    });
  }

  for (const project of projects) {
    const d = project.data.date;
    const updated = project.data.updated;
    if (!d) continue;
    items.push({
      type: 'project',
      title: project.data.name,
      url: `/projects/${getProjectSlug(project)}`,
      date: updated ?? d,
      action: updated ? 'updated' : 'created',
    });
  }

  // Sort by date descending, deduplicate by url
  items.sort((a, b) => b.date.getTime() - a.date.getTime());
  const seen = new Set<string>();
  const result: ActivityItem[] = [];
  for (const item of items) {
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    result.push(item);
  }
  return result.slice(0, limit);
}
