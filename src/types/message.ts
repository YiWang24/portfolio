/**
 * Terminal message types used by the chat UI.
 * Drives ThinkingChain, function-step display, and message rendering.
 */

export type MessageStatus = "thinking" | "streaming" | "completed" | "error";

export type ItemStatus = "running" | "completed" | "failed";

export type FunctionStep = {
  id: string;
  name: string;
  status: ItemStatus;
};

export type ThoughtLog = {
  id: string;
  message: string;
  status: ItemStatus;
};

export type TerminalMessage = {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  status: MessageStatus;
  functionSteps?: FunctionStep[];
  thoughts?: ThoughtLog[];
};
