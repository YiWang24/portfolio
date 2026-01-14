"use client";

import { useState } from "react";
import { Info, X, Mail, Download, Github, Linkedin } from "lucide-react";
import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiVuedotjs,
  SiAngular,
  SiNodedotjs,
  SiExpress,
  SiSpring,
  SiDocker,
  SiKubernetes,
  SiPostgresql,
  SiMysql,
  SiMongodb,
  SiRedis,
  SiGraphql,
  SiTailwindcss,
  SiGit,
  SiPython,
  SiGo,
} from "react-icons/si";
import { FaJava, FaAws } from "react-icons/fa";
import type { IconType } from "react-icons";

type TechStack = {
  languages?: string[];
  frameworks?: string[];
  cloud?: string[];
  tools?: string[];
};

type HeroData = {
  name: string;
  role: string;
  intro: string;
  avatar?: string;
  github?: string;
  techStack?: TechStack;
};

type Props = {
  hero: HeroData;
};

const GITHUB_STATS_BASE = "https://github-readme-stats-myl.vercel.app";

// Tech name to icon mapping (subset for mobile)
const techIconMap: Record<string, { icon: IconType; color: string }> = {
  java: { icon: FaJava, color: "#ED8B00" },
  javascript: { icon: SiJavascript, color: "#F7DF1E" },
  typescript: { icon: SiTypescript, color: "#3178C6" },
  python: { icon: SiPython, color: "#3776AB" },
  go: { icon: SiGo, color: "#00ADD8" },
  react: { icon: SiReact, color: "#61DAFB" },
  "next.js": { icon: SiNextdotjs, color: "#ffffff" },
  nextjs: { icon: SiNextdotjs, color: "#ffffff" },
  vue: { icon: SiVuedotjs, color: "#4FC08D" },
  "vue.js": { icon: SiVuedotjs, color: "#4FC08D" },
  angular: { icon: SiAngular, color: "#DD0031" },
  tailwind: { icon: SiTailwindcss, color: "#06B6D4" },
  tailwindcss: { icon: SiTailwindcss, color: "#06B6D4" },
  "node.js": { icon: SiNodedotjs, color: "#339933" },
  nodejs: { icon: SiNodedotjs, color: "#339933" },
  express: { icon: SiExpress, color: "#ffffff" },
  spring: { icon: SiSpring, color: "#6DB33F" },
  "spring boot": { icon: SiSpring, color: "#6DB33F" },
  graphql: { icon: SiGraphql, color: "#E10098" },
  postgresql: { icon: SiPostgresql, color: "#4169E1" },
  postgres: { icon: SiPostgresql, color: "#4169E1" },
  mysql: { icon: SiMysql, color: "#4479A1" },
  mongodb: { icon: SiMongodb, color: "#47A248" },
  redis: { icon: SiRedis, color: "#DC382D" },
  docker: { icon: SiDocker, color: "#2496ED" },
  kubernetes: { icon: SiKubernetes, color: "#326CE5" },
  k8s: { icon: SiKubernetes, color: "#326CE5" },
  aws: { icon: FaAws, color: "#FF9900" },
  git: { icon: SiGit, color: "#F05032" },
};

export default function MobileHeader({ hero }: Props) {
  const [showProfile, setShowProfile] = useState(false);

  const githubUsername = hero.github || "anuraghazra";
  const statsUrl = `${GITHUB_STATS_BASE}/api?username=${githubUsername}&show_icons=true&theme=transparent&hide_border=true&title_color=34d399&text_color=9ca3af&icon_color=34d399&bg_color=00000000&hide_title=true&hide_rank=true`;

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="flex md:hidden items-center justify-between px-4 py-3 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-white/10 overflow-hidden flex items-center justify-center">
            {hero.avatar ? (
              <img
                src={hero.avatar}
                alt={hero.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-white">
                {hero.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-white">
              {hero.name}
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Online
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowProfile(true)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="View Profile"
        >
          <Info size={18} />
        </button>
      </header>

      {/* Profile Modal/Drawer */}
      {showProfile && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowProfile(false)}
          />

          {/* Drawer - Glassmorphism Bottom Sheet */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl flex flex-col animate-slide-up">
            {/* Handle */}
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">Profile</h2>
              <button
                type="button"
                onClick={() => setShowProfile(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Close"
                aria-label="Close profile drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 pt-5 pb-10 space-y-6">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {hero.avatar ? (
                    <img
                      src={hero.avatar}
                      alt={hero.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-white">
                      {hero.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{hero.name}</h3>
                  <p className="text-xs text-emerald-400 uppercase tracking-wider font-mono mt-1">
                    {hero.role}
                  </p>
                </div>
              </div>

              {/* GitHub Stats */}
              <div className="w-full">
                <img
                  src={statsUrl}
                  alt="GitHub Stats"
                  className="w-full h-auto rounded-xl bg-white/5 border border-white/5 p-2"
                  loading="lazy"
                />
              </div>

              {/* Intro */}
              <p className="text-sm text-gray-400 leading-relaxed border-l-2 border-purple-500/50 pl-4">
                {hero.intro}
              </p>

              {/* Tech Stack - Flat list for mobile */}
              <div>
                <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">
                  Tech Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {hero.techStack &&
                    Object.values(hero.techStack)
                      .flat()
                      .map((tech) => {
                        const techKey = tech.toLowerCase();
                        const techInfo = techIconMap[techKey];

                        if (techInfo) {
                          const Icon = techInfo.icon;
                          return (
                            <div
                              key={tech}
                              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"
                              title={tech}
                            >
                              <Icon
                                size={16}
                                style={{ color: techInfo.color }}
                              />
                            </div>
                          );
                        }

                        return (
                          <div
                            key={tech}
                            className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-[10px] font-mono"
                          >
                            {tech}
                          </div>
                        );
                      })}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors"
                  title="Contact Me"
                >
                  <Mail size={16} /> Contact
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/10 text-white font-semibold text-sm border border-white/10 hover:bg-white/15 transition-colors"
                  title="Download Resume"
                >
                  <Download size={16} /> Resume
                </button>
              </div>

              {/* Socials */}
              <div className="flex justify-center gap-8 pt-2">
                <a
                  href="#"
                  className="text-gray-500 hover:text-white transition-colors"
                  title="GitHub"
                >
                  <Github size={22} />
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-white transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin size={22} />
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-white transition-colors"
                  title="Email"
                >
                  <Mail size={22} />
                </a>
              </div>

              {/* Safe Area Spacer for iOS */}
              <div className="h-6 w-full" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
