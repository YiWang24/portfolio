/**
 * BentoGrid Component
 *
 * A responsive bento grid layout component
 * From Aceternity UI - https://ui.aceternity.com/components/bento-grid
 */

"use client";

import { cn } from "@/lib/utils";

interface BentoGridProps {
  className?: string;
  children?: React.ReactNode;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

interface BentoGridItemProps {
  className?: string;
  title?: string;
  description?: string;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  children?: React.ReactNode;
}

export const BentoGridItem: React.FC<BentoGridItemProps> = ({
  className,
  title,
  description,
  header,
  icon,
  colSpan = 1,
  rowSpan = 1,
  children,
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-3xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4",
        colSpan === 2 && "md:col-span-2",
        colSpan === 3 && "md:col-span-3",
        rowSpan === 2 && "md:row-span-2",
        rowSpan === 3 && "md:row-span-3",
        className
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        {icon}
        <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
          {title}
        </div>
        <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
          {description}
        </div>
      </div>
      {children}
    </div>
  );
};

export default BentoGrid;
