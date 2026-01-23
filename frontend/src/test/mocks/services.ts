/**
 * Mock Service Factory
 * Provides mocked versions of external services for testing
 */

import { vi } from "vitest";
import type { StreamHandlers, ToolExecution } from "@/types/stream";
import type { ContactPayload } from "@/services/contact";

/**
 * Mock SSE Service
 */
export const mockSseService = {
  streamChat: vi.fn<
    (message: string, sessionId: string, handlers: StreamHandlers) => Promise<void>
  >(),
  splitSsePayloads: vi.fn(),
  parseEventPayload: vi.fn(),
  isEventType: vi.fn(),
};

/**
 * Mock Contact Service
 */
export const mockContactService = {
  sendContactMessage: vi.fn<(payload: ContactPayload) => Promise<void>>(),
};

/**
 * Helper to create a stream of mock events
 */
export function createMockEventStream(events: any[]) {
  return async (
    _message: string,
    _sessionId: string,
    handlers: StreamHandlers
  ): Promise<void> => {
    for (const event of events) {
      switch (event.type) {
        case "session_start":
          await handlers.onSessionStart?.(event.session_id);
          break;
        case "thinking_start":
          await handlers.onThinkingStart?.();
          break;
        case "thinking_delta":
          await handlers.onThinkingDelta?.(event.content);
          break;
        case "thinking_end":
          await handlers.onThinkingEnd?.();
          break;
        case "tool_call_start":
          await handlers.onToolStart?.({
            toolId: event.tool_id,
            toolName: event.tool_name,
            arguments: event.arguments,
            status: "running",
            timestamp: Date.now(),
          } as ToolExecution);
          break;
        case "tool_call_end":
          await handlers.onToolEnd?.({
            toolId: event.tool_id,
            toolName: event.tool_name,
            result: event.result,
            status: event.success ? "completed" : "failed",
            timestamp: Date.now(),
          } as ToolExecution);
          break;
        case "response_start":
          await handlers.onResponseStart?.();
          break;
        case "response_delta":
          await handlers.onResponseDelta?.(event.content);
          break;
        case "response_end":
          await handlers.onResponseEnd?.();
          break;
        case "complete":
          await handlers.onComplete?.();
          return;
        case "error":
          await handlers.onError?.(event.message, event.code);
          // Don't throw, just call the error handler
          return;
      }
    }
  };
}

/**
 * Setup all service mocks
 */
export function setupServiceMocks() {
  vi.mock("@/services/sse", () => ({
    streamChat: mockSseService.streamChat,
    splitSsePayloads: mockSseService.splitSsePayloads,
    parseEventPayload: mockSseService.parseEventPayload,
    isEventType: mockSseService.isEventType,
  }));

  vi.mock("@/services/contact", () => ({
    sendContactMessage: mockContactService.sendContactMessage,
  }));

  return {
    sse: mockSseService,
    contact: mockContactService,
  };
}

/**
 * Reset all service mocks between tests
 */
export function resetServiceMocks() {
  mockSseService.streamChat.mockReset();
  mockSseService.splitSsePayloads.mockReset();
  mockSseService.parseEventPayload.mockReset();
  mockSseService.isEventType.mockReset();
  mockContactService.sendContactMessage.mockReset();
}
