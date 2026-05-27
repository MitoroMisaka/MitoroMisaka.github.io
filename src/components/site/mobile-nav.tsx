import { useState, useEffect, useCallback } from 'react';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: '首页', href: '/' },
  { label: '文章', href: '/posts' },
  { label: '碎念', href: '/notes' },
  { label: '时光', href: '/timeline' },
  { label: '项目', href: '/projects' },
  { label: '关于', href: '/about' },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const close = useCallback(() => setOpen(false), []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const menu = document.getElementById('mobile-nav-menu');
      const btn = document.getElementById('mobile-nav-btn');
      if (
        menu && !menu.contains(e.target as Node) &&
        btn && !btn.contains(e.target as Node)
      ) {
        close();
      }
    };
    // Delay adding listener to avoid immediate close
    const timer = setTimeout(() => document.addEventListener('click', onClick), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', onClick);
    };
  }, [open, close]);

  return (
    <div className="md:hidden relative">
      <button
        id="mobile-nav-btn"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        aria-label={open ? '关闭菜单' : '打开菜单'}
        className="text-lg text-neutral-7 hover:text-neutral-9 transition-colors"
      >
        {open ? '✕' : '☰'}
      </button>
      {open && (
        <div
          id="mobile-nav-menu"
          className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-neutral-3 bg-neutral-1 shadow-xl py-2 z-50"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={close}
              className="block px-4 py-2 text-sm text-neutral-7 hover:bg-neutral-1 hover:text-neutral-9 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
