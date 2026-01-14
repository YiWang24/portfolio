'use client';

import { cn } from '@/lib/utils';

export default function HyperTunnel({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden bg-[#030303]",
        // 核心透视设置：
        // perspective: 300px 制造强烈的景深
        // perspective-origin: center 让所有线条汇聚到正中心
        "[perspective:300px] [perspective-origin:center]",
        className
      )}
    >
      {/*
         我们创建4个面，通过 transform-origin 锚定在屏幕边缘
         然后向内旋转，形成一个金字塔/隧道形状
      */}

      {/* 1. 天花板 (Top) */}
      <div className="absolute top-0 left-0 right-0 h-[50vh] origin-top [transform:rotateX(-20deg)]">
        <GridPlane direction="vertical" />
      </div>

      {/* 2. 地板 (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-[50vh] origin-bottom [transform:rotateX(20deg)]">
        <GridPlane direction="vertical" />
      </div>

      {/* 3. 左墙 (Left) */}
      <div className="absolute top-0 bottom-0 left-0 w-[50vw] origin-left [transform:rotateY(20deg)]">
        <GridPlane direction="horizontal" />
      </div>

      {/* 4. 右墙 (Right) */}
      <div className="absolute top-0 bottom-0 right-0 w-[50vw] origin-right [transform:rotateY(-20deg)]">
        <GridPlane direction="horizontal" />
      </div>

      {/* 5. 中心深渊 (The Void) */}
      {/* 用一个黑色光晕遮住 4 个面交汇的接缝处，制造无限远的错觉 */}
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,black_30%,transparent_70%)]"></div>

    </div>
  );
}

// 辅助组件：单个网格面
function GridPlane({ direction }: { direction: 'vertical' | 'horizontal' }) {
  return (
    <div
      className={cn(
        "absolute inset-[-100%]", // 让网格足够大，防止旋转后露出边缘
        "[background-size:50px_50px]", // 网格大小
        // 网格线颜色：Emerald 绿色
        "[background-image:linear-gradient(to_right,rgba(16,185,129,0.2)_1px,transparent_0),linear-gradient(to_bottom,rgba(16,185,129,0.2)_1px,transparent_0)]",
        // 动画：让网格动起来
        direction === 'vertical' ? "animate-tunnel-y" : "animate-tunnel-x"
      )}
    />
  );
}
