"use client";

import { motion } from "framer-motion";
import { GitCommit, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionBadge } from "./SectionBadge";
import type { ProfileData } from "@/types/profile";

interface ExperienceSectionProps {
    experience: ProfileData["experience"];
}

export function ExperienceSection({ experience }: ExperienceSectionProps) {
    return (
        <section className="relative w-full min-h-screen flex items-center justify-center py-20 px-4">
            <div className="w-full max-w-4xl">
                {/* Section Header */}
                {/* Section Header */}
                <div className="flex flex-row items-center justify-between w-full mb-16">
                    {/* Left: Real Badge */}
                    <div className="flex-1 flex justify-end pr-4">
                        <SectionBadge icon="experience">System Log</SectionBadge>
                    </div>

                    {/* Center: Title */}
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-4xl font-bold text-center m-0 shrink-0"
                    >
                        <span className="text-white">Execution </span>
                        <span className="text-cyan-400">History</span>
                    </motion.h2>

                    {/* Right: Ghost Badge for Balance */}
                    <div className="flex-1 pl-4 flex justify-start opacity-0 pointer-events-none" aria-hidden="true">
                        <SectionBadge icon="experience">System Log</SectionBadge>
                    </div>
                </div>

                {/* Git Log Container */}
                <div className="relative">
                    {/* Vertical Git Line */}
                    <div className="absolute left-[28px] md:left-[120px] top-4 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 via-zinc-800 to-transparent" />

                    <div className="space-y-12">
                        {experience.map((job, index) => (
                            <motion.div
                                key={job.company}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                className="relative flex gap-6 md:gap-10 group"
                            >
                                {/* 1. Time Column (Desktop) */}
                                <div className="hidden md:flex w-[100px] flex-col items-end pt-1 gap-1 text-right">
                                    <span className="font-mono text-sm font-bold text-cyan-400/80">
                                        {job.period.split(" - ")[0]}
                                    </span>
                                    <span className="font-mono text-xs text-zinc-500">
                                        {job.period.split(" - ")[1] || "Present"}
                                    </span>
                                </div>

                                {/* 2. Commit Node Column */}
                                <div className="relative flex flex-col items-center flex-shrink-0 w-14 md:w-4">
                                    {/* The Dot */}
                                    <div className="relative z-10 w-4 h-4 rounded-full bg-[#0d1117] border-2 border-cyan-500 shadow-[0_0_0_rgba(6,182,212,0)] group-hover:scale-125 group-hover:shadow-[0_0_10px_0px_rgba(6,182,212,0.8)] transition-all duration-300">
                                        <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping opacity-50" />
                                    </div>
                                    {/* Mobile Time (below dot) */}
                                    <div className="md:hidden mt-2 flex flex-col items-center gap-0.5 w-max">
                                        <span className="font-mono text-[10px] text-cyan-400/80 tracking-tighter">
                                            {job.period.split(" - ")[0]}
                                        </span>
                                        <div className="w-0.5 h-2 bg-zinc-800" />
                                    </div>
                                </div>

                                {/* 3. Content Card (The Log) - IDE Block Style */}
                                <Card className="flex-1 bg-[#0d1117]/80 border-white/5 backdrop-blur-sm overflow-hidden group-hover:border-cyan-500/30 group-hover:bg-[#0d1117]/95 transition-all duration-300 shadow-xl">
                                    {/* Code Editor Top Bar Decoration */}
                                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <CardContent className="p-5 md:p-6 space-y-5">
                                        {/* Header */}
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                                            <div className="space-y-1">
                                                <h3 className="text-lg md:text-xl font-bold text-zinc-100 font-mono tracking-tight flex items-center gap-3">
                                                    {job.title}
                                                    {index === 0 && (
                                                        <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-400 bg-cyan-500/10 animate-pulse rounded-sm px-1.5 py-0">
                                                            HEAD
                                                        </Badge>
                                                    )}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-mono">
                                                    <span className="text-cyan-400 font-semibold">@{job.company}</span>
                                                    <span className="text-zinc-700 hidden sm:inline">|</span>
                                                    <span className="text-zinc-500 flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {job.location}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Commit Messages (Achievements) - Code Comment Style */}
                                        <div className="space-y-2.5 font-mono text-xs md:text-sm text-zinc-400 relative">
                                            {/* Vertical line specifically for comments block */}
                                            <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-zinc-800/50 rounded-full" />

                                            {job.achievements.map((achievement, i) => (
                                                <div key={i} className="flex items-start gap-3 pl-4 group/line">
                                                    <span className="text-zinc-600 select-none mt-0.5 flex-shrink-0 opacity-50 font-sans">
                                                        {/* Line number simulation */}
                                                        {i + 1}.
                                                    </span>
                                                    <span className="leading-relaxed group-hover/line:text-zinc-300 transition-colors">
                                                        <span className="text-purple-400/80">feat:</span> {achievement}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer: Tech Stack - Tags Style */}
                                        <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5 mt-4">
                                            {job.tech.map((tech) => (
                                                <div
                                                    key={tech}
                                                    className="font-mono text-[10px] md:text-xs px-2 py-1 rounded-md bg-cyan-500/5 text-cyan-400/90 border border-cyan-500/10 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-colors cursor-default"
                                                >
                                                    {tech}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
