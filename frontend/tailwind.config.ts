import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#050505",
        panel: "rgba(20, 20, 20, 0.6)",
        "border-glass": "rgba(255, 255, 255, 0.08)",
        "neon-green": "#10B981",
        "neon-purple": "#8B5CF6",
        "text-muted": "#9CA3AF",
      },
      fontFamily: {
        mono: ["var(--font-jetbrains-mono)", "monospace"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      animation: {
        "cursor-blink": "blink 1s step-end infinite",
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "boot-scale": "bootScale 0.6s ease-out forwards",
        "tunnel-flow": "tunnelFlow 2s linear infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
        bootScale: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        tunnelFlow: {
          "0%": { backgroundPosition: "0 0, 0 0" },
          "100%": { backgroundPosition: "80px 80px, 80px 80px" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
