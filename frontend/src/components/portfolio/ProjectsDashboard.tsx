"use client";

import { motion } from "framer-motion";
import { Github, ExternalLink, Terminal, Cpu, Activity, Lock, Globe, Server, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionBadge } from "./SectionBadge";
import type { ProfileData } from "@/types/profile";
import { useState, useEffect, useRef } from "react";

interface ProjectsDashboardProps {
    projects: ProfileData["projects"];
}

// Visual component for live data visualization
function LiveSparkline({ seed, color = "text-cyan-500" }: { seed: number, color?: string }) {
    const [path, setPath] = useState("");
    const [fillPath, setFillPath] = useState("");

    // Use refs for animation state to avoid closure staleness issues in intervals
    const dataRef = useRef<number[]>([]);

    useEffect(() => {
        // Initialize data
        const points = 20;
        dataRef.current = Array.from({ length: points }, (_, i) =>
            25 + Math.sin(seed + i) * 10
        );

        const updateGraph = () => {
            const data = dataRef.current;
            // Shift left (remove first)
            data.shift();
            // Add new random point (clamped between 5 and 35)
            // Use semi-random walk
            const last = data[data.length - 1];
            const change = (Math.random() - 0.5) * 10;
            let next = last + change;
            // Clamp to keep in view
            if (next < 5) next = 5 + Math.random() * 5;
            if (next > 45) next = 45 - Math.random() * 5;

            data.push(next);

            // Generate SVG path from data
            // ViewBox width approx 100, so step = 100 / (points - 1)
            const width = 100;
            const step = width / (data.length - 1);

            let d = `M0 ${data[0]}`;
            for (let i = 1; i < data.length; i++) {
                // Smooth curve using cubic bezier or just simple lines for aggressive look
                // Let's use simple lines for "technical" look
                d += ` L${i * step} ${data[i]}`;
            }

            setPath(d);
            setFillPath(`${d} V 50 H 0 Z`);
        };

        const interval = setInterval(updateGraph, 1000);
        return () => clearInterval(interval);
    }, [seed]);

    return (
        <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
            <path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className={color}
                vectorEffect="non-scaling-stroke"
            />
            <path
                d={fillPath}
                fill="currentColor"
                className={`${color} opacity-10`}
                stroke="none"
            />
        </svg>
    );
}

export function ProjectsDashboard({ projects }: ProjectsDashboardProps) {
    const featuredProject = projects[0];
    const standardProjects = projects.slice(1);

    return (
        <section className="relative w-full min-h-screen flex items-center justify-center py-20 px-4">
            <div className="w-full max-w-6xl space-y-12">
                {/* Section Header */}
                <div className="flex flex-row items-center justify-between w-full mb-16">
                    <div className="flex-1 flex justify-end pr-4">
                        <SectionBadge icon="projects">Mission Control</SectionBadge>
                    </div>
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-4xl font-bold text-center m-0 shrink-0"
                    >
                        <span className="text-white">Active </span>
                        <span className="text-cyan-400">Deployments</span>
                    </motion.h2>
                    <div className="flex-1 pl-4 flex justify-start opacity-0 pointer-events-none" aria-hidden="true">
                        <SectionBadge icon="projects">Mission Control</SectionBadge>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Featured Project - Holographic View */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                    >
                        <Card className="group relative bg-zinc-900/40 backdrop-blur-md border border-white/10 overflow-hidden hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_4px,6px_100%] pointer-events-none opacity-20" />

                            <div className="grid lg:grid-cols-2 gap-0 h-full">
                                {/* Content Side */}
                                <div className="p-6 md:p-8 flex flex-col justify-between relative z-10 border-b lg:border-b-0 lg:border-r border-white/5 bg-zinc-950/30">
                                    <div className="space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Terminal className="w-5 h-5 text-cyan-500" />
                                                    <h3 className="text-2xl font-bold font-mono text-white tracking-tight">
                                                        {featuredProject.title}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400/80">
                                                    <Activity className="w-3 h-3 animate-pulse" />
                                                    <span>System Active</span>
                                                    <span className="text-zinc-600">|</span>
                                                    <span>v2.4.0</span>
                                                </div>
                                            </div>

                                            {featuredProject.metrics && (
                                                <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs gap-1.5">
                                                    ★ {featuredProject.metrics.stars}
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                                            {featuredProject.summary}
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {featuredProject.tech.map((t) => (
                                                <div key={t} className="px-2 py-0.5 border border-white/10 text-xs font-mono text-zinc-400 rounded-sm hover:text-cyan-300 hover:border-cyan-500/30 transition-colors">
                                                    {t}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-8">
                                        {featuredProject.links?.demo && (
                                            <Button
                                                variant="default"
                                                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold font-mono tracking-wide cursor-pointer"
                                                onClick={() => window.open(featuredProject.links?.demo, '_blank')}
                                            >
                                                <Globe className="w-4 h-4 mr-2" />
                                                LAUNCH_
                                            </Button>
                                        )}
                                        {featuredProject.links?.repo && (
                                            <Button
                                                variant="outline"
                                                className="border-white/20 text-zinc-300 hover:text-white hover:bg-white/10 font-mono tracking-wide bg-transparent cursor-pointer"
                                                onClick={() => window.open(featuredProject.links?.repo, '_blank')}
                                            >
                                                <Github className="w-4 h-4 mr-2" />
                                                SOURCE
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Visual Side - Holographic View */}
                                <div className="relative min-h-[300px] lg:min-h-full bg-black/40 p-0 flex items-center justify-center overflow-hidden group-hover:bg-black/30 transition-colors duration-500">
                                    {/* Background Grid */}
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                                    {/* Window Container - Full Size */}
                                    <div className="relative z-10 w-full h-full border-l border-white/10 bg-black overflow-hidden group-hover:shadow-[inset_0_0_50px_rgba(34,211,238,0.1)] transition-all duration-500">
                                        {/* Window Header Overlay */}
                                        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/80 to-transparent flex items-center px-4 gap-2 z-20">
                                            <div className="w-2 h-2 rounded-full bg-red-500/80" />
                                            <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                                            <div className="w-2 h-2 rounded-full bg-green-500/80" />
                                            <div className="ml-auto text-[10px] font-mono text-cyan-500/50">PREVIEW_MODE</div>
                                        </div>

                                        {/* Video Player with Scanlines */}
                                        <div className="relative w-full h-full bg-zinc-900 flex items-center justify-center">
                                            <video
                                                src={featuredProject.links?.demo}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                className="w-full h-full object-cover opacity-90"
                                            />
                                            {/* CRT Overlay */}
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none z-10" />
                                            <div className="absolute inset-0 bg-cyan-500/5 mix-blend-overlay z-10" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Bottom Row: Standard Projects Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {standardProjects.map((project, index) => (
                            <motion.div
                                key={project.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Card
                                    onClick={() => {
                                        const url = project.links?.demo || project.links?.repo;
                                        if (url) window.open(url, '_blank');
                                    }}
                                    className="group h-full flex flex-col bg-zinc-900/40 backdrop-blur-md border border-white/10 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative cursor-pointer"
                                >
                                    <div className="p-1 h-full">
                                        <div className="bg-zinc-950/50 border border-white/5 p-5 h-full flex flex-col relative overflow-hidden">

                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div className="flex items-center gap-2">
                                                    <Hash className="w-4 h-4 text-cyan-600" />
                                                    <h4 className="font-bold font-mono text-zinc-100 text-sm group-hover:text-cyan-400 transition-colors">{project.title}</h4>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 shadow-[0_0_5px_rgba(16,185,129,0.5)] animate-pulse" />
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-xs text-zinc-400 flex-1 mb-6 leading-relaxed line-clamp-3 relative z-10">
                                                {project.summary}
                                            </p>

                                            {/* Tech Stack - Outlined Tags */}
                                            <div className="flex flex-wrap gap-1.5 mb-6 relative z-10">
                                                {project.tech.slice(0, 3).map(t => (
                                                    <span key={t} className="text-[10px] font-mono text-zinc-500 border border-white/10 px-1.5 py-0.5 rounded-sm group-hover:text-zinc-300 group-hover:border-white/20 transition-colors">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Footer / Links */}
                                            <div className="flex items-center justify-between pt-3 border-t border-white/5 relative z-10 mt-auto">
                                                <span className="text-[10px] font-mono text-zinc-600 uppercase">
                                                    ID: {1024 + index}
                                                </span>
                                                <div className="flex gap-2">
                                                    {project.links?.repo && (
                                                        <a href={project.links.repo} target="_blank" onClick={(e) => e.stopPropagation()} className="text-zinc-500 hover:text-white transition-colors">
                                                            <Github className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    {project.links?.demo && (
                                                        <a href={project.links.demo} target="_blank" onClick={(e) => e.stopPropagation()} className="text-zinc-500 hover:text-cyan-400 transition-colors">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Bottom Live Sparkline */}
                                            <div className="absolute bottom-0 left-0 right-0 h-10 opacity-30 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none">
                                                <LiveSparkline seed={index} color="text-cyan-500" />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
