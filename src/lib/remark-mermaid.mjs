/**
 * remark-mermaid — a remark plugin that intercepts ```mermaid code blocks
 * and converts them to raw <pre class="mermaid"> HTML before expressive-code
 * wraps them in its figure/syntax-highlighting structure.
 *
 * This must run BEFORE expressive-code processes code blocks.
 */

export default function remarkMermaid() {
  return (tree) => {
    for (const node of tree.children) {
      if (node.type === 'code' && node.lang === 'mermaid') {
        node.type = 'html';
        node.value = `<pre class="mermaid">${escapeHTML(node.value)}</pre>`;
        delete node.lang;
        delete node.meta;
      }
    }
  };
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
