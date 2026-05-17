import type { UIMessage } from "ai";
import type {
  FunctionStep,
  ItemStatus,
  MessageStatus,
  TerminalMessage,
  ThoughtLog,
} from "@/types/message";

type ToolPartLike = {
  type: string;
  state?: string;
  toolCallId?: string;
  errorText?: string;
};

function toolStatusFromState(state: string | undefined): ItemStatus {
  switch (state) {
    case "output-available":
      return "completed";
    case "output-error":
      return "failed";
    case "input-streaming":
    case "input-available":
    default:
      return "running";
  }
}

function toolNameFromPartType(type: string): string {
  if (type === "dynamic-tool") return "dynamic";
  return type.startsWith("tool-") ? type.slice("tool-".length) : type;
}

export function uiMessageToTerminal(
  message: UIMessage,
  status: MessageStatus
): TerminalMessage {
  let text = "";
  const steps: FunctionStep[] = [];
  const thoughts: ThoughtLog[] = [];

  for (const part of message.parts) {
    if (part.type === "text") {
      text += part.text;
    } else if (part.type === "reasoning") {
      const trimmed = part.text.trim();
      if (trimmed) {
        thoughts.push({
          id: `thought-${message.id}-${thoughts.length}`,
          message: trimmed,
          status: "completed",
        });
      }
    } else if (part.type === "step-start") {
      // ignore — multi-step boundary marker
    } else if (
      part.type === "dynamic-tool" ||
      part.type.startsWith("tool-")
    ) {
      const toolPart = part as ToolPartLike;
      const toolName = toolNameFromPartType(part.type);
      const toolCallId = toolPart.toolCallId ?? `${steps.length}`;
      const stepStatus = toolStatusFromState(toolPart.state);
      steps.push({
        id: `fn-${toolCallId}`,
        name: toolName,
        status: stepStatus,
      });
    }
  }

  return {
    id: message.id,
    role: "agent",
    content: text,
    status,
    ...(steps.length > 0 ? { functionSteps: steps } : {}),
    ...(thoughts.length > 0 ? { thoughts } : {}),
  };
}
