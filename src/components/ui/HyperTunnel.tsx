'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

export default function HyperTunnel({ className }: { className?: string }) {
  const glowRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // rAF-throttled mouse parallax. We write directly to a ref so React never
  // re-renders the whole tunnel just because the cursor moved.
  useEffect(() => {
    if (!mounted || resolvedTheme !== 'dark') return;

    let rafId = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(apply);
      }
    };

    const apply = () => {
      rafId = 0;
      const el = glowRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    apply();
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mounted, resolvedTheme]);

  const isDark = mounted && resolvedTheme === 'dark';

  const lightGridColor = 'rgba(100, 116, 139, 0.3)';
  const darkGridColor = 'rgba(93, 220, 255, 0.5)';
  const gridColor = isDark ? darkGridColor : lightGridColor;
  const bgColor = isDark ? 'bg-[#030303]' : 'bg-background';

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        bgColor,
        className,
      )}
      style={{ contain: 'strict' }}
    >
      {/*
        Grid layers — purely static paint. Browser caches them as a single
        layer, so they cost nothing during scroll. Avoids the previous 3-stack
        of radial-masked grids that all repainted on every frame.
      */}
      <div
        className={cn('absolute inset-0', isDark ? 'opacity-40' : 'opacity-60')}
        style={{
          backgroundImage: `
            linear-gradient(to right, ${gridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, transparent 0%, black 80%)',
          maskImage:
            'radial-gradient(ellipse at center, transparent 0%, black 80%)',
        }}
      />

      {isDark && (
        <>
          {/* Cursor halo. Lighter blur, no transition — animation comes from
              the throttled translate3d we apply via rAF. */}
          <div
            ref={glowRef}
            className="absolute top-0 left-0 rounded-full pointer-events-none"
            style={{
              width: 360,
              height: 360,
              background:
                'radial-gradient(circle, rgba(93, 220, 255, 0.18) 0%, rgba(139, 92, 246, 0.10) 45%, transparent 70%)',
              filter: 'blur(40px)',
              willChange: 'transform',
            }}
          />

          {/* Two ambient glows. Animate ONLY opacity (cheap) — no more
              translate+scale+opacity keyframes on blur(120px) layers. The
              underlying gradient already gives the radial light; modulating
              opacity is enough to feel alive without thrashing the rasterizer. */}
          <div
            className="absolute -top-[20%] -left-[20%] w-[60vw] h-[60vw] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(236, 72, 153, 0.30) 0%, rgba(139, 92, 246, 0.18) 50%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'breathe1 14s ease-in-out infinite alternate',
              willChange: 'opacity',
            }}
          />

          <div
            className="absolute -bottom-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(6, 182, 212, 0.30) 0%, rgba(59, 130, 246, 0.18) 50%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'breathe2 18s ease-in-out infinite alternate',
              willChange: 'opacity',
            }}
          />

          {/* Center vignette (static, no animation). */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.35)_65%,rgba(0,0,0,0.75)_95%,#000_100%)] pointer-events-none" />
        </>
      )}

      {!isDark && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(148,163,184,0.05)_60%,rgba(148,163,184,0.15)_100%)] pointer-events-none" />
      )}

      <style jsx>{`
        @keyframes breathe1 {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.6; }
        }
        @keyframes breathe2 {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.65; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*='animation'] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
