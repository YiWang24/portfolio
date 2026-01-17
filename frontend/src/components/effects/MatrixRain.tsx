"use client";

import { useEffect, useRef } from "react";
import { useUIStore } from "@/stores/ui-store";

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isMatrixActive, setMatrixActive } = useUIStore();

  useEffect(() => {
    if (!isMatrixActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. set full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 2. character set (classic matrix uses katakana + numbers)
    const katakana =
      "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン";
    const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const alphabet = katakana + latin;

    const fontSize = 14; // font size: 14px (between 12px and 16px)
    const columns = Math.floor(canvas.width / fontSize); // calculate column count

    // 3. Y coordinate of each column (random initialization to achieve full screen effect)
    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      // random initialization position, let the character rain start from different heights of the screen
      drops[x] = Math.floor(Math.random() * -100); // start from different positions above the screen
    }

    // 4. drawing loop - use requestAnimationFrame to improve smoothness
    let lastTime = 0;
    const fps = 60;
    const frameInterval = 1000 / fps;

    const draw = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      const elapsed = currentTime - lastTime;

      if (elapsed > frameInterval) {
        lastTime = currentTime - (elapsed % frameInterval);

        // use completely transparent clearing to keep the background transparent
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // increase opacity to 0.7 to make characters more clearly visible
        ctx.fillStyle = "rgba(0, 255, 0, 0.7)";
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          // random取一个字符
          const text = alphabet.charAt(
            Math.floor(Math.random() * alphabet.length)
          );

          // x = column number * font width, y = current drop height * font height
          const y = drops[i] * fontSize;

          // increase character display density: draw multiple characters per column instead of just one
          // draw 8 characters from the current position upwards to form a raindrop effect
          for (let j = 0; j < 8; j++) {
            const dropY = y - j * fontSize;
            if (dropY > 0 && dropY < canvas.height) {
              // the earlier the character, the brighter it is, and the tail characters gradually dim
              const brightness = 1 - j * 0.1;
              ctx.fillStyle = `rgba(0, 255, 0, ${0.7 * brightness})`;
              ctx.fillText(
                alphabet.charAt(Math.floor(Math.random() * alphabet.length)),
                i * fontSize,
                dropY
              );
            }
          }

          // random reset mechanism: if it falls out of the screen, or the random factor is triggered, reset to the top
          // Math.random() > 0.975 makes the reset time of each column different, creating a sense of错落感
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }

          drops[i]++;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    let animationFrameId = requestAnimationFrame(draw);

    // 5. auto exit mechanism: exit automatically after 5 seconds
    const autoExitTimer = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      setMatrixActive(false);
    }, 5000);

    // 6. manual exit mechanism: click or press any key to exit
    const exitMatrix = () => {
      cancelAnimationFrame(animationFrameId);
      setMatrixActive(false);
    };

    window.addEventListener("click", exitMatrix);
    window.addEventListener("keydown", exitMatrix);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(autoExitTimer);
      window.removeEventListener("click", exitMatrix);
      window.removeEventListener("keydown", exitMatrix);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMatrixActive, setMatrixActive]);

  if (!isMatrixActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] cursor-pointer"
      style={{ touchAction: "none", pointerEvents: "auto" }}
    />
  );
}
