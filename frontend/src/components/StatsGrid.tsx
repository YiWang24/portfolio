"use client";

import type { BioData } from "../types";

interface StatsGridProps {
  stats: BioData["stats"];
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const statItems = [
    { label: "Stars", value: stats.stars, color: "green" as const },
    { label: "Commits", value: stats.commits, color: "purple" as const },
    { label: "Years", value: stats.yearsExp, color: "green" as const },
    { label: "Projects", value: stats.projects, color: "purple" as const },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {statItems.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "green" | "purple";
}) {
  const borderColor =
    color === "green" ? "border-l-neon-green" : "border-l-neon-purple";

  return (
    <div className={`bg-white/2 p-3 rounded-lg border-l-2 ${borderColor}`}>
      <div className="text-[10px] uppercase text-text-muted mb-1">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
}
