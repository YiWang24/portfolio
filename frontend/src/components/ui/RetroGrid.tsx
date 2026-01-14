'use client';

import { cn } from '@/lib/utils';

export default function RetroGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute h-full w-full overflow-hidden opacity-50",
        // 增加 perspective 值，让 3D 效果更明显
        "[perspective:500px]",
        className
      )}
    >
      {/* 1. Grid Container - 放在底部，模拟地板 */}
      <div className="absolute bottom-0 left-0 right-0 h-[60vh] [transform:rotateX(75deg)] origin-bottom">
        <div
          className={cn(
            "animate-grid",
            // 网格背景设置
            "[background-repeat:repeat] [background-size:50px_50px]",
            "[height:200vh] [width:200vw] [-margin-left:-50%]",

            // 网格线颜色：使用灰绿色，呼应终端主题
            // 增加不透明度让网格更明显
            "[background-image:linear-gradient(to_right,rgba(16,185,129,0.3)_1px,transparent_0),linear-gradient(to_bottom,rgba(16,185,129,0.3)_1px,transparent_0)]"
          )}
        />
      </div>

      {/* 2. Gradient Fog (底部遮罩) - 让网格从底部渐变消失 */}
      <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-[#05070f] via-[#05070f]/80 to-transparent" />

      {/* 3. Top Fade (顶部遮罩) - 让网格在远处渐渐消失 */}
      <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-[#05070f] to-transparent" />
    </div>
  );
}
