'use client';

import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function HyperTunnel({ className }: { className?: string }) {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 计算鼠标位置百分比
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  // Light Mode colors
  const lightGridColor = 'rgba(100, 116, 139, 0.3)'; // Slate color
  const lightGlowColor1 = 'rgba(14, 116, 144, 0.15)'; // Teal
  const lightGlowColor2 = 'rgba(59, 130, 246, 0.1)'; // Blue

  // Dark Mode colors
  const darkGridColor = 'rgba(93, 220, 255, 0.5)'; // Cyan neon
  const darkGlowColor1 = 'rgba(236, 72, 153, 0.35)'; // Pink
  const darkGlowColor2 = 'rgba(6, 182, 212, 0.35)'; // Cyan

  const gridColor = isDark ? darkGridColor : lightGridColor;
  const bgColor = isDark ? 'bg-[#030303]' : 'bg-background';

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", bgColor, className)}>
      {/*
        透视网格：四周密集 → 中间稀疏
        通过多层不同间距的网格叠加 + 径向遮罩实现
      */}

      {/* 最密集层 - 四周区域 */}
      <div className={cn("absolute inset-0", isDark ? "opacity-[0.4]" : "opacity-[0.6]")}>
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: '30px 30px',
            backgroundImage: `
              linear-gradient(to right, ${gridColor} 1px, transparent 1px),
              linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
            `,
            // 只显示边缘区域
            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 40%, black 70%)',
            maskImage: 'radial-gradient(circle at 50% 50%, transparent 40%, black 70%)',
          }}
        />
      </div>

      {/* 中等密度层 - 过渡区域 */}
      <div className={cn("absolute inset-0", isDark ? "opacity-[0.35]" : "opacity-[0.5]")}>
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: '50px 50px',
            backgroundImage: `
              linear-gradient(to right, ${gridColor} 1px, transparent 1px),
              linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
            `,
            // 显示中间区域
            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 20%, black 50%, transparent 75%)',
            maskImage: 'radial-gradient(circle at 50% 50%, transparent 20%, black 50%, transparent 75%)',
          }}
        />
      </div>

      {/* 稀疏层 - 中心区域 */}
      <div className={cn("absolute inset-0", isDark ? "opacity-[0.3]" : "opacity-[0.4]")}>
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: '80px 80px',
            backgroundImage: `
              linear-gradient(to right, ${gridColor} 1px, transparent 1px),
              linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
            `,
            // 只显示中心区域
            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 45%)',
            maskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 45%)',
          }}
        />
      </div>

      {/* 动态光晕层 - 仅 Dark Mode */}
      {isDark && (
        <>
          {/* 跟随鼠标的光晕 */}
          <div
            className="absolute rounded-full pointer-events-none transition-all duration-1000 ease-out"
            style={{
              left: `${mousePosition.x}%`,
              top: `${mousePosition.y}%`,
              width: '400px',
              height: '400px',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(93, 220, 255, 0.25) 0%, rgba(139, 92, 246, 0.15) 40%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />

          {/* 左上角 - 紫粉色光晕 */}
          <div className="absolute top-[-15%] left-[-15%] w-[55vw] h-[55vw] rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${darkGlowColor1} 0%, rgba(139, 92, 246, 0.25) 50%, transparent 70%)`,
              filter: 'blur(120px)',
              animation: 'breathe1 12s ease-in-out infinite alternate',
            }}
          />

          {/* 右下角 - 青蓝色光晕 */}
          <div className="absolute bottom-[-15%] right-[-15%] w-[55vw] h-[55vw] rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${darkGlowColor2} 0%, rgba(59, 130, 246, 0.25) 50%, transparent 70%)`,
              filter: 'blur(120px)',
              animation: 'breathe2 14s ease-in-out infinite alternate',
            }}
          />

          {/* 左上角副光晕 - 金色点缀 */}
          <div className="absolute top-[10%] left-[10%] w-[35vw] h-[35vw] rounded-full opacity-40 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)',
              filter: 'blur(80px)',
              animation: 'floatShift1 16s ease-in-out infinite',
            }}
          />

          {/* 右下角副光晕 - 绿色点缀 */}
          <div className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] rounded-full opacity-40 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
              filter: 'blur(80px)',
              animation: 'floatShift2 18s ease-in-out infinite',
            }}
          />

          {/* 中心暗部 - 增强对比 */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_60%,rgba(0,0,0,0.7)_90%,#000_100%)] pointer-events-none"></div>
        </>
      )}

      {/* Light Mode: Subtle center vignette */}
      {!isDark && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(148,163,184,0.05)_60%,rgba(148,163,184,0.15)_100%)] pointer-events-none"></div>
      )}

      {/* 动画定义 */}
      <style jsx>{`
        @keyframes breathe1 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(80px, 50px) scale(1.3);
            opacity: 0.5;
          }
          50% {
            transform: translate(-40px, 100px) scale(1.5);
            opacity: 0.6;
          }
          75% {
            transform: translate(-60px, 40px) scale(1.2);
            opacity: 0.4;
          }
          100% {
            transform: translate(30px, -20px) scale(1.1);
            opacity: 0.35;
          }
        }
        @keyframes breathe2 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(-100px, -60px) scale(1.4);
            opacity: 0.55;
          }
          50% {
            transform: translate(50px, -120px) scale(1.6);
            opacity: 0.65;
          }
          75% {
            transform: translate(80px, -40px) scale(1.25);
            opacity: 0.45;
          }
          100% {
            transform: translate(-40px, 30px) scale(1.15);
            opacity: 0.4;
          }
        }
        @keyframes floatShift1 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          33% {
            transform: translate(100px, -80px) scale(1.4);
            opacity: 0.5;
          }
          66% {
            transform: translate(-60px, 60px) scale(0.8);
            opacity: 0.25;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
        }
        @keyframes floatShift2 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          33% {
            transform: translate(-90px, 70px) scale(1.3);
            opacity: 0.45;
          }
          66% {
            transform: translate(70px, -50px) scale(0.85);
            opacity: 0.2;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
        }
      `}</style>

    </div>
  );
}

