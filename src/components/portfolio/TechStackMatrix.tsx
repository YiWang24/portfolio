"use client";

import { motion } from "framer-motion";
import { FolderOpen, Cpu, Database, Layout, Cloud, Box, Code2, Terminal, Layers } from "lucide-react";
import { SectionBadge } from "./SectionBadge";
import { cn } from "@/lib/utils";
import type { ProfileData } from "@/types/profile";

// Import specific brand icons from react-icons/si
// Note: Only importing standard ones to avoid version conflicts
import {
    SiPython, SiOpenai, SiPytorch,
    SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiFramer,
    SiNodedotjs, SiFastapi, SiPostgresql, SiRedis, SiSocketdotio,
    SiDocker, SiKubernetes, SiAmazon, SiGithubactions, SiTerraform
} from "react-icons/si";

// Mock LangChain icon component (since it might be missing in some versions)
const LangChainIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
    </svg>
);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    // AI
    "Python": SiPython,
    "LangChain": LangChainIcon, // Custom fallback
    "OpenAI": SiOpenai,
    "PyTorch": SiPytorch,

    // Frontend
    "React": SiReact,
    "Nextjs": SiNextdotjs,
    "TypeScript": SiTypescript,
    "Tailwind": SiTailwindcss,
    "Framer": SiFramer,

    // Backend
    "Nodejs": SiNodedotjs, // Note: SiNodedotjs
    "FastAPI": SiFastapi,
    "PostgreSQL": SiPostgresql,
    "Redis": SiRedis,
    "Socket": SiSocketdotio,

    // DevOps
    "Docker": SiDocker,
    "Kubernetes": SiKubernetes,
    "AWS": SiAmazon,
    "GitHub": SiGithubactions,
    "Terraform": SiTerraform,

    // Generics
    "Database": Database,
    "Box": Box,
};

// Visual themes for the 4 layout columns (Index-based)
const VISUAL_THEMES = [
    // AI Core
    {
        icon: Cpu,
        color: "text-cyan-400",
        border: "group-hover:border-l-cyan-400",
        lineColor: "bg-cyan-500/20",
        dotColor: "bg-cyan-500/40",
        hoverStyles: "dark:hover:border-cyan-500/50 dark:hover:bg-cyan-500/5 dark:hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]",
    },
    // Frontend
    {
        icon: Layout,
        color: "text-violet-400",
        border: "group-hover:border-l-violet-400",
        lineColor: "bg-violet-500/20",
        dotColor: "bg-violet-500/40",
        hoverStyles: "dark:hover:border-violet-500/50 dark:hover:bg-violet-500/5 dark:hover:shadow-[0_0_15px_rgba(139,92,246,0.1)]",
    },
    // Backend
    {
        icon: Database,
        color: "text-emerald-400",
        border: "group-hover:border-l-emerald-400",
        lineColor: "bg-emerald-500/20",
        dotColor: "bg-emerald-500/40",
        hoverStyles: "dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/5 dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    },
    // DevOps
    {
        icon: Cloud,
        color: "text-fuchsia-400",
        border: "group-hover:border-l-fuchsia-400",
        lineColor: "bg-fuchsia-500/20",
        dotColor: "bg-fuchsia-500/40",
        hoverStyles: "dark:hover:border-fuchsia-500/50 dark:hover:bg-fuchsia-500/5 dark:hover:shadow-[0_0_15px_rgba(232,121,249,0.1)]",
    },
];

interface TechStackMatrixProps {
    modules: ProfileData["modules"];
}

export function TechStackMatrix({ modules }: TechStackMatrixProps) {
    // If no modules, return null or empty
    if (!modules || modules.length === 0) return null;

    return (
        <section className="relative w-full min-h-screen flex items-center justify-center py-20 px-4 overflow-hidden">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_4px,6px_100%] pointer-events-none opacity-10" />

            <div className="w-full max-w-7xl relative z-10 space-y-16">
                {/* Section Header */}
                <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex-1 flex justify-end pr-4">
                        <SectionBadge icon={Layers}>Dependencies</SectionBadge>
                    </div>
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center m-0 shrink-0 font-mono tracking-tight"
                    >
                        <span className="text-slate-900 dark:text-white">SYSTEM_</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300">MATRIX</span>
                    </motion.h2>
                    <div className="flex-1 pl-4 flex justify-start opacity-0 pointer-events-none" aria-hidden="true">
                        <SectionBadge icon={Layers}>Dependencies</SectionBadge>
                    </div>
                </div>

                {/* The Matrix Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                    {modules.map((moduleData, index) => {
                        // Apply visual theme based on index (cycling if more than 4)
                        const theme = VISUAL_THEMES[index % VISUAL_THEMES.length];
                        const DomainIcon = theme.icon;

                        return (
                            <motion.div
                                key={moduleData.category}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="flex flex-col relative"
                            >
                                {/* Column Header (Folder Style) */}
                                <div className="flex items-center gap-3 pb-3 mb-2 group relative z-10">
                                    <FolderOpen className={cn("w-5 h-5 transition-colors", theme.color)} />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                                            Directory
                                        </span>
                                        <span className={cn("text-xs font-mono font-bold transition-colors group-hover:text-foreground", theme.color)}>
                                            {moduleData.path}
                                        </span>
                                    </div>
                                </div>

                                {/* The Tree Guide Line (Vertical) */}
                                <div className={cn("absolute top-[2.5rem] left-[0.6rem] bottom-8 w-[2px] rounded-full z-0", theme.lineColor)} />

                                {/* Tech Chips Stack */}
                                <div className="space-y-4 pl-8 relative z-10 pt-2">
                                    {moduleData.items.map((item, itemIndex) => {
                                        // Resolve Icon
                                        const TechIcon = item.icon && iconMap[item.icon] ? iconMap[item.icon] : Code2;

                                        return (
                                            <motion.div
                                                key={item.name}
                                                initial={{ opacity: 0, x: -10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.3, delay: (index * 0.1) + (itemIndex * 0.05) }}
                                                className="relative"
                                            >
                                                {/* Horizontal Branch Connector (├─) */}
                                                <div className={cn(
                                                    "absolute top-1/2 -left-[1.4rem] w-6 h-[2px] -translate-y-1/2",
                                                    theme.lineColor
                                                )} />

                                                {/* Dot at intersection */}
                                                <div className={cn(
                                                    "absolute top-1/2 -left-[1.6rem] w-1.5 h-1.5 rounded-full -translate-y-1/2",
                                                    theme.dotColor
                                                )} />

                                                <div className={cn(
                                                    "group relative flex items-center justify-between p-3 bg-white border border-slate-300 shadow-sm dark:bg-black/40 dark:backdrop-blur-sm dark:border-white/10 dark:shadow-none hover:bg-slate-50 hover:shadow-md hover:border-slate-400 transition-all duration-300 cursor-default overflow-hidden rounded-r-md border-l-2 border-l-slate-300 dark:border-l-white/10 dark:hover:backdrop-blur-xl",
                                                    theme.border,
                                                    theme.hoverStyles
                                                )}>
                                                    {/* Matrix Rain / Grid Overlay on Hover */}
                                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                                    {/* Left: Tech Name & Icon */}
                                                    <div className="flex items-center gap-3 relative z-10">
                                                        <TechIcon className={cn("w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity", theme.color)} />
                                                        <span className="font-bold text-slate-800 dark:text-muted-foreground group-hover:text-black dark:group-hover:text-foreground text-sm tracking-wide">
                                                            {item.name}
                                                        </span>
                                                    </div>

                                                    {/* Right: Version Pill */}
                                                    <div className="relative z-10">
                                                        <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-500 border-slate-200 dark:bg-muted/50 dark:text-muted-foreground dark:border-border rounded text-[10px] font-mono group-hover:text-slate-600 dark:group-hover:text-muted-foreground/80 transition-colors border">
                                                            {item.version}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
