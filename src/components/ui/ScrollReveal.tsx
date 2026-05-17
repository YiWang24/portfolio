"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

type ScrollRevealProps = {
    children: React.ReactNode;
    className?: string;
    width?: "full" | "contained";
    delay?: number;
};

// Transform + opacity only. Animating `filter: blur` here used to repaint the
// entire subtree on every frame while it was tweening, which compounded with
// the fixed background's existing paint cost. Pure compositor properties keep
// reveals on the GPU.
export default function ScrollReveal({
    children,
    className = "",
    width = "contained",
    delay = 0,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-15% 0px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
                delay,
            }}
            style={{ willChange: isInView ? "auto" : "transform, opacity" }}
            className={`${width === "contained" ? "max-w-7xl mx-auto" : "w-full"} ${className}`}
        >
            {children}
        </motion.div>
    );
}
