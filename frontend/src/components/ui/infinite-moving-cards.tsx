/**
 * InfiniteMovingCards Component
 *
 * Creates an infinite horizontal scrolling animation for cards
 * From Aceternity UI - https://ui.aceternity.com/components/infinite-moving-cards
 */

"use client";

import { cn } from "@/lib/utils";

interface InfiniteMovingCardsProps {
  items: {
    quote?: string;
    name?: string;
    title?: string;
    content?: React.ReactNode;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}

export const InfiniteMovingCards: React.FC<InfiniteMovingCardsProps> = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}) => {
  const containerStyle = {
    "--scroll-direction": direction === "left" ? "normal" : "reverse",
    "--scroll-duration":
      speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s",
  } as React.CSSProperties;

  const scrollerClassName = `
    flex overflow-hidden w-full
    [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]
  `.trim().replace(/\s+/g, " ");

  const animateClassName = `
    flex w-full animate-scroll
    gap-4 py-4
  `.trim().replace(/\s+/g, " ");

  return (
    <div
      className={cn("scroller relative max-w-7xl", className)}
      style={containerStyle}
    >
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% * var(--scroll-direction, 1))); }
        }
        .animate-scroll {
          animation: scroll var(--scroll-duration, 40s) linear infinite;
        }
        .scroller:hover .animate-scroll {
          animation-play-state: ${pauseOnHover ? "paused" : "running"};
        }
      `}</style>
      <div className={scrollerClassName}>
        <div className={animateClassName}>
          {items.map((item, idx) => (
            <div
              key={idx}
              className="w-[350px] max-w-full relative rounded-2xl border border-b-0 flex-shrink-0 border-slate-700 px-8 py-6 md:w-[450px]"
              style={{
                background: "linear-gradient(180deg, var(--slate-800), var(--slate-900))",
              }}
            >
              <blockquote>
                <div
                  aria-hidden="true"
                  className="user-select-none -z-1 pointer-events-none absolute -top-0.5 -left-0.5 h-[calc(100%+1px)] w-[calc(100%+1px)]"
                ></div>
                <span className="relative z-20 text-sm leading-[1.6] text-gray-100 font-normal">
                  {item.quote}
                </span>
                <div className="relative z-20 mt-6 flex flex-row items-center gap-4">
                  <span className="flex flex-col gap-1">
                    <span className="text-sm leading-[1.6] text-gray-400 font-normal">
                      {item.name}
                    </span>
                    <span className="text-sm leading-[1.6] text-gray-500 font-normal">
                      {item.title}
                    </span>
                  </span>
                </div>
              </blockquote>
            </div>
          ))}
          {/* Duplicate items for seamless loop */}
          {items.map((item, idx) => (
            <div
              key={`dup-${idx}`}
              className="w-[350px] max-w-full relative rounded-2xl border border-b-0 flex-shrink-0 border-slate-700 px-8 py-6 md:w-[450px]"
              style={{
                background: "linear-gradient(180deg, var(--slate-800), var(--slate-900))",
              }}
            >
              <blockquote>
                <div
                  aria-hidden="true"
                  className="user-select-none -z-1 pointer-events-none absolute -top-0.5 -left-0.5 h-[calc(100%+1px)] w-[calc(100%+1px)]"
                ></div>
                <span className="relative z-20 text-sm leading-[1.6] text-gray-100 font-normal">
                  {item.quote}
                </span>
                <div className="relative z-20 mt-6 flex flex-row items-center gap-4">
                  <span className="flex flex-col gap-1">
                    <span className="text-sm leading-[1.6] text-gray-400 font-normal">
                      {item.name}
                    </span>
                    <span className="text-sm leading-[1.6] text-gray-500 font-normal">
                      {item.title}
                    </span>
                  </span>
                </div>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfiniteMovingCards;
