'use client';

import { cn } from '@/lib/utils';

export default function TunnelGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center",
        // 极端的透视距离，产生强烈的景深
        "[perspective:200px]",
        className
      )}
    >
      {/* 1. 天花板网格 (Top Grid) */}
      <div className="absolute inset-0 z-0 h-full w-full [transform:rotateX(-80deg)] [transform-origin:top_center]">
        <GridPattern direction="down" />
      </div>

      {/* 2. 地板网格 (Bottom Grid) */}
      <div className="absolute inset-0 z-0 h-full w-full [transform:rotateX(80deg)] [transform-origin:bottom_center]">
        <GridPattern direction="up" />
      </div>

      {/* 3. 中心的深渊遮罩 (The Abyss Mask) */}
      {/* 黑色径向渐变，挡住网格交界处，制造"无限远"错觉 */}
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,#05070f_10%,transparent_60%)]"></div>

      {/* 4. 边缘暗角遮罩 (Vignette) */}
      {/* 让四周网格稍微暗下去，视线更加聚焦 */}
      <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_20%,#05070f_80%)]"></div>
    </div>
  );
}

// 辅助子组件：单面网格
function GridPattern({ direction }: { direction: 'up' | 'down' }) {
  return (
    <div
      className={cn(
        "absolute h-[200vh] w-[200vw] left-[-50%]",
        "[background-size:40px_40px]",
        // 网格颜色：青绿色，呼应终端主题
        "[background-image:linear-gradient(to_right,rgba(16,185,129,0.2)_1px,transparent_0),linear-gradient(to_bottom,rgba(16,185,129,0.2)_1px,transparent_0)]",
        // 根据是天花板还是地板，决定动画方向
        direction === 'up' ? "animate-grid-up" : "animate-grid-down"
      )}
    />
  );
}
