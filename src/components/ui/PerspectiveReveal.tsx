"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface PerspectiveRevealProps {
    children: React.ReactNode;
    className?: string;
}

// Used to apply rotateX + perspective(1200px), which created a 3D stacking
// context over the fixed blurred background — every reveal forced the
// rasterizer to re-composite the background subtree. Switched to 2D
// transform+opacity for the same "rises into view" feel without the cost.
export default function PerspectiveReveal({
    children,
    className = "",
}: PerspectiveRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-12% 0px" });

    return (
        <div ref={ref} className={className}>
            <motion.div
                initial={{ opacity: 0, y: 48, scale: 0.97 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : undefined}
                transition={{
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                }}
                style={{ willChange: isInView ? "auto" : "transform, opacity" }}
            >
                {children}
            </motion.div>
        </div>
    );
}
