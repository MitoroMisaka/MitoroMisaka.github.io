import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchResult {
  id: string;
  data: () => Promise<{ url: string; meta: { title: string }; excerpt: string }>;
}

declare global {
  interface Window {
    pagefind?: {
      search: (query: string) => Promise<{ results: SearchResult[] }>;
    };
  }
}

export default function PagefindSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    const load = async () => {
      if (loaded.current || !document.querySelector('#pagefind-js')) {
        loaded.current = true;
        return;
      }
    };
    load();
  }, []);

  const search = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    try {
      const pf = window.pagefind;
      if (!pf) return;
      const { results } = await pf.search(q);
      setResults(results.slice(0, 8));
    } catch {
      // pagefind not loaded yet
    }
  }, []);

  return (
    <div class="relative">
      <div class="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onInput={(e) => { search((e.target as HTMLInputElement).value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="搜索文章..."
          class="w-40 rounded-full border border-[var(--line)] bg-transparent px-3 py-1.5 text-xs text-[var(--fg)] placeholder-[var(--fg-soft)] outline-none focus:border-[var(--brand)] focus:w-56 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
            class="text-xs text-[var(--fg-soft)] hover:text-[var(--fg)]"
            aria-label="Clear"
          >
            ✕
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div class="absolute right-0 mt-2 w-72 rounded-2xl border border-[var(--line)] bg-[var(--card)] shadow-xl p-2 z-50">
          {results.map((r) => (
            <SearchItem key={r.id} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchItem({ result }: { result: SearchResult }) {
  const [data, setData] = useState<{ url: string; meta: { title: string }; excerpt: string } | null>(null);

  useEffect(() => {
    result.data().then(setData);
  }, []);

  if (!data) return null;

  return (
    <a href={data.url} class="block rounded-xl px-3 py-2 text-sm hover:bg-[var(--bg)] transition-colors">
      <p class="font-medium text-[var(--fg)]">{data.meta.title}</p>
      <p class="mt-1 text-xs text-[var(--fg-muted)] line-clamp-2" dangerouslySetInnerHTML={{ __html: data.excerpt }} />
    </a>
  );
}
