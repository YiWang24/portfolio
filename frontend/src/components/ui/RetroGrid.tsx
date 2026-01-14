'use client';

import { cn } from '@/lib/utils';

export default function RetroGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute h-full w-full overflow-hidden",
        className
      )}
    >
      {/* 1. 3D 透视容器 - 中心透视 */}
      <div className="absolute inset-0 flex items-center justify-center [perspective:1000px]">
        {/* 2. 可旋转的 3D 平面 */}
        <div className="relative [transform-style:preserve-3d]">
          {/* 网格平面 - 从中心向四周倾斜 */}
          <div
            className={cn(
              "animate-grid-perspective",
              // 3D 变换：从中心向四周倾斜
              "[transform:rotateX(60deg)_rotateZ(45deg)]",
              // 网格大小
              "w-[200vmax] h-[200vmax]",
              // 网格背景
              "[background-repeat:repeat] [background-size:60px_60px]",
              // 网格线颜色 - 灰绿色
              "[background-image:linear-gradient(to_right,rgba(16,185,129,0.25)_1px,transparent_0),linear-gradient(to_bottom,rgba(16,185,129,0.25)_1px,transparent_0)]",
              // 位置居中
              "absolute left-1/2 top-1/2 [-translate-x-1/2] [-translate-y-1/2]"
            )}
          />
        </div>
      </div>

      {/* 3. 径向渐变遮罩 - 让中心远处更暗，边缘近处更清晰 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,7,15,0.3)_40%,rgba(5,7,15,0.8)_100%)]" />

      {/* 4. 顶部额外暗化 - 增强深邃感 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,7,15,0)_0%,rgba(5,7,15,0.4)_70%,rgba(5,7,15,0.7)_100%)]" />
    </div>
  );
}
