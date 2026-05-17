/**
 * Timeline Component
 *
 * A vertical timeline component for displaying events
 * From Aceternity UI style
 */

"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface TimelineItem {
  title: string;
  description?: string;
  date?: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  activeItem?: number;
}

export const Timeline: React.FC<TimelineProps> = ({
  items,
  className,
}) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = parseInt(entry.target.getAttribute("data-id") || "0");
            setVisibleItems((prev) => new Set([...prev, id]));
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll("[data-timeline-item]");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [items]);

  return (
    <div className={cn("relative", className)}>
      {/* Vertical Line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent" />
        <div className="absolute inset-0 bg-zinc-800/50" />
      </div>

      {/* Timeline Items */}
      <div className="space-y-12 md:space-y-16">
        {items.map((item, index) => {
          const isVisible = visibleItems.has(index);
          const isEven = index % 2 === 0;

          return (
            <div
              key={index}
              data-timeline-item
              data-id={index}
              className={cn(
                "relative md:grid md:grid-cols-2 md:gap-12",
                isEven ? "" : "md:text-left"
              )}
            >
              {/* Timeline Dot */}
              <div className="absolute left-4 md:left-1/2 top-2 w-4 h-4 -translate-x-1/2 z-10">
                <div className="absolute inset-0 bg-zinc-900 rounded-full" />
                <div
                  className={cn(
                    "absolute inset-0 rounded-full transition-all duration-500",
                    isVisible
                      ? "bg-emerald-400 shadow-[0_0_20px_5px_rgba(52,211,153,0.4)] scale-100"
                      : "bg-zinc-600 scale-75"
                  )}
                />
                <div
                  className={cn(
                    "absolute inset-0 rounded-full bg-emerald-400/30 transition-all duration-500",
                    isVisible ? "animate-ping" : "scale-0"
                  )}
                />
              </div>

              {/* Content */}
              <div
                className={cn(
                  "ml-12 md:ml-0",
                  isEven ? "md:pr-12" : "md:pl-12 md:col-start-2"
                )}
              >
                <div
                  className={cn(
                    "p-6 rounded-2xl border transition-all duration-300",
                    isVisible
                      ? "bg-zinc-800/70 border-emerald-500/30 opacity-100 translate-y-0"
                      : "bg-zinc-900/50 border-zinc-800/50 opacity-0 translate-y-12"
                  )}
                >
                  {/* Icon */}
                  {item.icon && (
                    <div className="mb-4">{item.icon}</div>
                  )}

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                    {item.title}
                  </h3>

                  {/* Date */}
                  {item.date && (
                    <div className="text-sm text-emerald-400 font-mono mb-3">
                      {item.date}
                    </div>
                  )}

                  {/* Description */}
                  {item.description && (
                    <p className="text-zinc-400 mb-4">{item.description}</p>
                  )}

                  {/* Custom Content */}
                  {item.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
