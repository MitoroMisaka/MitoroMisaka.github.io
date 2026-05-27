import { useEffect } from 'react';
import mermaid from 'mermaid';

/**
 * MermaidRenderer — client:idle island that finds all <pre class="mermaid">
 * elements on the page and renders them as SVG diagrams.
 */
export default function MermaidRenderer() {
  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLPreElement>('pre.mermaid');
    if (!blocks.length) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
    mermaid.run({ nodes: Array.from(blocks) });
  }, []);

  return null;
}
