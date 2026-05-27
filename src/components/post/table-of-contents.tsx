import { useEffect, useState, useRef } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('article h2, article h3'));
    const toc: TocItem[] = headings.map((h) => ({
      id: h.id,
      text: h.textContent || '',
      level: Number(h.tagName[1]),
    }));
    setItems(toc);

    if (toc.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );

    headings.forEach((h) => observerRef.current?.observe(h));

    return () => observerRef.current?.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <nav className="hidden lg:block fixed right-[max(2rem,calc((100vw-64rem)/2))] top-32 w-52">
      <p className="text-xs font-semibold text-neutral-7 uppercase tracking-wide mb-2">目录</p>
      <ul className="space-y-1 border-l border-neutral-3 pl-3">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-xs leading-relaxed transition-colors ${
                item.level === 3 ? 'pl-3' : ''
              } ${
                activeId === item.id
                  ? 'text-accent font-medium'
                  : 'text-neutral-7 hover:text-neutral-9'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
