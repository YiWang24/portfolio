/**
 * SectionHeader Component
 * Displays section number and title with scroll-triggered animation
 * Borderless design with fade-in animation
 */

"use client";

import { motion } from "framer-motion";

interface SectionHeaderProps {
  number: string; // "01", "02", etc.
  title: string; // "Education", "Experience", etc.
}

export default function SectionHeader({ number, title }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <h2 className="text-2xl font-bold">
        <span className="font-mono text-white/40">{number}</span>
        <span className="mx-3 text-white/20">/</span>
        <span>{title}</span>
      </h2>
    </motion.div>
  );
}
