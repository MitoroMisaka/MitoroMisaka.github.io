import { getCollection, type CollectionEntry } from 'astro:content';

type PostEntry = CollectionEntry<'posts'>;
type NoteEntry = CollectionEntry<'notes'>;
type ProjectEntry = CollectionEntry<'projects'>;

// ─── Unified Timeline Entry ────────────────────────────────────────

export interface UnifiedTimelineEntry {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: 'post' | 'note' | 'project' | 'milestone' | 'life';
  url?: string;
  tags: string[];
}

// ─── Posts ──────────────────────────────────────────────────────────

export async function getPublishedPosts(): Promise<PostEntry[]> {
  const posts = await getCollection('posts', ({ data }: { data: { draft: boolean } }) => !data.draft);
  return posts.sort((a: PostEntry, b: PostEntry) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getRecentPosts(limit = 5): Promise<PostEntry[]> {
  const posts = await getPublishedPosts();
  return posts.slice(0, limit);
}

// ─── Notes ──────────────────────────────────────────────────────────

export async function getPublishedNotes(): Promise<NoteEntry[]> {
  const notes = await getCollection('notes', ({ data }: { data: { draft: boolean } }) => !data.draft);
  return notes.sort((a: NoteEntry, b: NoteEntry) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getRecentNotes(limit = 5): Promise<NoteEntry[]> {
  const notes = await getPublishedNotes();
  return notes.slice(0, limit);
}

export async function getPinnedNotes(): Promise<NoteEntry[]> {
  const notes = await getPublishedNotes();
  return notes.filter((n: NoteEntry) => n.data.pinned);
}

// ─── Projects ───────────────────────────────────────────────────────

export async function getPublishedProjects(): Promise<ProjectEntry[]> {
  const projects = await getCollection('projects');
  return projects.sort((a: ProjectEntry, b: ProjectEntry) => {
    // Sort by weight desc, then by date desc
    const wA = a.data.weight ?? 0;
    const wB = b.data.weight ?? 0;
    if (wA !== wB) return wB - wA;
    const dA = a.data.date?.getTime() ?? 0;
    const dB = b.data.date?.getTime() ?? 0;
    return dB - dA;
  });
}

export function getProjectSlug(project: ProjectEntry): string {
  return project.data.slug ?? project.id;
}

export async function getProjectBySlug(slug: string): Promise<ProjectEntry | undefined> {
  const projects = await getPublishedProjects();
  return projects.find((p) => getProjectSlug(p) === slug);
}

export async function getAllProjectStacks(): Promise<string[]> {
  const projects = await getPublishedProjects();
  const stacks = new Set<string>();
  for (const p of projects) {
    for (const s of (p.data.stack ?? [])) {
      stacks.add(s);
    }
  }
  return [...stacks].sort();
}

// ─── Timeline ───────────────────────────────────────────────────────

export async function getAllTimelineEntries(): Promise<UnifiedTimelineEntry[]> {
  const [rawPosts, rawNotes, rawProjects, rawTimeline] = await Promise.all([
    getPublishedPosts(),
    getPublishedNotes(),
    getPublishedProjects(),
    getCollection('timeline', ({ data }: { data: { draft: boolean } }) => !data.draft),
  ]);

  const entries: UnifiedTimelineEntry[] = [];

  for (const post of rawPosts) {
    entries.push({
      id: `post:${post.data.slug}`,
      title: post.data.title,
      description: post.data.description,
      date: post.data.date,
      type: 'post',
      url: `/posts/${post.data.slug}`,
      tags: post.data.tags ?? [],
    });
  }

  for (const note of rawNotes) {
    const title = note.data.title ?? note.data.slug;
    entries.push({
      id: `note:${note.data.slug}`,
      title,
      description: note.data.description,
      date: note.data.date,
      type: 'note',
      url: `/notes/${note.data.slug}`,
      tags: note.data.tags ?? [],
    });
  }

  for (const project of rawProjects) {
    const slug = getProjectSlug(project);
    entries.push({
      id: `project:${slug}`,
      title: project.data.name,
      description: project.data.description,
      date: project.data.date ?? new Date('2026-01-01'),
      type: 'project',
      url: `/projects/${slug}`,
      tags: project.data.tags ?? [],
    });
  }

  for (const event of rawTimeline) {
    entries.push({
      id: `timeline:${event.id}`,
      title: event.data.title,
      description: event.data.description,
      date: event.data.date,
      type: event.data.type,
      url: event.data.url,
      tags: event.data.tags ?? [],
    });
  }

  // Sort by date descending, deduplicate by url
  const seen = new Set<string>();
  entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  return entries.filter((e) => {
    const key = e.url ?? e.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function groupTimelineEntriesByYear(
  entries: UnifiedTimelineEntry[],
): Map<number, UnifiedTimelineEntry[]> {
  const groups = new Map<number, UnifiedTimelineEntry[]>();
  for (const entry of entries) {
    const year = entry.date.getFullYear();
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year)!.push(entry);
  }
  // Sort years desc
  return new Map([...groups.entries()].sort((a, b) => b[0] - a[0]));
}

// ─── Shared ─────────────────────────────────────────────────────────

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
