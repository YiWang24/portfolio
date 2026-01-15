/**
 * ScrollReveal Component
 * Wrapper for scroll-triggered animations with stagger support
 * Animates every time elements come into view (once: false)
 */

"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number; // Custom delay in seconds
  className?: string;
  staggerIndex?: number; // For staggered animations in parent
}

// Animation variants
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0], // Custom cubic-bezier for smooth feel
    },
  },
};

// Stagger container variant for lists
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 50ms intervals between children
      delayChildren: 0.1, // Initial delay before first child
    },
  },
};

/**
 * ScrollReveal - Single item animation wrapper
 * Use this for individual elements that should fade in on scroll
 */
export default function ScrollReveal({
  children,
  delay = 0,
  className = "",
  staggerIndex,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: false, // Animate every time per user request
    margin: "-100px", // Trigger when element is 100px from viewport
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ delay }}
      className={className}
      custom={staggerIndex}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggeredList - Container for animating lists with staggered children
 * Wrap list items with this and they'll animate in sequence
 */
interface StaggeredListProps {
  children: ReactNode;
  className?: string;
}

export function StaggeredList({ children, className = "" }: StaggeredListProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: false,
    margin: "-100px",
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggeredItem - Individual item in a staggered list
 * Must be used inside StaggeredList
 */
interface StaggeredItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggeredItem({ children, className = "" }: StaggeredItemProps) {
  return (
    <motion.div variants={fadeInUp} className={className}>
      {children}
    </motion.div>
  );
}
