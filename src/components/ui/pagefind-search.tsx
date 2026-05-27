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

type SearchState = 'idle' | 'loading' | 'ready' | 'unavailable';

export default function PagefindSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<SearchState>('idle');
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    // If pagefind is already available (prerendered or loaded via layout script)
    if (window.pagefind) {
      setState('ready');
      return;
    }

    // Poll for pagefind (loaded via <script type="module"> in layout head)
    setState('loading');
    let attempts = 0;
    const maxAttempts = 50; // ~5 seconds
    const interval = setInterval(() => {
      attempts++;
      if (window.pagefind) {
        clearInterval(interval);
        setState('ready');
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        setState('unavailable');
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const search = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const pf = window.pagefind;
    if (!pf) return;
    try {
      const { results } = await pf.search(q);
      setResults(results.slice(0, 8));
    } catch {
      // pagefind search failed
    }
  }, []);

  const clear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onInput={(e) => { search((e.target as HTMLInputElement).value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="搜索内容..."
          className="w-40 rounded-full border border-neutral-3 bg-transparent px-3 py-1.5 text-xs text-neutral-9 placeholder-neutral-7 outline-none focus:border-accent focus:w-56 transition-all"
        />
        {query && (
          <button
            onClick={clear}
            className="text-xs text-neutral-7 hover:text-neutral-9"
            aria-label="Clear"
          >
            ✕
          </button>
        )}
      </div>
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-neutral-3 bg-neutral-1 shadow-xl p-2 z-50">
          {state === 'loading' && (
            <p className="px-3 py-2 text-xs text-neutral-7">搜索中...</p>
          )}
          {state === 'unavailable' && (
            <p className="px-3 py-2 text-xs text-neutral-7">搜索不可用</p>
          )}
          {results.length === 0 && query.length >= 2 && state === 'ready' && (
            <p className="px-3 py-2 text-xs text-neutral-7">无结果</p>
          )}
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
    <a href={data.url} className="block rounded-xl px-3 py-2 text-sm hover:bg-neutral-1 transition-colors">
      <p className="font-medium text-neutral-9">{data.meta.title}</p>
      <p className="mt-1 text-xs text-neutral-7 line-clamp-2" dangerouslySetInnerHTML={{ __html: data.excerpt }} />
    </a>
  );
}
