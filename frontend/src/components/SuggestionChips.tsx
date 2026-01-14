"use client";

import type { SuggestionChip } from "../types";

interface SuggestionChipsProps {
  chips: SuggestionChip[];
  onChipClick: (command: string) => void;
  disabled?: boolean;
}

const defaultChips: SuggestionChip[] = [
  {
    icon: "⚡️",
    label: "Analyze Resume",
    command: "Tell me about your experience and skills",
  },
  {
    icon: "💻",
    label: "Check Code",
    command: "Show me your GitHub stats and projects",
  },
  { icon: "📧", label: "Contact Me", command: "How can I contact you?" },
];

export default function SuggestionChips({
  chips = defaultChips,
  onChipClick,
  disabled = false,
}: SuggestionChipsProps) {
  return (
    <div className="flex gap-2 px-4 py-3 border-b border-border-glass">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={() => onChipClick(chip.command)}
          disabled={disabled}
          className="px-3 py-1.5 text-xs font-mono rounded-full border border-border-glass bg-white/2 text-text-muted hover:border-neon-green/50 hover:text-neon-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {chip.icon} {chip.label}
        </button>
      ))}
    </div>
  );
}

export { defaultChips };
