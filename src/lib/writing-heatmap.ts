import { getCollection } from 'astro:content';

export interface HeatmapDatum {
  date: string;   // "YYYY-MM-DD"
  count: number;
}

/**
 * Aggregate creation dates from posts, notes, and garden (non-draft).
 * Returns a map of date strings ("YYYY-MM-DD") to counts.
 * Does NOT fill gaps — the React island will handle rendering of
 * date ranges including zero-count days.
 */
export async function getHeatmapData(): Promise<HeatmapDatum[]> {
  const [posts, notes, garden] = await Promise.all([
    getCollection('posts', ({ data }) => !data.draft),
    getCollection('notes', ({ data }) => !data.draft),
    getCollection('garden', ({ data }) => !data.draft),
  ]);

  const dateMap = new Map<string, number>();

  for (const entry of [...posts, ...notes, ...garden]) {
    const d = entry.data.date;
    if (!d) continue;
    const key = toDateKey(d);
    dateMap.set(key, (dateMap.get(key) || 0) + 1);
  }

  // Convert to sorted array
  const data: HeatmapDatum[] = [];
  for (const [date, count] of dateMap) {
    data.push({ date, count });
  }
  data.sort((a, b) => a.date.localeCompare(b.date));
  return data;
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
