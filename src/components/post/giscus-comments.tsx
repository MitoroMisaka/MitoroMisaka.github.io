import { useEffect, useRef } from 'react';

export default function GiscusComments({ repo = 'MitoroMisaka/MitoroMisaka.github.io', repoId = '', category = 'General', categoryId = '', mapping = 'pathname' }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const giscus = document.createElement('script');
    giscus.src = 'https://giscus.app/client.js';
    giscus.setAttribute('data-repo', repo);
    giscus.setAttribute('data-repo-id', repoId);
    giscus.setAttribute('data-category', category);
    giscus.setAttribute('data-category-id', categoryId);
    giscus.setAttribute('data-mapping', mapping);
    giscus.setAttribute('data-strict', '0');
    giscus.setAttribute('data-reactions-enabled', '1');
    giscus.setAttribute('data-emit-metadata', '0');
    giscus.setAttribute('data-input-position', 'bottom');
    giscus.setAttribute('data-theme', 'preferred_color_scheme');
    giscus.setAttribute('data-lang', 'zh-CN');
    giscus.setAttribute('data-loading', 'lazy');
    giscus.crossOrigin = 'anonymous';
    giscus.async = true;

    ref.current?.appendChild(giscus);
  }, []);

  return (
    <div className="mt-12 border-t border-[var(--line)] pt-8">
      <div ref={ref} />
    </div>
  );
}
