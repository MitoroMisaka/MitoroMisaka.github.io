import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

function getStoredTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'dark';
  return (localStorage.getItem('theme') as Theme) || 'dark';
}

function applyTheme(t: Theme) {
  document.documentElement.setAttribute('data-theme', t);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    localStorage.setItem('theme', next);
  };

  const label = theme === 'light' ? 'Light' : 'Dark';

  return (
    <button
      onClick={toggle}
      className="rounded-full border border-neutral-3 px-3 py-1 text-caption-10 text-neutral-7 transition hover:bg-neutral-1 hover:text-neutral-9"
      aria-label={`Theme: ${label}`}
    >
      {label}
    </button>
  );
}
