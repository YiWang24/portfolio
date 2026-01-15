import removeMarkdown from "remove-markdown";
import type { TerminalMessage } from "@/types/message";

export function extractThinkingPreview(raw: string): string {
  if (!raw) return "";
  const normalized = raw.replace(/\r\n/g, "\n");
  const stripped = removeMarkdown(normalized, { stripListLeaders: true, useImgAltText: false });
  const firstLine = stripped
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  return firstLine ?? "";
}

export function finalizeThinkingMessage(message: TerminalMessage): TerminalMessage {
  if (message.status !== "thinking") return message;

  const functionSteps = message.functionSteps?.map((step) =>
    step.status === "running" ? { ...step, status: "completed" as const } : step
  );
  const thoughts = message.thoughts?.map((thought) =>
    thought.status === "running" ? { ...thought, status: "completed" as const } : thought
  );

  return {
    ...message,
    status: "streaming",
    functionSteps,
    thoughts,
  };
}

export function shouldShowThinking(message: TerminalMessage): boolean {
  return Boolean(
    (message.functionSteps && message.functionSteps.length > 0) ||
      (message.thoughts && message.thoughts.length > 0)
  );
}
