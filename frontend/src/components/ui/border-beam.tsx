/**
 * BorderBeam Component
 *
 * Creates an animated border beam effect
 * From Aceternity UI - https://ui.aceternity.com/components/border-beam
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  className,
  size = 200,
  duration = 15,
  borderWidth = 1.5,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  delay = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Use refs for animation state to avoid re-renders
  const positionRef = useRef({ x: 0, y: 0 });
  const activeEdgeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [updateDimensions]);

  useEffect(() => {
    // Reset position when dimensions change
    positionRef.current = { x: 0, y: 0 };
    activeEdgeRef.current = 0;
  }, [dimensions]);

  useEffect(() => {
    const perimeter = 2 * (dimensions.width + dimensions.height);
    if (perimeter === 0) return;

    const stepDuration = (duration * 1000) / perimeter;
    let lastUpdateTime = 0;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimeRef.current;

      if (elapsed >= stepDuration) {
        lastTimeRef.current = timestamp - (elapsed % stepDuration);

        // Update position based on current edge
        const currentEdge = activeEdgeRef.current;
        const pos = positionRef.current;
        let newPos = { ...pos };
        let newEdge = currentEdge;

        switch (currentEdge) {
          case 0: // Top edge
            if (newPos.x < dimensions.width) {
              newPos.x += size / 20;
            } else {
              newEdge = 1;
              newPos.x = dimensions.width;
            }
            break;
          case 1: // Right edge
            if (newPos.y < dimensions.height) {
              newPos.y += size / 20;
            } else {
              newEdge = 2;
              newPos.y = dimensions.height;
            }
            break;
          case 2: // Bottom edge
            if (newPos.x > 0) {
              newPos.x -= size / 20;
            } else {
              newEdge = 3;
              newPos.x = 0;
            }
            break;
          case 3: // Left edge
            if (newPos.y > 0) {
              newPos.y -= size / 20;
            } else {
              newEdge = 0;
              newPos.y = 0;
            }
            break;
        }

        // Update refs
        positionRef.current = newPos;
        activeEdgeRef.current = newEdge;

        // Update DOM directly instead of using state
        if (beamRef.current) {
          beamRef.current.style.transform = `translate(${newPos.x - size / 2}px, ${newPos.y - size / 2}px)`;
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation after delay
    const startTimer = setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, size, duration, delay]);

  const getGradientStyle = (): React.CSSProperties => {
    const rotation = activeEdgeRef.current * 90;
    return {
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${colorFrom}, ${colorTo}, transparent)`,
      filter: "blur(20px)",
      opacity: 0.6,
      transition: "none",
      pointerEvents: "none",
    } as React.CSSProperties;
  };

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden rounded-[inherit]", className)}
      style={{
        border: `${borderWidth}px solid transparent`,
      }}
    >
      <div ref={beamRef} style={getGradientStyle()} />
    </div>
  );
};

export default BorderBeam;
