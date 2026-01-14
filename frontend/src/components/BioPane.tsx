"use client";

import { Github, Mail, Code2, Briefcase, GitFork, Star } from "lucide-react";
import type { BioData } from "../types";

interface BioPaneProps {
  isConnected: boolean;
  data?: BioData;
}

const defaultBioData: BioData = {
  name: "Jane Doe",
  role: "System Architect",
  bio: "Communicating seamless digital experiences at the intersection of Design and Artificial Intelligence.",
  stats: {
    yearsExp: "5+",
    projects: "50+",
    commits: "1.2K",
    stars: "100+",
  },
  links: {
    github: "https://github.com",
    email: "developer@portfolio.com",
  },
};

const techStack = [
  "Next.js",
  "TypeScript",
  "Node.js",
  "TensorFlow",
  "WebGL",
  "PostgreSQL",
];

// Staggered animation delays
const delays = ["animation-delay-100", "animation-delay-200", "animation-delay-300"];

export default function BioPane({
  isConnected,
  data = defaultBioData,
}: BioPaneProps) {
  return (
    <div className="h-full flex flex-col p-5 overflow-y-auto relative">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section - Asymmetrical layout */}
      <div className="mb-6 relative">
        {/* Avatar with gradient border wrapper */}
        <div className="flex items-start gap-4 mb-5">
          <div className="relative flex-shrink-0">
            <div className="p-[2px] rounded-xl bg-gradient-to-br from-emerald-400/40 to-cyan-400/40">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/50 backdrop-blur-sm relative">
                {data.avatar ? (
                  <img
                    src={data.avatar}
                    alt={data.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white/90">
                      {data.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* Online status indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#05070f] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          {/* Name and role - overlapping */}
          <div className="pt-1 flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white leading-tight mb-2 tracking-tight">
              {data.name}
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-400/20 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider">
                {data.role}
              </span>
            </div>
          </div>
        </div>

        {/* Bio text with styled left border */}
        <p className="text-sm leading-relaxed text-slate-400 border-l-2 border-purple-500/30 pl-4 italic">
          {data.bio}
        </p>
      </div>

      {/* Stats Grid - Gradient border cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "EXPERIENCE", value: data.stats.yearsExp, icon: Briefcase },
          { label: "PROJECTS", value: data.stats.projects, icon: Code2 },
          { label: "COMMITS", value: data.stats.commits, icon: GitFork },
          { label: "STARS", value: data.stats.stars, icon: Star },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group relative p-[1px] rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/40 hover:to-cyan-500/40 transition-all duration-300"
            >
              <div className="relative bg-[#05070f]/90 backdrop-blur-sm rounded-xl p-3 h-full">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={12} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                    {stat.label}
                  </span>
                </div>
                <span className="text-xl font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tech Stack - Categorized grid */}
      <div className="mb-6">
        <h3 className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">
          <div className="w-4 h-px bg-gradient-to-r from-slate-600 to-transparent" />
          Tech Stack
        </h3>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech, idx) => (
            <span
              key={tech}
              className="px-3 py-1.5 text-xs font-mono bg-white/[0.03] border border-white/10 rounded-lg hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300 text-slate-400 transition-all duration-200 cursor-default"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Availability Status */}
      <div className="mb-6 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            STATUS
          </span>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
              Available
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons - Stacked with gradient accents */}
      <div className="mt-auto space-y-3">
        <button
          type="button"
          className="group w-full py-3 flex items-center justify-center gap-3 text-sm font-mono text-slate-300 border border-slate-700/50 rounded-xl hover:border-slate-500/50 hover:text-white hover:bg-slate-800/30 transition-all duration-200"
        >
          <Github size={16} className="group-hover:text-white transition-colors" />
          <span>GITHUB</span>
        </button>
        <button
          type="button"
          className="group w-full py-3 flex items-center justify-center gap-3 text-sm font-mono text-white bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-400/30 rounded-xl hover:from-cyan-500/30 hover:to-emerald-500/30 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-200"
        >
          <Mail size={16} className="group-hover:scale-110 transition-transform" />
          <span className="font-semibold">CONTACT</span>
        </button>
      </div>
    </div>
  );
}
