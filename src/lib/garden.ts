import { getCollection } from 'astro:content';

/**
 * 从文本中提取所有 [[slug]] 格式的 wiki 链接。
 * 返回去重后的 slug 数组。
 */
export function extractWikiLinks(body: string): string[] {
  const re = /\[\[([a-zA-Z0-9-_.]+)\]\]/g;
  const slugs = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = re.exec(body)) !== null) {
    slugs.add(match[1]);
  }
  return [...slugs];
}

/**
 * 计算所有 garden 条目之间的反向链接（backlinks）。
 * 扫描每个条目的 body，提取 [[slug]] 引用，
 * 构建 target slug → 引用它的 source slugs 的映射。
 *
 * 返回 Map<targetSlug, sourceSlug[]>
 */
export async function computeBacklinks(): Promise<Map<string, string[]>> {
  const entries = await getCollection('garden', ({ data }) => !data.draft);
  const validSlugs = new Set(entries.map((e) => e.id));

  const backlinks = new Map<string, string[]>();

  for (const entry of entries) {
    const body = entry.body ?? '';
    const links = extractWikiLinks(body);
    for (const target of links) {
      // 只记录指向已知 garden 条目的反向链接
      if (validSlugs.has(target)) {
        const sources = backlinks.get(target) || [];
        if (!sources.includes(entry.id)) {
          sources.push(entry.id);
          backlinks.set(target, sources);
        }
      }
    }
  }

  return backlinks;
}
