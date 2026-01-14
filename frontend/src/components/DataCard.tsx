"use client";

interface DataCardProps {
  label: string;
  value: string | number;
  variant?: "default" | "primary";
}

export default function DataCard({
  label,
  value,
  variant = "default",
}: DataCardProps) {
  return (
    <div className="inline-block min-w-[140px] p-4 bg-white/5 border border-border-glass rounded-lg">
      <div className="text-[10px] font-mono text-text-muted uppercase mb-2">
        {label}
      </div>
      <div
        className={`text-2xl font-bold ${
          variant === "primary" ? "text-neon-green" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
