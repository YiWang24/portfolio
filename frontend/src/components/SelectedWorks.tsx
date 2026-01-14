"use client";

import { useState } from "react";

interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  tags: string[];
}

const projects: Project[] = [
  {
    id: "1",
    title: "AI Dashboard",
    description: "Real-time analytics dashboard with ML predictions",
    tags: ["React", "Python", "TensorFlow"],
  },
  {
    id: "2",
    title: "E-Commerce Platform",
    description: "Full-stack marketplace with payment integration",
    tags: ["Next.js", "Stripe", "PostgreSQL"],
  },
];

export default function SelectedWorks() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "docs">("dashboard");

  return (
    <div className="w-full py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Selected Works</h2>
          <a
            href="#"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            VIEW ALL →
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 text-sm font-mono rounded-lg transition-colors ${
              activeTab === "dashboard"
                ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                : "bg-white/5 text-text-muted border border-border-glass hover:border-cyan-400/30"
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("docs")}
            className={`px-4 py-2 text-sm font-mono rounded-lg transition-colors ${
              activeTab === "docs"
                ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                : "bg-white/5 text-text-muted border border-border-glass hover:border-cyan-400/30"
            }`}
          >
            Docs
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group p-4 bg-white/5 border border-border-glass rounded-lg hover:border-cyan-400/30 transition-all cursor-pointer"
            >
              {/* Project Image Placeholder */}
              <div className="w-full h-32 bg-linear-to-br from-neon-green/10 to-neon-purple/10 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-text-muted text-sm font-mono">
                  Preview
                </span>
              </div>

              {/* Project Info */}
              <h3 className="text-white font-semibold mb-2 group-hover:text-cyan-400 transition-colors">
                {project.title}
              </h3>
              <p className="text-text-muted text-sm mb-3">
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs font-mono bg-white/5 border border-border-glass rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
