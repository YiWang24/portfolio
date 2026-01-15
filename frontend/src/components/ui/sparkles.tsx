/**
 * Sparkles Component
 *
 * Creates animated sparkle effects using SVG filters
 * From Aceternity UI - https://ui.aceternity.com/components/sparkles
 */

"use client";

import { useCallback, useId, useEffect, useState } from "react";

interface SparklesProps {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
  className?: string;
  children?: React.ReactNode;
}

export const SparklesCore: React.FC<SparklesProps> = ({
  id,
  background = "transparent",
  minSize = 0.4,
  maxSize = 1,
  speed = 3,
  particleColor = "#ffffff",
  particleDensity = 100,
  className = "",
  children,
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const uniqueId = useId();
  const canvasId = id || `sparkles-canvas-${uniqueId}`;

  const resizeCanvas = useCallback((canvas: HTMLCanvasElement) => {
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        setDimensions({
          width: parent.offsetWidth,
          height: parent.offsetHeight,
        });
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    }
  }, []);

  useEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resizeCanvas(canvas);

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    const createParticles = () => {
      const particleCount = (dimensions.width * dimensions.height) / particleDensity;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          size: Math.random() * (maxSize - minSize) + minSize,
          speedX: (Math.random() - 0.5) * speed,
          speedY: (Math.random() - 0.5) * speed,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
    };

    const updateParticles = () => {
      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < 0) particle.x = dimensions.width;
        if (particle.x > dimensions.width) particle.x = 0;
        if (particle.y < 0) particle.y = dimensions.height;
        if (particle.y > dimensions.height) particle.y = 0;
      });
    };

    const drawParticles = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      particles.forEach((particle) => {
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const animate = () => {
      updateParticles();
      drawParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    createParticles();
    animate();

    const handleResize = () => resizeCanvas(canvas);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasId, dimensions, minSize, maxSize, speed, particleColor, particleDensity, resizeCanvas]);

  return (
    <div className={`relative ${className}`} style={{ background }}>
      <canvas id={canvasId} className="absolute inset-0 pointer-events-none" />
      {children}
    </div>
  );
};

export default SparklesCore;
