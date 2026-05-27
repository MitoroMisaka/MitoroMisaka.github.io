import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

/**
 * HeroAnimated — wraps children with staggered CSS fade-in.
 * Each direct child gets an incremental animation-delay via CSS nth-child.
 *
 * Usage in Astro:
 *   <HeroAnimated client:load>
 *     <div>avatar</div>
 *     <h1>title</h1>
 *     <p>subtitle</p>
 *     ...
 *   </HeroAnimated>
 */
export default function HeroAnimated({ children }: Props) {
  return (
    <div className="hero-animated">
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-animated > * {
          animation: heroFadeIn 0.6s ease forwards;
          opacity: 0;
        }
        .hero-animated > *:nth-child(1) { animation-delay: 100ms; }
        .hero-animated > *:nth-child(2) { animation-delay: 200ms; }
        .hero-animated > *:nth-child(3) { animation-delay: 350ms; }
        .hero-animated > *:nth-child(4) { animation-delay: 500ms; }
        .hero-animated > *:nth-child(5) { animation-delay: 650ms; }
        .hero-animated > *:nth-child(6) { animation-delay: 800ms; }
        .hero-animated > *:nth-child(7) { animation-delay: 950ms; }
      `}</style>
      {children}
    </div>
  );
}
