"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ChevronDown, ScanBarcode, Terminal } from "lucide-react";
import { SectionBadge } from "./SectionBadge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ProfileData } from "@/types/profile";

interface CertificationsSectionProps {
    certifications: ProfileData["certifications"];
    coursework: ProfileData["coursework"];
}

export function CertificationsSection({ certifications, coursework }: CertificationsSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Guard clause if data is missing
    if (!certifications || !coursework) return null;

    // Sort coursework by date descending (Newest first)
    const sortedCoursework = [...coursework].sort((a, b) => b.date.localeCompare(a.date));

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
                            <span className="text-white">SYSTEM_</span>
                            <span className="text-emerald-400">LICENSES</span>
                        </motion.h2>

                        <div className="flex-1 pl-6 flex justify-start opacity-0 pointer-events-none" aria-hidden="true">
                            <SectionBadge icon={ShieldCheck}>Credentials</SectionBadge>
                        </div>
                    </div>
                    <p className="text-zinc-500 font-mono text-sm text-center">
                        // Verified active credentials and knowledge packages.
                    </p>
                </div>

                {/* Part 1: Featured Certifications (Active Licenses) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certifications.map((cert, index) => (
                        <motion.div
                            key={cert.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative h-64 perspective-1000 cursor-pointer"
                            onClick={() => handleCardClick(cert.link)}
                        >
                            <div className="relative w-full h-full bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] group-hover:-translate-y-2">

                                {/* Holographic Gradient Overlay */}
                                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", cert.color)} />

                                {/* Content Container */}
                                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                                    {/* Top: Header & Badge */}
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:bg-white/10 transition-colors">
                                            <ShieldCheck className={cn("w-6 h-6", cert.iconColor)} />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-mono text-zinc-500 uppercase">Status</div>
                                            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                </span>
                                                ACTIVE
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Cert Info */}
                                    <div className="space-y-2 my-auto text-center">
                                        <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-2 inline-block">
                                            {cert.provider}
                                        </div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-100 transition-colors leading-tight">
                                            {cert.name}
                                        </h3>
                                    </div>

                                    {/* Bottom: ID & Barcode */}
                                    <div className="flex justify-between items-end pt-4 border-t border-white/5 mt-auto">
                                        <div className="text-left">
                                            <div className="text-[9px] font-mono text-zinc-600 uppercase">License ID</div>
                                            <div className="text-xs font-mono text-zinc-400">{cert.id}</div>
                                        </div>
                                        <ScanBarcode className="w-8 h-8 text-zinc-700 group-hover:text-emerald-500/50 transition-colors" />
                                    </div>

                                    {/* Verify Stamp Overlay (Hover) */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-150 group-hover:scale-100 pointer-events-none rotate-[-15deg] border-4 border-dashed border-emerald-500/40 rounded px-4 py-2">
                                        <span className="text-2xl font-black text-emerald-500/40 tracking-widest font-mono">VERIFIED</span>
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
                    className="w-full mt-12 bg-black/40 border border-white/10 rounded-lg overflow-hidden backdrop-blur-sm"
                >
                    {/* Terminal Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-zinc-500" />
                            <span className="text-sm font-mono text-zinc-400 font-bold">~/logs/knowledge_base.log</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                        </div>
                    </div>

                    {/* Table Header Row */}
                    <div className="grid grid-cols-12 px-4 py-3 border-b border-white/5 text-xs font-mono text-zinc-500 font-bold uppercase tracking-wider">
                        <div className="col-span-2">ID</div>
                        <div className="col-span-6 md:col-span-5">Module Name</div>
                        <div className="col-span-3 hidden md:block">Provider</div>
                        <div className="col-span-4 md:col-span-2 text-right">Date/Grade</div>
                    </div>

                    {/* Table Rows */}
                    <div className="relative">
                        <AnimatePresence>
                            {displayedCourses.map((course, index) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="grid grid-cols-12 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors text-sm font-mono items-center group"
                                >
                                    <div className="col-span-2 text-emerald-500/80 group-hover:text-emerald-400">
                                        {course.id}
                                    </div>
                                    <div className="col-span-6 md:col-span-5 text-zinc-300 font-semibold group-hover:text-white truncate pr-2">
                                        {course.name}
                                    </div>
                                    <div className="col-span-3 hidden md:block text-zinc-500 group-hover:text-zinc-400 truncate pr-2">
                                        {course.provider}
                                    </div>
                                    <div className="col-span-4 md:col-span-2 text-right text-zinc-600 group-hover:text-zinc-500">
                                        <span className="mr-2">{course.date}</span>
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded text-[10px]",
                                            course.grade.startsWith("A") || course.grade === "Completed" ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-400"
                                        )}>
                                            {course.grade}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Fade Out Overlay (only if collapsed and needed) */}
                        {!isExpanded && coursework.length > 5 && (
                            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
                        )}
                    </div>

                    {/* Footer / Load More Action */}
                    <div className="p-2 bg-white/[0.02] border-t border-white/5">
                        <Button
                            variant="ghost"
                            className="w-full text-zinc-500 hover:text-emerald-400 font-mono text-xs h-8 hover:bg-white/5 group"
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
