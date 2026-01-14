"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, Loader2, Sparkles } from "lucide-react";
import type { ThoughtLog, MessageStatus } from "@/types/message";

type ThinkingBlockProps = {
  thoughts: ThoughtLog[];
  status: MessageStatus;
};

export default function ThinkingBlock({
  thoughts,
  status,
}: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (status === "streaming") {
      setIsExpanded(false);
    }
  }, [status]);

  if (!thoughts || thoughts.length === 0) return null;

  const summaryText =
    status === "thinking"
      ? "Analyzing..."
      : status === "error"
        ? `Error after ${thoughts.length} steps`
        : `${thoughts.length} steps completed`;

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className={`flex items-center gap-2 text-xs font-mono transition-colors ${
          isExpanded ? "text-gray-400" : "text-gray-600 hover:text-gray-400"
        }`}
      >
        {status === "thinking" ? (
          <span className="animate-spin">⟳</span>
        ) : (
          <Sparkles className="h-3 w-3 text-emerald-500" />
        )}
        <span>{summaryText}</span>
        {isExpanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 pl-3 border-l-2 border-emerald-500/30">
              {thoughts.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-2 text-[11px] font-mono text-gray-500 leading-relaxed"
                >
                  {log.status === "running" ? (
                    <Loader2 className="mt-0.5 h-3 w-3 animate-spin text-purple-400" />
                  ) : (
                    <span className="mt-1.5 text-gray-700">&gt;</span>
                  )}
                  <span className={log.status === "running" ? "text-gray-300" : ""}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
