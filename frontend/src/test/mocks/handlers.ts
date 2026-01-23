/**
 * Mock API Handlers for Vitest
 * Provides mock responses for SSE streaming and contact API
 */

import type { StreamHandlers, ToolExecution } from "@/types/stream";

/**
 * Mock SSE streaming data for testing
 */
export const MOCK_STREAM_EVENTS = {
  SESSION_START: {
    type: "session_start" as const,
    session_id: "test-session-123",
  },
  THINKING_START: {
    type: "thinking_start" as const,
  },
  THINKING_DELTA: {
    type: "thinking_delta" as const,
    content: "Analyzing your request...",
  },
  THINKING_END: {
    type: "thinking_end" as const,
  },
  TOOL_CALL_START: {
    type: "tool_call_start" as const,
    tool_id: "tool-1",
    tool_name: "search",
    arguments: '{"query": "test"}',
  },
  TOOL_CALL_END: {
    type: "tool_call_end" as const,
    tool_id: "tool-1",
    tool_name: "search",
    result: "Search completed",
    success: true,
  },
  RESPONSE_START: {
    type: "response_start" as const,
  },
  RESPONSE_DELTA: {
    type: "response_delta" as const,
    content: "Hello! This is a mock response.",
  },
  RESPONSE_END: {
    type: "response_end" as const,
  },
  COMPLETE: {
    type: "complete" as const,
  },
  ERROR: {
    type: "error" as const,
    message: "Test error message",
    code: "TEST_ERROR",
  },
};

/**
 * Mock contact API responses
 */
export const MOCK_CONTACT_RESPONSES = {
  SUCCESS: {
    ok: true,
    status: 200,
    json: async () => ({ message: "Message sent successfully" }),
  } as Response,
  ERROR: {
    ok: false,
    status: 400,
    json: async () => ({ error: "Invalid email address" }),
  } as Response,
  SERVER_ERROR: {
    ok: false,
    status: 500,
    json: async () => ({ error: "Internal server error" }),
  } as Response,
};

/**
 * Create a mock streamChat function
 * Simulates streaming responses with configurable events
 */
export function createMockStreamChat(events: any[] = []) {
  return {
    streamChat: vi.fn().mockImplementation(
      (_message: string, _sessionId: string, handlers: StreamHandlers) => {
        // Simulate async streaming
        return new Promise<void>((resolve, reject) => {
          let index = 0;

          const processNext = () => {
            if (index >= events.length) {
              handlers.onComplete?.();
              resolve();
              return;
            }

            const event = events[index++];

            switch (event.type) {
              case "session_start":
                handlers.onSessionStart?.(event.session_id);
                break;
              case "thinking_start":
                handlers.onThinkingStart?.();
                break;
              case "thinking_delta":
                handlers.onThinkingDelta?.(event.content);
                break;
              case "thinking_end":
                handlers.onThinkingEnd?.();
                break;
              case "tool_call_start":
                handlers.onToolStart?.({
                  toolId: event.tool_id,
                  toolName: event.tool_name,
                  arguments: event.arguments,
                  status: "running",
                  timestamp: Date.now(),
                } as ToolExecution);
                break;
              case "tool_call_end":
                handlers.onToolEnd?.({
                  toolId: event.tool_id,
                  toolName: event.tool_name,
                  result: event.result,
                  status: event.success ? "completed" : "failed",
                  timestamp: Date.now(),
                } as ToolExecution);
                break;
              case "response_start":
                handlers.onResponseStart?.();
                break;
              case "response_delta":
                handlers.onResponseDelta?.(event.content);
                break;
              case "response_end":
                handlers.onResponseEnd?.();
                break;
              case "complete":
                handlers.onComplete?.();
                resolve();
                return;
              case "error":
                handlers.onError?.(event.message, event.code);
                reject(new Error(event.message));
                return;
            }

            // Process next event with small delay
            setTimeout(processNext, 10);
          };

          processNext();
        });
      }
    ),
  };
}

/**
 * Mock fetch for contact API
 */
export function createMockFetch(response: Response) {
  return vi.fn().mockResolvedValue(response);
}

/**
 * Mock streaming events for a successful chat flow
 */
export const MOCK_SUCCESS_CHAT_FLOW = [
  MOCK_STREAM_EVENTS.SESSION_START,
  MOCK_STREAM_EVENTS.THINKING_START,
  MOCK_STREAM_EVENTS.THINKING_DELTA,
  MOCK_STREAM_EVENTS.THINKING_END,
  MOCK_STREAM_EVENTS.RESPONSE_START,
  MOCK_STREAM_EVENTS.RESPONSE_DELTA,
  MOCK_STREAM_EVENTS.RESPONSE_END,
  MOCK_STREAM_EVENTS.COMPLETE,
];

/**
 * Mock streaming events for a chat with tool calls
 */
export const MOCK_TOOL_CALL_FLOW = [
  MOCK_STREAM_EVENTS.SESSION_START,
  MOCK_STREAM_EVENTS.THINKING_START,
  MOCK_STREAM_EVENTS.TOOL_CALL_START,
  MOCK_STREAM_EVENTS.TOOL_CALL_END,
  MOCK_STREAM_EVENTS.THINKING_END,
  MOCK_STREAM_EVENTS.RESPONSE_START,
  MOCK_STREAM_EVENTS.RESPONSE_DELTA,
  MOCK_STREAM_EVENTS.RESPONSE_END,
  MOCK_STREAM_EVENTS.COMPLETE,
];

/**
 * Mock streaming events for a failed chat
 */
export const MOCK_ERROR_FLOW = [
  MOCK_STREAM_EVENTS.SESSION_START,
  MOCK_STREAM_EVENTS.ERROR,
];
