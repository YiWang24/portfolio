"use client";

interface TerminalMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function TerminalMessage({
  role,
  content,
}: TerminalMessageProps) {
  if (role === "user") {
    return (
      <div className="mb-4">
        <div className="flex items-start gap-2">
          <span className="text-cyan-400 font-mono text-sm">&gt; user:</span>
          <span className="text-white font-mono text-sm">{content}</span>
        </div>
      </div>
    );
  }

  if (role === "assistant") {
    return (
      <div className="mb-4">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-neon-green font-mono text-sm">
            &gt; ai_agent:
          </span>
          <span className="text-text-muted font-mono text-sm">{content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <span className="text-yellow-500 font-mono text-sm">{content}</span>
    </div>
  );
}
