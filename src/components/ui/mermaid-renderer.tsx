import { useEffect } from 'react';

/**
 * MermaidRenderer — client:idle island that finds all <pre class="mermaid">
 * elements on the page and renders them as SVG diagrams using mermaid.run().
 */
export default function MermaidRenderer() {
  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLPreElement>('pre.mermaid');
    if (!blocks.length) return;

    import('mermaid').then((mod) => {
      const m = (mod as any).default || mod;
      m.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      });
      m.run({ nodes: Array.from(blocks) });
    }).catch((e) => {
      console.warn('Mermaid unavailable:', e);
    });
  }, []);

  return null;
}
