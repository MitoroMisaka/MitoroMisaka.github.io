import { useCallback } from 'react';

interface ShareButtonProps {
  title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
  const handleShare = useCallback(() => {
    const tweetText = `${title}\n${window.location.href}`;
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  }, [title]);

  return (
    <div className="mt-6 border-t border-neutral-3 pt-4">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-3 px-3 py-1.5 text-sm text-neutral-7 transition hover:border-neutral-4 hover:bg-neutral-1 hover:text-neutral-9"
        title="分享到 X"
      >
        <span role="img" aria-label="share to X">
          🐦
        </span>
        <span>分享</span>
      </button>
    </div>
  );
}
