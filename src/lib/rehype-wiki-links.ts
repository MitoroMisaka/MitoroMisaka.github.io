/**
 * rehype-wiki-links — 自定义 rehype 插件
 *
 * 遍历 AST 中的 text 节点，匹配 [[slug]] 格式的 wiki 链接并将其替换为
 * <a href="/garden/slug"> 元素。已知 slug（存在于 gardenSlugs 集合中）生成正常链接，
 * 未知 slug 添加 .pending class（灰色虚线样式）。
 *
 * 用法（在 astro.config.mjs 中）：
 *   import rehypeWikiLinks from './src/lib/rehype-wiki-links.ts';
 *   // ...
 *   markdown: { rehypePlugins: [[rehypeWikiLinks, { gardenSlugs: slugSet }]] }
 */

import type { Root, Text, Element } from 'hast';
import { visit } from 'unist-util-visit';

interface RehypeWikiLinksOptions {
  gardenSlugs: Set<string>;
}

const WIKI_LINK_RE = /\[\[([a-zA-Z0-9-_.]+)\]\]/g;

export default function rehypeWikiLinks(options: RehypeWikiLinksOptions) {
  const { gardenSlugs } = options;

  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index: number | undefined, parent: any) => {
      if (!parent || index === undefined) return;

      const value = node.value;
      const matches: Array<{ start: number; end: number; slug: string }> = [];
      let match: RegExpExecArray | null;

      // Reset regex state
      WIKI_LINK_RE.lastIndex = 0;
      while ((match = WIKI_LINK_RE.exec(value)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          slug: match[1],
        });
      }

      if (matches.length === 0) return;

      // Build replacement nodes
      const replacement: (Text | Element)[] = [];
      let lastEnd = 0;

      for (const m of matches) {
        // Text before the match
        if (m.start > lastEnd) {
          replacement.push({
            type: 'text',
            value: value.slice(lastEnd, m.start),
          });
        }

        const known = gardenSlugs.has(m.slug);
        const anchor: Element = {
          type: 'element',
          tagName: 'a',
          properties: known
            ? { href: `/garden/${m.slug}` }
            : { href: `/garden/${m.slug}`, class: 'pending' },
          children: [{ type: 'text', value: m.slug }],
        };
        replacement.push(anchor);

        lastEnd = m.end;
      }

      // Remaining text after last match
      if (lastEnd < value.length) {
        replacement.push({
          type: 'text',
          value: value.slice(lastEnd),
        });
      }

      // Splice replacement into parent
      parent.children.splice(index, 1, ...replacement);
    });
  };
}
