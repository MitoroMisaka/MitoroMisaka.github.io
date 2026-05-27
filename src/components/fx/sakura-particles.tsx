import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  speedX: number;
  speedY: number;
  opacity: number;
  phase: number;
}

function createParticle(canvasW: number, canvasH: number): Particle {
  return {
    x: Math.random() * canvasW,
    y: Math.random() * canvasH - canvasH,
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    rotationSpeed: 0.2 + Math.random() * 1.8,
    speedX: (Math.random() - 0.5) * 0.5,
    speedY: 0.3 + Math.random() * 0.5,
    opacity: 0.1 + Math.random() * 0.3,
    phase: Math.random() * Math.PI * 2,
  };
}

function getParticleCount(): number {
  if (typeof window === 'undefined') return 60;
  return window.matchMedia('(max-width: 768px)').matches ? 30 : 60;
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle, isDark: boolean) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);

  const r = isDark ? 255 : 255;
  const g = isDark ? 190 : 183;
  const b = isDark ? 205 : 197;

  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size * 0.5, p.size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export default function SakuraParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const isDarkRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let count = getParticleCount();

    function resize() {
      if (!canvas) return;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      count = getParticleCount();
    }

    function resetParticles() {
      particlesRef.current = Array.from({ length: count }, () => createParticle(w, h));
    }

    resize();
    resetParticles();

    // Detect dark mode
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    isDarkRef.current = darkQuery.matches;
    const darkHandler = (e: MediaQueryListEvent) => {
      isDarkRef.current = e.matches;
    };
    darkQuery.addEventListener('change', darkHandler);

    // ResizeObserver for canvas
    const ro = new ResizeObserver(() => {
      resize();
      resetParticles();
    });
    ro.observe(canvas);

    // Also handle window resize for particle count changes
    const mq = window.matchMedia('(max-width: 768px)');
    const mqHandler = () => {
      resize();
      resetParticles();
    };
    mq.addEventListener('change', mqHandler);

    const visibilityHandler = () => {
      if (!document.hidden) {
        // Resume — RAF will naturally restart via the loop check
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    function loop() {
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      ctx!.clearRect(0, 0, w, h);

      for (const p of particlesRef.current) {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.phase + Date.now() * 0.001) * 0.2;
        p.rotation += p.rotationSpeed;

        if (p.y > h + p.size) {
          p.y = -p.size;
          p.x = Math.random() * w;
          p.rotation = Math.random() * 360;
        }

        if (p.x < -p.size) p.x = w + p.size;
        if (p.x > w + p.size) p.x = -p.size;

        drawParticle(ctx!, p, isDarkRef.current);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      mq.removeEventListener('change', mqHandler);
      darkQuery.removeEventListener('change', darkHandler);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
      }}
      aria-hidden="true"
    />
  );
}
