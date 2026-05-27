import { useState, useEffect, useCallback } from 'react';
import { REACTION_EMOJIS, REACTION_EMOJI_LIST, type ReactionEmoji } from '../../lib/reaction-config';

interface ReactionBarProps {
  target: string; // e.g. "post:my-slug"
}

type Status = 'loading' | 'success' | 'error' | 'unavailable';

export default function ReactionBar({ target }: ReactionBarProps) {
  const [counts, setCounts] = useState<Record<ReactionEmoji, number>>({
    heart: 0,
    clap: 0,
    rocket: 0,
    eyes: 0,
  });
  const [status, setStatus] = useState<Status>('loading');
  const [clicked, setClicked] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`reactions:${target}`);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });
  const [submitting, setSubmitting] = useState<ReactionEmoji | null>(null);

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch(`/api/reactions?target=${encodeURIComponent(target)}`);
      if (!res.ok) {
        setStatus('unavailable');
        return;
      }
      const data = (await res.json()) as { counts?: Record<ReactionEmoji, number> };
      if (data.counts) {
        setCounts(data.counts);
        setStatus('success');
      }
    } catch {
      setStatus('unavailable');
    }
  }, [target]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleClick = async (emoji: ReactionEmoji) => {
    if (submitting || clicked.has(emoji)) return;
    setSubmitting(emoji);
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, emoji }),
      });
      if (!res.ok) {
        setStatus('error');
        setSubmitting(null);
        return;
      }
      const data = (await res.json()) as { count?: number };
      if (typeof data.count === 'number') {
        setCounts((prev) => ({ ...prev, [emoji]: data.count! }));
      }
      const next = new Set(clicked);
      next.add(emoji);
      setClicked(next);
      try {
        localStorage.setItem(`reactions:${target}`, JSON.stringify([...next]));
      } catch {
        // localStorage may be unavailable
      }
      setSubmitting(null);
    } catch {
      setStatus('error');
      setSubmitting(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="mt-8 border-t border-neutral-3 pt-6">
        <div className="flex gap-2">
          {REACTION_EMOJI_LIST.map((key) => (
            <span key={key} className="rounded-full border border-neutral-3 px-3 py-1 text-sm opacity-40">
              {REACTION_EMOJIS[key].emoji} 0
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (status === 'unavailable') {
    return (
      <div className="mt-8 border-t border-neutral-3 pt-6">
        <div className="flex gap-2">
          {REACTION_EMOJI_LIST.map((key) => (
            <span key={key} className="rounded-full border border-neutral-3 px-3 py-1 text-sm opacity-30">
              {REACTION_EMOJIS[key].emoji} —
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-7">Reactions unavailable</p>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-neutral-3 pt-6">
      <div className="flex flex-wrap gap-2">
        {REACTION_EMOJI_LIST.map((key) => {
          const count = counts[key] ?? 0;
          const isClicked = clicked.has(key);
          const isSubmitting = submitting === key;
          return (
            <button
              key={key}
              onClick={() => handleClick(key)}
              disabled={isClicked || isSubmitting}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                isClicked
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-neutral-3 hover:border-neutral-4 hover:bg-neutral-1'
              } ${isSubmitting ? 'animate-pulse opacity-60' : ''} disabled:cursor-default`}
              title={REACTION_EMOJIS[key].label}
            >
              {REACTION_EMOJIS[key].emoji} {count}
            </button>
          );
        })}
      </div>
      {status === 'error' && (
        <p className="mt-2 text-xs text-neutral-7">Failed to update. Try again?</p>
      )}
    </div>
  );
}
