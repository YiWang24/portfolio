/**
 * MovingBorder Component
 *
 * Creates an animated border effect
 * From Aceternity UI - https://ui.aceternity.com/components/moving-border
 */

"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface MovingBorderProps {
  children: React.ReactNode;
  duration?: number;
  className?: string;
  borderClassName?: string;
}

export const MovingBorder: React.FC<MovingBorderProps> = ({
  children,
  duration = 2000,
  className = "",
  borderClassName = "",
}) => {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => (prev + 1) % 3);
    }, duration / 3);

    return () => clearInterval(interval);
  }, [duration]);

  const getPositionStyle = (pos: number): React.CSSProperties => {
    const styles = [
      { top: "-2px", left: "-2px", right: "-2px" }, // Top
      { top: "-2px", right: "-2px", bottom: "-2px" }, // Right
      { bottom: "-2px", left: "-2px", right: "-2px" }, // Bottom
    ];
    return styles[pos] as React.CSSProperties;
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Animated border */}
      <div
        className={cn(
          "absolute inset-0 rounded-[inherit] bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 opacity-75 blur-sm transition-all duration-500",
          borderClassName
        )}
        style={getPositionStyle(position)}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default MovingBorder;
