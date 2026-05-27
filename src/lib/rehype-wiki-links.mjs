/**
 * rehype-wiki-links — 自定义 rehype plugin
 *
 * 遍历 AST 中的 text 节点，匹配 [[slug]] 格式的 wiki 链接并将其替换为
 * <a href="/garden/slug"> 元素。已知 slug 生成正常链接，
 * 未知 slug 添加 .pending class。
 */

import { visit } from 'unist-util-visit';

const WIKI_LINK_RE = /\[\[([a-zA-Z0-9-_.]+)\]\]/g;

/**
 * @param {object} options
 * @param {Set<string>} options.gardenSlugs
 */
export default function rehypeWikiLinks(options) {
  const { gardenSlugs } = options;

  return (/** @type {import('hast').Root} */ tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === undefined) return;

      const value = /** @type {string} */ (node.value);
      const matches = [];

      // Reset regex state
      WIKI_LINK_RE.lastIndex = 0;
      let match;
      while ((match = WIKI_LINK_RE.exec(value)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          slug: match[1],
        });
      }

      if (matches.length === 0) return;

      // Build replacement nodes
      const replacement = [];
      let lastEnd = 0;

      for (const m of matches) {
        if (m.start > lastEnd) {
          replacement.push({ type: 'text', value: value.slice(lastEnd, m.start) });
        }

        const known = gardenSlugs.has(m.slug);
        const anchor = {
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

      if (lastEnd < value.length) {
        replacement.push({ type: 'text', value: value.slice(lastEnd) });
      }

      parent.children.splice(index, 1, ...replacement);
    });
  };
}
