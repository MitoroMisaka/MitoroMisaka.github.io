import { useState, useEffect, useCallback } from 'react';

interface LightboxState {
  open: boolean;
  src: string;
  alt: string;
}

/**
 * Image lightbox — renders a fullscreen overlay when user clicks an <img>
 * inside the <main> content area.
 *
 * Usage: add <Lightbox client:idle /> to any page layout.
 * No props needed — it listens globally on document clicks.
 */
export default function Lightbox() {
  const [state, setState] = useState<LightboxState>({ open: false, src: '', alt: '' });

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const openLightbox = useCallback((src: string, alt: string) => {
    setState({ open: true, src, alt });
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'IMG') return;

      // Only images inside main content area (skip header/footer/decorative)
      const main = document.querySelector('main');
      if (!main || !main.contains(target)) return;

      const img = target as HTMLImageElement;
      if (!img.src || img.src.startsWith('data:')) return;

      e.preventDefault();
      openLightbox(img.src, img.alt || '');
    }

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [openLightbox]);

  useEffect(() => {
    if (!state.open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scrolling when lightbox is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [state.open, close]);

  if (!state.open) return null;

  return (
    <div
      className="lightbox-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        animation: 'lightbox-fade-in 150ms ease-out',
      }}
      onClick={close}
    >
      {/* Close button */}
      <button
        onClick={close}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 51,
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.1)',
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
          lineHeight: 1,
          transition: 'background 150ms',
        }}
        aria-label="Close lightbox"
      >
        ×
      </button>

      {/* Image container — prevent click propagation to overlay */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'lightbox-scale-in 150ms ease-out',
        }}
      >
        <img
          src={state.src}
          alt={state.alt}
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        />
      </div>

      {/* Keyframes injected via style tag */}
      <style>{`
        @keyframes lightbox-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes lightbox-scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
