"use client";

import { Github, Linkedin, Mail, Download } from "lucide-react";
import {
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiSpring,
  SiDocker,
  SiKubernetes,
  SiPostgresql,
  SiPython,
  SiCplusplus,
  SiGit,
  SiLinux,
  SiNginx,
  SiRedis,
} from "react-icons/si";
import { FaJava, FaAws } from "react-icons/fa";
import type { IconType } from "react-icons";
import EngineeringTelemetry from "./EngineeringTelemetry";

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
  isThinking?: boolean;
};

// Compact icon map
const techIconMap: Record<string, { icon: IconType; color: string }> = {
  java: { icon: FaJava, color: "#ED8B00" },
  typescript: { icon: SiTypescript, color: "#3178C6" },
  python: { icon: SiPython, color: "#3776AB" },
  c: { icon: SiCplusplus, color: "#A8B9CC" },
  react: { icon: SiReact, color: "#61DAFB" },
  "next.js": { icon: SiNextdotjs, color: "#ffffff" },
  spring: { icon: SiSpring, color: "#6DB33F" },
  "node.js": { icon: SiNodedotjs, color: "#339933" },
  aws: { icon: FaAws, color: "#FF9900" },
  docker: { icon: SiDocker, color: "#2496ED" },
  kubernetes: { icon: SiKubernetes, color: "#326CE5" },
  postgresql: { icon: SiPostgresql, color: "#4169E1" },
  git: { icon: SiGit, color: "#F05032" },
  linux: { icon: SiLinux, color: "#FCC624" },
  nginx: { icon: SiNginx, color: "#009639" },
  redis: { icon: SiRedis, color: "#DC382D" },
};

const categoryLabels: Record<keyof TechStack, string> = {
  languages: "Core",
  frameworks: "Frameworks",
  cloud: "Infra",
  tools: "Tools",
};

// TechRow component
function TechRow({ category, items }: { category: string; items: string[] }) {
  return (
    <div className="bg-white/5 rounded-lg p-6 border border-white/5">
      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
        {category}
      </div>
      <div className="flex flex-wrap gap-3">
        {items.map((tech) => {
          const techKey = tech.toLowerCase();
          const techInfo = techIconMap[techKey];

          if (techInfo) {
            const Icon = techInfo.icon;
            return (
              <div
                key={tech}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-sm text-gray-200 font-medium hover:bg-white/10 hover:border-white/20 hover:text-white transition-all cursor-default"
                title={tech}
              >
                <Icon size={18} style={{ color: techInfo.color }} />
                <span>{tech}</span>
              </div>
            );
          }

          return (
            <div
              key={tech}
              className="px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-sm text-gray-200 font-medium hover:bg-white/10 hover:border-white/20 hover:text-white transition-all cursor-default"
            >
              {tech}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProfilePanel({ hero, isThinking = false }: Props) {
  return (
    <div className="profile-panel">
      {/* 1. Identity & Status */}
      <div className="profile-header mb-8">
        <div
          className={`profile-avatar-wrapper ${isThinking ? "thinking" : ""}`}
        >
          <div className="profile-avatar-glow" />
          <div className="profile-avatar">
            {hero.avatar ? (
              <img src={hero.avatar} alt={hero.name} />
            ) : (
              <span className="profile-avatar-fallback">
                {hero.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            )}
          </div>
        </div>
        <div className="profile-status">
          <span className="status-dot" />
          <span>Open to Work</span>
        </div>
      </div>

      {/* 2. Name, Role & Intro */}
      <div className="mb-12">
        <h1 className="profile-name mb-5">{hero.name}</h1>
        <div className="flex items-center gap-2 mb-6">
          <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            {hero.role}
          </span>
        </div>
        <p className="text-base text-gray-300 leading-relaxed">
          {hero.intro} Powered by an AI agent — ask it anything.
        </p>
      </div>

      {/* 3. Engineering Telemetry */}
      <EngineeringTelemetry />

      {/* 4. Technical Arsenal */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8 hover:border-white/20 transition-all">
        <div className="text-xs font-mono text-purple-400 mb-8 uppercase tracking-widest border-b border-white/5 pb-4">
          Technical Arsenal
        </div>

        <div className="space-y-6">
          {hero.techStack &&
            (Object.keys(categoryLabels) as Array<keyof TechStack>).map(
              (category) => {
                const items = hero.techStack?.[category];
                if (!items || items.length === 0) return null;
                return (
                  <TechRow
                    key={category}
                    category={categoryLabels[category]}
                    items={items}
                  />
                );
              }
            )}
        </div>
      </div>

      {/* 5. Actions */}
      <div className="profile-actions mb-8">
        <button type="button" className="btn-primary">
          <Mail size={18} /> Contact Me
        </button>
        <button type="button" className="btn-ghost">
          <Download size={18} /> Resume
        </button>
      </div>
      <div className="profile-socials">
        <a href="#" aria-label="GitHub">
          <Github size={20} />
        </a>
        <a href="#" aria-label="LinkedIn">
          <Linkedin size={20} />
        </a>
        <a href="#" aria-label="Email">
          <Mail size={20} />
        </a>
      </div>
    </div>
  );
}
