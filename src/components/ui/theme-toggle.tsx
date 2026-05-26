import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

function getStoredTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'system';
  return (localStorage.getItem('theme') as Theme) || 'system';
}

function applyTheme(t: Theme) {
  const root = document.documentElement;
  if (t === 'light') {
    root.setAttribute('data-theme', 'light');
  } else if (t === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const cycle = () => {
    const next: Theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
    applyTheme(next);
    localStorage.setItem('theme', next);
  };

  const label = theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark';

  return (
    <button
      onClick={cycle}
      className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--fg-muted)] transition hover:bg-[var(--card)] hover:text-[var(--fg)]"
      aria-label={`Theme: ${label}`}
    >
      {label}
    </button>
  );
}
