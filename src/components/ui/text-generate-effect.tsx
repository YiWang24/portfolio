/**
 * TextGenerateEffect Component
 *
 * Creates a typing animation effect for text
 * From Aceternity UI - https://ui.aceternity.com/components/text-generate-effect
 */

"use client";

import { useEffect, useState } from "react";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  duration?: number;
  filter?: boolean;
}

export const TextGenerateEffect: React.FC<TextGenerateEffectProps> = ({
  words,
  className = "",
  duration = 0.5,
  filter = true,
}) => {
  const [renderedText, setRenderedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < words.length) {
      const timeout = setTimeout(() => {
        setRenderedText((prev) => prev + words[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, duration * 1000 / words.length);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, words, duration]);

  return (
    <div className={className}>
      <span
        className={filter ? "blur-sm" : "blur-none"}
        style={{
          transition: "filter 0.5s ease",
        }}
      >
        {renderedText}
      </span>
    </div>
  );
};

export default TextGenerateEffect;
