/**
 * unified message stream state definition
 * front-end and back-end shared unified state specification
 */

/**
 * message lifecycle state
 */
export type MessageStatus =
  | "thinking"      // thinking (tool calls, chain of thought, etc.)
  | "streaming"     // streaming
  | "completed"     // completed
  | "error";        // error

/**
 * SSE stream event type (backend sends)
 */
export type StreamEventType =
  | "token"              // token
  | "delta"              // delta
  | "function_call"      // function call event (for chain of thought)
  | "thought"            // thought
  | "status"             // status
  | "thinking_complete"  // thinking complete
  | "complete"           // complete
  | "error";             // error

/**
 * sub-item status (for function_call and thought)
 */
export type ItemStatus =
  | "running"     // running
  | "completed"   // completed
  | "failed";     // failed

/**
 * function call step
 */
export type FunctionStep = {
  id: string;
  name: string;
  status: ItemStatus;
};

/**
 * thought log
 */
export type ThoughtLog = {
  id: string;
  message: string;
  status: ItemStatus;
};

/**
 * terminal message
 */
export type TerminalMessage = {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  status: MessageStatus;
  functionSteps?: FunctionStep[];
  thoughts?: ThoughtLog[];
};

/**
 * SSE event structure
 */
export type StreamEvent =
  | { type: "token"; content: string }
  | { type: "delta"; content: string }
  | { type: "function_call"; name: string; status: ItemStatus }
  | { type: "thought"; message: string; status?: ItemStatus }
  | { type: "status"; phase: "start" | "thinking" | "thinking_complete" }
  | { type: "thinking_complete" }
  | { type: "complete" }
  | { type: "error"; message: string };

/**
 * stream processing callback
 */
export type StreamHandlers = {
  onToken: (token: string) => void;
  onFunctionCall?: (fn: { name: string; status: ItemStatus }) => void;
  onThought?: (thought: { message: string; status?: ItemStatus }) => void;
  onStatus?: (status: { phase: "start" | "thinking" | "thinking_complete" }) => void;
  onThinkingComplete?: () => void;
  onComplete: () => void;
  onError: (message: string) => void;
};
