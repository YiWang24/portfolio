'use client';

import { useEffect, useRef } from 'react';
import { useUIStore } from '@/store/ui-store';

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isMatrixActive, setMatrixActive } = useUIStore();

  useEffect(() => {
    if (!isMatrixActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. 设置全屏
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 2. 字符集 (经典黑客帝国是用片假名+数字)
    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const alphabet = katakana + latin;

    const fontSize = 14; // 字体大小：14px（介于12px和16px之间）
    const columns = Math.floor(canvas.width / fontSize); // 计算列数

    // 3. 每一列当前下落到的 Y 坐标 (随机初始化，实现全屏效果)
    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      // 随机初始化位置，让字符雨从屏幕不同高度开始下落
      drops[x] = Math.floor(Math.random() * -100); // 从屏幕上方不同位置开始
    }

    // 4. 绘图循环 - 使用 requestAnimationFrame 提高流畅度
    let lastTime = 0;
    const fps = 60;
    const frameInterval = 1000 / fps;

    const draw = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      const elapsed = currentTime - lastTime;

      if (elapsed > frameInterval) {
        lastTime = currentTime - (elapsed % frameInterval);

        // 使用完全透明的清除，让背景保持透明
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 提高不透明度到 0.7，让字符更清晰可见
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          // 随机取一个字符
          const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));

          // x = 列号 * 字体宽度, y = 当前下落高度 * 字体高度
          const y = drops[i] * fontSize;

          // 增加字符显示密度：每列绘制多个字符而不是只绘制一个
          // 从当前位置向上绘制8个字符，形成雨滴效果
          for (let j = 0; j < 8; j++) {
            const dropY = y - j * fontSize;
            if (dropY > 0 && dropY < canvas.height) {
              // 越靠前的字符越亮，尾部字符逐渐变暗
              const brightness = 1 - (j * 0.1);
              ctx.fillStyle = `rgba(0, 255, 0, ${0.7 * brightness})`;
              ctx.fillText(
                alphabet.charAt(Math.floor(Math.random() * alphabet.length)),
                i * fontSize,
                dropY
              );
            }
          }

          // 随机重置机制：如果掉出屏幕，或者随机因子触发，重置到顶部
          // Math.random() > 0.975 让每一列的重置时间不同，造成错落感
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }

          drops[i]++;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    let animationFrameId = requestAnimationFrame(draw);

    // 5. 自动退出机制：5秒后自动退出
    const autoExitTimer = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      setMatrixActive(false);
    }, 5000);

    // 6. 手动退出机制：点击或按任意键退出
    const exitMatrix = () => {
      cancelAnimationFrame(animationFrameId);
      setMatrixActive(false);
    };

    window.addEventListener('click', exitMatrix);
    window.addEventListener('keydown', exitMatrix);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(autoExitTimer);
      window.removeEventListener('click', exitMatrix);
      window.removeEventListener('keydown', exitMatrix);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMatrixActive, setMatrixActive]);

  if (!isMatrixActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] cursor-pointer"
      style={{ touchAction: 'none', pointerEvents: 'auto' }}
    />
  );
}
