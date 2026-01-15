"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface PerspectiveRevealProps {
    children: React.ReactNode;
    className?: string;
}

export default function PerspectiveReveal({ children, className = "" }: PerspectiveRevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    // 使用 useInView 替代 useScroll，不再依赖滚动容器的传递
    // Detect when element appears in viewport
    const isInView = useInView(ref, {
        once: true, // Animation triggers only once
        margin: "-10% 0px" // Trigger when element is slightly inside the viewport
    });

    return (
        <div
            ref={ref}
            className={`perspective-container ${className}`}
            style={{ perspective: "1200px" }} // Define 3D space depth
        >
            <motion.div
                initial={{
                    opacity: 0,
                    rotateX: 20,
                    scale: 0.9,
                    y: 60
                }}
                animate={isInView ? {
                    opacity: 1,
                    rotateX: 0,
                    scale: 1,
                    y: 0
                } : {}}
                transition={{
                    duration: 0.8,
                    ease: [0.215, 0.61, 0.355, 1], // Cubic bezier for "out-cubic" easing
                    delay: 0.1
                }}
                style={{
                    transformStyle: "preserve-3d"
                }}
                className="will-change-transform origin-bottom"
            >
                {children}
            </motion.div>
        </div>
    );
}
