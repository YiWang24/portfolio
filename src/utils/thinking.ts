import type { TerminalMessage } from "@/types/message";

export function shouldShowThinking(message: TerminalMessage): boolean {
  return Boolean(
    (message.functionSteps && message.functionSteps.length > 0) ||
      (message.thoughts && message.thoughts.length > 0)
  );
}
