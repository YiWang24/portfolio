/**
 * ProjectsSection Component
 * Editorial grid layout for project showcase
 * Borderless design with hover arrow indicators
 */

"use client";

import { ProjectItem } from "@/types/portfolio";
import { StaggeredList, StaggeredItem } from "./ScrollReveal";
import { ExternalLink, Github, ArrowUpRight } from "lucide-react";

interface ProjectsSectionProps {
  projects: ProjectItem[];
}

/**
 * MetricsDisplay - Shows project metrics (stars, users, etc.)
 */
interface MetricsDisplayProps {
  metrics?: ProjectItem["metrics"];
}

function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  if (!metrics) return null;

  return (
    <div className="flex flex-wrap gap-4 text-sm text-white/60">
      {metrics.stars && (
        <span className="flex items-center gap-1">
          <span>⭐</span>
          <span>{metrics.stars} stars</span>
        </span>
      )}
      {metrics.users && (
        <span className="flex items-center gap-1">
          <span>👥</span>
          <span>{metrics.users} users</span>
        </span>
      )}
    </div>
  );
}

/**
 * TechStack - Displays technology pills
 */
interface TechStackProps {
  tech: string[];
}

function TechStack({ tech }: TechStackProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tech.map((techItem, index) => (
        <span
          key={index}
          className="px-2 py-1 bg-white/5 text-white/50 text-xs font-mono rounded"
        >
          {techItem}
        </span>
      ))}
    </div>
  );
}

/**
 * ProjectLinks - Displays demo and code links
 */
interface ProjectLinksProps {
  links?: ProjectItem["links"];
}

function ProjectLinks({ links }: ProjectLinksProps) {
  if (!links) return null;

  return (
    <div className="flex gap-4">
      {links.demo && (
        <a
          href={links.demo}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ExternalLink size={14} />
          <span>Demo</span>
        </a>
      )}
      {links.repo && (
        <a
          href={links.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <Github size={14} />
          <span>Code</span>
        </a>
      )}
    </div>
  );
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <StaggeredList>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {projects.map((project, index) => (
          <StaggeredItem key={index}>
            <motion.div
              className="group flex flex-col gap-4 py-6 transition-all duration-200"
            >
              {/* Left Column: Title + Metrics + Arrow */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">
                    {project.title}
                  </h3>
                  <ArrowUpRight className="w-5 h-5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                <MetricsDisplay metrics={project.metrics} />
              </div>

              {/* Right Column: Summary + Tech + Links */}
              <div className="space-y-4">
                {/* Summary */}
                <p className="text-sm text-white/60 leading-relaxed">
                  {project.summary}
                </p>

                {/* Tech Stack */}
                <TechStack tech={project.tech} />

                {/* Links */}
                <ProjectLinks links={project.links} />
              </div>
            </motion.div>
          </StaggeredItem>
        ))}
      </div>
    </StaggeredList>
  );
}

const motion = require("framer-motion").motion;
