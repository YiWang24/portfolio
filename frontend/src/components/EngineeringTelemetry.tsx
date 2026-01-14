"use client";

import { Github, Activity, GitPullRequest, Code2 } from "lucide-react";
import { useGitHubStats } from "@/hooks/useGitHubStats";

type LanguageBarProps = {
  label: string;
  percent: number;
  color: string;
};

function LanguageBar({ label, percent, color }: LanguageBarProps) {
  return (
    <div className="group/bar relative">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-200 group-hover/bar:text-white transition-colors">
          {label}
        </span>
        <span className="text-xs font-mono text-gray-500 group-hover/bar:text-emerald-400 transition-colors">
          {percent}%
        </span>
      </div>
      <div className="relative h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out relative"
          style={{
            width: `${percent}%`,
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}40`,
          }}
        >
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: `linear-gradient(90deg, transparent, ${color}80, transparent)`,
              animation: "shimmer 2s infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function EngineeringTelemetry() {
  const { data, loading, error } = useGitHubStats();

  return (
    <div className="relative overflow-hidden rounded-xl mb-10 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-black/40 to-black/40 backdrop-blur-sm group hover:border-emerald-500/40 transition-all duration-300">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Glowing corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />

      {/* GitHub icon with glow */}
      <div className="absolute top-6 right-6 opacity-[0.06] group-hover:opacity-[0.12] transition-all duration-300">
        <Github
          size={64}
          className="text-emerald-400"
          style={{ filter: "drop-shadow(0 0 20px rgba(16, 185, 129, 0.3))" }}
        />
      </div>

      <div className="relative z-10 p-8">
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-emerald-500/20">
          <Activity
            size={16}
            className="text-emerald-400"
            style={{ filter: "drop-shadow(0 0 4px rgba(16, 185, 129, 0.6))" }}
          />
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-[0.2em] font-semibold">
            Engineering Telemetry
          </span>
          <div className="ml-auto flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
              style={{ boxShadow: "0 0 8px rgba(16, 185, 129, 0.8)" }}
            />
            <span className="text-[10px] text-emerald-400/60 uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="relative inline-block">
              <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
              <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-emerald-500/10 animate-ping" />
            </div>
            <p className="text-gray-400 mt-6 text-sm font-mono">
              Fetching data from GitHub...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <span className="text-lg">⚠</span>
              <span>Failed to load GitHub stats. Using fallback data.</span>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* Core Stats Grid */}
            <div className="grid grid-cols-2 gap-6 mb-10">
              {/* Commits Card */}
              <div className="relative group/card overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 hover:border-emerald-500/30 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-2 right-2 opacity-20 group-hover/card:opacity-30 transition-opacity">
                  <GitPullRequest size={32} className="text-emerald-400" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-wider mb-3 font-mono">
                    <Code2 size={12} />
                    <span>Commits (YTD)</span>
                  </div>
                  <div
                    className="text-5xl font-bold text-white mb-1 tracking-tight"
                    style={{ textShadow: "0 0 20px rgba(255, 255, 255, 0.1)" }}
                  >
                    {data?.totalCommits ?? 136}
                  </div>
                  <div className="h-1 w-16 bg-gradient-to-r from-emerald-500 to-transparent rounded-full" />
                </div>
              </div>

              {/* PRs Card */}
              <div className="relative group/card overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 hover:border-blue-500/30 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-2 right-2 opacity-20 group-hover/card:opacity-30 transition-opacity">
                  <GitPullRequest size={32} className="text-blue-400" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-wider mb-3 font-mono">
                    <GitPullRequest size={12} />
                    <span>Pull Requests</span>
                  </div>
                  <div
                    className="text-5xl font-bold text-white mb-1 tracking-tight"
                    style={{ textShadow: "0 0 20px rgba(255, 255, 255, 0.1)" }}
                  >
                    {data?.totalPRs ?? 3}
                  </div>
                  <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-transparent rounded-full" />
                </div>
              </div>
            </div>

            {/* Language Distribution */}
            <div className="relative">
              <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-wider mb-5 font-mono">
                <Code2 size={12} />
                <span>Language Distribution</span>
              </div>
              <div className="space-y-4">
                {data?.languages && data.languages.length > 0 ? (
                  data.languages
                    .slice(0, 5)
                    .map((lang) => (
                      <LanguageBar
                        key={lang.name}
                        label={lang.name}
                        percent={lang.percent}
                        color={lang.color}
                      />
                    ))
                ) : (
                  <>
                    <LanguageBar
                      label="TypeScript"
                      percent={63}
                      color="#3178c6"
                    />
                    <LanguageBar label="Python" percent={12} color="#3572A5" />
                    <LanguageBar label="HTML" percent={8} color="#e34c26" />
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
