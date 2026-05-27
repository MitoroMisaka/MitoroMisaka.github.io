import { getCollection } from 'astro:content';

/**
 * Count word-like units in a body string.
 * CJK characters count individually; Latin/other scripts count by whitespace-delimited tokens.
 */
function countWords(text: string): number {
  if (!text) return 0;
  const cjkRe = /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g;
  const cjkCount = (text.match(cjkRe) || []).length;

  // Remove CJK spans, then count remaining word tokens
  const withoutCJK = text.replace(cjkRe, ' ').replace(/[^\p{L}\p{N}]/gu, ' ').trim();
  const wordTokens = withoutCJK ? withoutCJK.split(/\s+/) : [];
  return cjkCount + wordTokens.length;
}

/**
 * Traverse all posts, notes, and garden entries (non-draft) and
 * return the total word count across their body fields.
 */
export async function getTotalWordCount(): Promise<number> {
  const [posts, notes, garden] = await Promise.all([
    getCollection('posts', ({ data }) => !data.draft),
    getCollection('notes', ({ data }) => !data.draft),
    getCollection('garden', ({ data }) => !data.draft),
  ]);

  let total = 0;
  for (const entry of [...posts, ...notes, ...garden]) {
    total += countWords(entry.body ?? '');
  }
  return total;
}

/**
 * Return the number of days from the earliest content date to today (minimum 1).
 * Looks across posts, notes, garden, and projects.
 */
export async function getTotalDays(): Promise<number> {
  const [posts, notes, garden, projects] = await Promise.all([
    getCollection('posts', ({ data }) => !data.draft),
    getCollection('notes', ({ data }) => !data.draft),
    getCollection('garden', ({ data }) => !data.draft),
    getCollection('projects'),
  ]);

  let earliest: Date | null = null;
  for (const entry of [...posts, ...notes, ...garden, ...projects]) {
    const d = entry.data.date;
    if (d && (!earliest || d < earliest)) earliest = d;
  }
  if (!earliest) return 1;
  const days = Math.ceil((Date.now() - earliest.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(days, 1);
}
