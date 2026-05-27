import { useState, useMemo } from 'react';
import type { CollectionEntry } from 'astro:content';

interface GardenFilterProps {
  entries: {
    id: string;
    title: string;
    description: string;
    category: string;
    stage: string;
    tags: string[];
    updated: string;
  }[];
}

const STAGE_EMOJI: Record<string, string> = {
  seedling: '🌱',
  budding: '🌿',
  evergreen: '🌳',
};

const STAGE_LABEL: Record<string, string> = {
  seedling: '嫩芽',
  budding: '生长中',
  evergreen: '长青',
};

function formatDate(d: string): string {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}年${m}月${day}日`;
}

export default function GardenFilter({ entries }: GardenFilterProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const e of entries) cats.add(e.category);
    return [...cats].sort();
  }, [entries]);

  const stages = ['seedling', 'budding', 'evergreen'] as const;

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (activeCategory && e.category !== activeCategory) return false;
      if (activeStage && e.stage !== activeStage) return false;
      return true;
    });
  }, [entries, activeCategory, activeStage]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const e of filtered) {
      const cat = e.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(e);
    }
    // Sort entries within each group
    for (const [, items] of map) {
      items.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {/* Category filter */}
        <button
          onClick={() => setActiveCategory(null)}
          className={`rounded-full border px-3 py-1 text-sm transition ${
            !activeCategory
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-neutral-3 text-neutral-7 hover:border-neutral-4'
          }`}
        >
          全部分类
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              activeCategory === cat
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-neutral-3 text-neutral-7 hover:border-neutral-4'
            }`}
          >
            {cat}
          </button>
        ))}

        <span className="mx-1 self-center text-neutral-5">|</span>

        {/* Stage filter */}
        {stages.map((stage) => (
          <button
            key={stage}
            onClick={() => setActiveStage(activeStage === stage ? null : stage)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              activeStage === stage
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-neutral-3 text-neutral-7 hover:border-neutral-4'
            }`}
          >
            {STAGE_EMOJI[stage]} {STAGE_LABEL[stage]}
          </button>
        ))}
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-3 px-8 py-16 text-center">
          <p className="text-lg text-neutral-7">没有匹配的条目</p>
        </div>
      )}

      {/* Grouped results */}
      {groups.map(([category, groupEntries]) => (
        <section key={category} className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">{category}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {groupEntries.map((entry) => (
              <a
                key={entry.id}
                href={`/garden/${entry.id}`}
                className="group rounded-xl border border-neutral-3 bg-neutral-1 p-4 transition hover:border-neutral-4"
              >
                <h3 className="font-medium group-hover:text-accent transition-colors line-clamp-1">
                  {entry.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-7 line-clamp-2">
                  {entry.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-7">
                  <span>{STAGE_EMOJI[entry.stage]} {STAGE_LABEL[entry.stage]}</span>
                  <span>·</span>
                  <span>{formatDate(entry.updated)}</span>
                </div>
                {entry.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full border border-neutral-3 px-2 py-0.5 text-xs text-neutral-7"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
