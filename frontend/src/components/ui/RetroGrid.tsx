'use client';

import { cn } from '@/lib/utils';

export default function RetroGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute h-full w-full overflow-hidden opacity-40 [perspective:200px]",
        className
      )}
    >
      {/* 1. Grid Layer */}
      <div className="absolute inset-0 [transform:rotateX(60deg)]">
        <div
          className={cn(
            "animate-grid",
            "[background-repeat:repeat] [background-size:40px_40px]",
            "[height:100vh] [inset:0%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:200vw]",

            // 网格线颜色：使用灰绿色，呼应终端主题
            "[background-image:linear-gradient(to_right,rgba(16,185,129,0.15)_1px,transparent_0),linear-gradient(to_bottom,rgba(16,185,129,0.15)_1px,transparent_0)]"
          )}
        />
      </div>

      {/* 2. Gradient Fog (遮罩) */}
      {/* 让网格远处渐渐消失，制造深邃感 */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070f] via-transparent to-transparent to-90%" />
    </div>
  );
}
