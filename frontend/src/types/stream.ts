/**
 * Enhanced Streaming Event Types
 * Matches backend ChatController event protocol
 * Similar to OpenAI o1/Gemini streaming behavior
 */

/**
 * Base stream event with type discriminator
 */
export type BaseStreamEvent = {
  type: string;
};

/**
 * Session established event
 */
export type SessionStartEvent = BaseStreamEvent & {
  type: "session_start";
  session_id: string;
};

/**
 * Thinking phase events
 */
export type ThinkingStartEvent = BaseStreamEvent & {
  type: "thinking_start";
};

export type ThinkingDeltaEvent = BaseStreamEvent & {
  type: "thinking_delta";
  content: string;
};

export type ThinkingEndEvent = BaseStreamEvent & {
  type: "thinking_end";
};

/**
 * Tool call events
 */
export type ToolCallStartEvent = BaseStreamEvent & {
  type: "tool_call_start";
  tool_id: string;
  tool_name: string;
  arguments: string;
};

export type ToolCallEndEvent = BaseStreamEvent & {
  type: "tool_call_end";
  tool_id: string;
  tool_name: string;
  result: string;
  success: boolean;
};

/**
 * Response phase events
 */
export type ResponseStartEvent = BaseStreamEvent & {
  type: "response_start";
};

export type ResponseDeltaEvent = BaseStreamEvent & {
  type: "response_delta";
  content: string;
};

export type ResponseEndEvent = BaseStreamEvent & {
  type: "response_end";
};

/**
 * Error event
 */
export type ErrorEvent = BaseStreamEvent & {
  type: "error";
  message: string;
  code: string;
};

/**
 * Complete event
 */
export type CompleteEvent = BaseStreamEvent & {
  type: "complete";
};

/**
 * Union of all stream events
 */
export type StreamEvent =
  | SessionStartEvent
  | ThinkingStartEvent
  | ThinkingDeltaEvent
  | ThinkingEndEvent
  | ToolCallStartEvent
  | ToolCallEndEvent
  | ResponseStartEvent
  | ResponseDeltaEvent
  | ResponseEndEvent
  | ErrorEvent
  | CompleteEvent;

/**
 * Tool execution state
 */
export type ToolExecution = {
  toolId: string;
  toolName: string;
  arguments: string;
  result?: string;
  status: "running" | "completed" | "failed";
  timestamp: number;
};

/**
 * Chat message state
 */
export type ChatPhase = "thinking" | "tool_executing" | "responding" | "completed" | "error";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: string; // Accumulated thinking content
  tools?: ToolExecution[]; // Tool executions in order
  phase: ChatPhase;
  timestamp: number;
};

/**
 * Stream handlers for protocol
 */
export type StreamHandlers = {
  /** Session started */
  onSessionStart?: (sessionId: string) => void;
  /** Thinking phase started */
  onThinkingStart?: () => void;
  /** Thinking content delta */
  onThinkingDelta?: (content: string) => void;
  /** Thinking phase ended */
  onThinkingEnd?: () => void;
  /** Tool call started */
  onToolStart?: (tool: ToolExecution) => void;
  /** Tool call completed */
  onToolEnd?: (tool: ToolExecution) => void;
  /** Response phase started */
  onResponseStart?: () => void;
  /** Response content delta */
  onResponseDelta?: (content: string) => void;
  /** Response phase ended */
  onResponseEnd?: () => void;
  /** Stream completed */
  onComplete?: () => void;
  /** Error occurred */
  onError?: (message: string, code?: string) => void;
};

/**
 * Parse SSE payload into StreamEvent
 */
export function parseStreamEvent(payload: string): StreamEvent | null {
  try {
    const parsed = JSON.parse(payload) as StreamEvent;

    // Validate type field
    if (!parsed || typeof parsed.type !== "string") {
      return null;
    }

    return parsed;
  } catch (e) {
    console.error("Failed to parse stream event:", payload, e);
    return null;
  }
}

/**
 * Type guard for checking event type
 */
export function isEventType<T extends StreamEvent["type"]>(
  event: StreamEvent,
  type: T
): event is Extract<StreamEvent, { type: T }> {
  return event.type === type;
}
