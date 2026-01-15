"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";

type ScrollRevealProps = {
    children: React.ReactNode;
    className?: string;
    width?: "full" | "contained";
    delay?: number;
};

export default function ScrollReveal({
    children,
    className = "",
    width = "contained",
    delay = 0
}: ScrollRevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1], // Apple-like ease
                delay: delay,
            }}
            className={`${width === "contained" ? "max-w-7xl mx-auto" : "w-full"} ${className}`}
        >
            {children}
        </motion.div>
    );
}
