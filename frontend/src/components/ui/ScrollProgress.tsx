/**
 * Scroll Progress Indicator
 * Shows a subtle progress bar at the top of the page as you scroll
 */

"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

interface ScrollProgressProps {
  containerRef?: React.RefObject<HTMLElement | null>;
}

export function ScrollProgress({ containerRef }: ScrollProgressProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { scrollYProgress } = useScroll({
    container: containerRef || undefined,
  });

  // Smooth spring animation for progress bar
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (!isClient) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary/10 z-[100] origin-left"
      style={{ scaleX }}
    />
  );
}

/**
 * Section transition overlay for smooth fade effects
 */
export function SectionTransition({
  isActive,
  direction = "down"
}: {
  isActive: boolean;
  direction?: "up" | "down";
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: isActive ? 0.03 : 0,
        scale: isActive ? 1 : 0.95,
      }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="fixed inset-0 bg-primary pointer-events-none z-40"
    />
  );
}
