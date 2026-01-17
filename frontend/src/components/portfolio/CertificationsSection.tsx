"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ChevronDown, ScanBarcode, Terminal, ArrowUpDown } from "lucide-react";
import { SectionBadge } from "./SectionBadge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ProfileData } from "@/types/profile";

interface CertificationsSectionProps {
    certifications: ProfileData["certifications"];
    coursework: ProfileData["coursework"];
}

type SortKey = keyof ProfileData["coursework"][0];

export function CertificationsSection({ certifications, coursework }: CertificationsSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
        key: 'date',
        direction: 'desc'
    });

    // Guard clause if data is missing
    if (!certifications || !coursework) return null;

    // Sorting Logic
    const handleSort = (key: SortKey) => {
        setSortConfig((current) => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const sortedCoursework = [...coursework].sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const displayedCourses = isExpanded ? sortedCoursework : sortedCoursework.slice(0, 5);

    const handleCardClick = (link: string) => {
        if (link) window.open(link, "_blank");
    };

    return (
        <section className="relative w-full min-h-screen flex items-center justify-center py-24 px-4 overflow-hidden">
            <div className="w-full max-w-6xl relative z-10 space-y-16">

                {/* Section Header */}
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex-1 flex justify-end pr-6">
                            <SectionBadge icon={ShieldCheck}>Credentials</SectionBadge>
                        </div>

                        <motion.h2
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-5xl font-bold font-mono text-center tracking-tight shrink-0"
                        >
                            <span className="text-slate-900 dark:text-white">SYSTEM_</span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 dark:text-emerald-400">LICENSES</span>
                        </motion.h2>

                        <div className="flex-1 pl-6 flex justify-start opacity-0 pointer-events-none" aria-hidden="true">
                            <SectionBadge icon={ShieldCheck}>Credentials</SectionBadge>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-zinc-500 font-mono text-sm text-center">
                        // Verified active credentials and knowledge packages.
                    </p>
                </div>

                {/* Part 1: Featured Certifications (Active Licenses) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {certifications.map((cert, index) => (
                        <motion.div
                            key={cert.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative h-40 w-full perspective-1000 cursor-pointer"
                            onClick={() => handleCardClick(cert.link)}
                        >
                            <div className="relative w-full h-full bg-white dark:bg-zinc-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden hover:border-emerald-500/50 shadow-sm dark:shadow-none transition-all duration-500 hover:shadow-md dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] group-hover:-translate-y-2">

                                {/* Holographic Gradient Overlay - Dark Mode Only */}
                                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 dark:group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", cert.color)} />

                                {/* Content Container */}
                                <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                                    {/* Top: Header & Badge */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-1.5 bg-slate-50 dark:bg-white/5 rounded-md border border-slate-100 dark:border-white/5 group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-colors">
                                            <ShieldCheck className={cn("w-5 h-5 text-slate-700 dark:text-white", cert.iconColor?.replace('text-', '') !== 'white' ? cert.iconColor : '')} />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase">Status</div>
                                            <div className="text-xs font-bold text-teal-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                </span>
                                                ACTIVE
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Cert Info */}
                                    <div className="space-y-1 my-auto">
                                        <div className="text-[9px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-widest inline-block">
                                            {cert.provider}
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-teal-700 dark:group-hover:text-emerald-100 transition-colors leading-tight line-clamp-2">
                                            {cert.name}
                                        </h3>
                                    </div>

                                    {/* Bottom: ID & Barcode */}
                                    <div className="flex justify-between items-end pt-2 mt-auto">
                                        <div className="text-left">
                                            <div className="text-[8px] font-mono text-slate-400 dark:text-zinc-600 uppercase">ID: {cert.id}</div>
                                        </div>
                                        <ScanBarcode className="absolute bottom-4 right-4 w-6 h-6 text-slate-300 dark:text-zinc-800 group-hover:text-teal-600/30 dark:group-hover:text-emerald-500/30 transition-colors" />
                                    </div>

                                    {/* Verify Stamp Overlay (Hover) */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-150 group-hover:scale-100 pointer-events-none rotate-[-15deg] border-2 border-dashed border-emerald-500/40 rounded px-2 py-1">
                                        <span className="text-lg font-black text-emerald-500/40 tracking-widest font-mono">VERIFIED</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Part 2: Coursework History (The Patch Log) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="w-full mt-12 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden backdrop-blur-sm shadow-sm dark:shadow-none"
                >
                    {/* Terminal Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                            <span className="text-sm font-mono text-slate-500 dark:text-zinc-400 font-bold">~/logs/knowledge_base.log</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                        </div>
                    </div>

                    {/* Table Header Row */}
                    <div className="grid grid-cols-12 px-4 py-3 border-b border-slate-200 dark:border-white/5 text-xs font-mono text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-wider items-center">
                        <div className="col-span-2">ID</div>
                        <div className="col-span-6 md:col-span-4">Module Name</div>

                        {/* Provider Header with Sort */}
                        <div className="col-span-2 hidden md:flex items-center gap-1 cursor-pointer hover:text-teal-500 transition-colors" onClick={() => handleSort('provider')}>
                            Provider
                            <ArrowUpDown className={cn("w-3 h-3", sortConfig.key === 'provider' ? "opacity-100" : "opacity-30")} />
                        </div>

                        {/* Type Header with Sort */}
                        <div className="col-span-2 hidden md:flex items-center gap-1 cursor-pointer hover:text-teal-500 transition-colors" onClick={() => handleSort('type')}>
                            Type
                            <ArrowUpDown className={cn("w-3 h-3", sortConfig.key === 'type' ? "opacity-100" : "opacity-30")} />
                        </div>

                        {/* Date Header with Sort */}
                        <div className="col-span-4 md:col-span-2 flex items-center justify-end gap-1 cursor-pointer hover:text-teal-500 transition-colors" onClick={() => handleSort('date')}>
                            Date/Grade
                            <ArrowUpDown className={cn("w-3 h-3", sortConfig.key === 'date' ? "opacity-100" : "opacity-30")} />
                        </div>
                    </div>

                    {/* Table Rows */}
                    <div className="relative">
                        <AnimatePresence mode="popLayout">
                            {displayedCourses.map((course, index) => (
                                <motion.div
                                    key={course.id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="grid grid-cols-12 px-4 py-3 border-b border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm font-mono items-center group"
                                >
                                    <div className="col-span-2 text-teal-600 dark:text-cyan-400 group-hover:text-teal-700 text-xs md:text-sm">
                                        {course.id}
                                    </div>
                                    <div className="col-span-6 md:col-span-4 text-slate-700 dark:text-zinc-100 font-semibold group-hover:text-slate-900 truncate pr-2">
                                        {course.name}
                                    </div>
                                    <div className="col-span-2 hidden md:block text-slate-500 dark:text-zinc-400 group-hover:text-slate-600 truncate pr-2 text-xs">
                                        {course.provider}
                                    </div>
                                    <div className="col-span-2 hidden md:block text-slate-500 dark:text-zinc-400 group-hover:text-slate-600 truncate pr-2 text-xs">
                                        {course.type}
                                    </div>
                                    <div className="col-span-4 md:col-span-2 text-right text-slate-500 dark:text-zinc-500 group-hover:text-slate-600">
                                        <span className="mr-2">{course.date}</span>
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded text-[10px]",
                                            course.grade.startsWith("A") || course.grade === "Completed"
                                                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border dark:border-emerald-500/20"
                                                : "bg-slate-100 dark:bg-muted text-slate-500 dark:text-muted-foreground"
                                        )}>
                                            {course.grade}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Fade Out Overlay (only if collapsed and needed) */}
                        {!isExpanded && coursework.length > 5 && (
                            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white dark:from-black via-white/80 dark:via-black/80 to-transparent pointer-events-none" />
                        )}
                    </div>

                    {/* Footer / Load More Action */}
                    <div className="p-2 bg-slate-50 dark:bg-muted/20 border-t border-slate-200 dark:border-border">
                        <Button
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-primary font-mono text-xs h-8 hover:bg-muted/50 group"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <span className="mr-2 opacity-50">$</span>
                            {isExpanded ? "collapse_view" : "load_all_records.sh"}
                            <span className="ml-2 animate-pulse group-hover:hidden">_</span>
                            <ChevronDown className={cn("w-3 h-3 ml-2 transition-transform opacity-50", isExpanded && "rotate-180")} />
                        </Button>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
