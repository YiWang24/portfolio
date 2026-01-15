/**
 * Enhanced SSE Service
 * Handles streaming chat with thinking phases and tool execution display
 */

import type {
  StreamEvent,
  StreamHandlers,
  ToolExecution,
} from "@/types/stream";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Parse SSE buffer into individual JSON payloads
 */
export function splitSsePayloads(buffer: string): { payloads: string[]; rest: string } {
  const payloads: string[] = [];
  const normalized = buffer.replace(/\r\n/g, "\n");
  let cursor = 0;

  while (true) {
    const dataIndex = normalized.indexOf("data:", cursor);
    if (dataIndex === -1) break;

    let start = dataIndex + 5;
    if (normalized[start] === " ") start += 1;

    const nextData = normalized.indexOf("data:", start);
    const separator = normalized.indexOf("\n\n", start);
    let end = -1;

    if (separator !== -1 && (nextData === -1 || separator < nextData)) {
      end = separator;
      const payload = normalized.slice(start, end).trim();
      if (payload) payloads.push(payload);
      cursor = end + 2;
      continue;
    }

    if (nextData !== -1) {
      end = nextData;
      const payload = normalized.slice(start, end).trim();
      if (payload) payloads.push(payload);
      cursor = end;
      continue;
    }

    const candidate = normalized.slice(start).trim();
    try {
      if (candidate) {
        JSON.parse(candidate);
        payloads.push(candidate);
        cursor = normalized.length;
      }
    } catch {
      // Incomplete payload, keep in rest
    }
    break;
  }

  return { payloads, rest: normalized.slice(cursor) };
}

/**
 * Enhanced streaming chat function
 * Connects to /api/v1/chat/stream endpoint
 *
 * @param message - User message
 * @param sessionId - Session ID (optional, will be generated if not provided)
 * @param handlers - Event handlers for different stream events
 */
export async function streamChat(
  message: string,
  sessionId: string,
  handlers: StreamHandlers
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const params = new URLSearchParams();
      if (sessionId) params.set("sessionId", sessionId);
      params.set("message", message);

      const url = `${baseUrl}/api/v1/chat/stream?${params.toString()}`;
      const source = new EventSource(url);

      let closed = false;
      let firstDataReceived = false;

      const close = () => {
        if (closed) return;
        closed = true;
        source.close();
        resolve();
      };

      // Connection error handler
      source.onerror = (evt) => {
        if (!firstDataReceived) {
          handlers.onError?.(
            "Connection failed. The server may be unavailable or rate limited.",
            "CONNECTION_ERROR"
          );
          close();
          reject(new Error("EventSource connection failed"));
        }
      };

      // Session start event
      source.addEventListener("session_start", (evt) => {
        firstDataReceived = true;
        try {
          const data = JSON.parse((evt as MessageEvent).data) as {
            session_id?: string;
          };
          if (data.session_id) {
            handlers.onSessionStart?.(data.session_id);
          }
        } catch (e) {
          console.error("Failed to parse session_start event", e);
        }
      });

      // Thinking phase events
      source.addEventListener("thinking_start", () => {
        firstDataReceived = true;
        handlers.onThinkingStart?.();
      });

      source.addEventListener("thinking_delta", (evt) => {
        firstDataReceived = true;
        try {
          const data = JSON.parse((evt as MessageEvent).data) as {
            content?: string;
          };
          if (data.content) {
            handlers.onThinkingDelta?.(data.content);
          }
        } catch (e) {
          console.error("Failed to parse thinking_delta event", e);
        }
      });

      source.addEventListener("thinking_end", () => {
        firstDataReceived = true;
        handlers.onThinkingEnd?.();
      });

      // Tool call events
      source.addEventListener("tool_call_start", (evt) => {
        firstDataReceived = true;
        try {
          const data = JSON.parse((evt as MessageEvent).data) as {
            tool_id?: string;
            tool_name?: string;
            arguments?: string;
          };

          if (data.tool_id && data.tool_name) {
            const tool: ToolExecution = {
              toolId: data.tool_id,
              toolName: data.tool_name,
              arguments: data.arguments || "{}",
              status: "running",
              timestamp: Date.now(),
            };
            handlers.onToolStart?.(tool);
          }
        } catch (e) {
          console.error("Failed to parse tool_call_start event", e);
        }
      });

      source.addEventListener("tool_call_end", (evt) => {
        firstDataReceived = true;
        try {
          const data = JSON.parse((evt as MessageEvent).data) as {
            tool_id?: string;
            tool_name?: string;
            result?: string;
            success?: boolean;
          };

          if (data.tool_id && data.tool_name) {
            const tool: ToolExecution = {
              toolId: data.tool_id,
              toolName: data.tool_name,
              arguments: "{}",
              result: data.result || "",
              status: data.success ? "completed" : "failed",
              timestamp: Date.now(),
            };
            handlers.onToolEnd?.(tool);
          }
        } catch (e) {
          console.error("Failed to parse tool_call_end event", e);
        }
      });

      // Response phase events
      source.addEventListener("response_start", () => {
        firstDataReceived = true;
        handlers.onResponseStart?.();
      });

      source.addEventListener("response_delta", (evt) => {
        firstDataReceived = true;
        try {
          const data = JSON.parse((evt as MessageEvent).data) as {
            content?: string;
          };
          if (data.content) {
            handlers.onResponseDelta?.(data.content);
          }
        } catch (e) {
          console.error("Failed to parse response_delta event", e);
        }
      });

      source.addEventListener("response_end", () => {
        firstDataReceived = true;
        handlers.onResponseEnd?.();
      });

      // Complete event
      source.addEventListener("complete", () => {
        firstDataReceived = true;
        handlers.onComplete?.();
        close();
      });

      // Error event
      source.addEventListener("error", (evt) => {
        if ("data" in evt) {
          try {
            const data = JSON.parse((evt as MessageEvent).data) as {
              message?: string;
              code?: string;
            };
            if (data.message) {
              handlers.onError?.(data.message, data.code);
              close();
              return;
            }
          } catch (e) {
            console.error("Failed to parse error event", e);
          }
        }
        handlers.onError?.("Stream error", "UNKNOWN_ERROR");
        close();
      });

      // Set timeout for connection (30 seconds)
      const timeout = setTimeout(() => {
        if (!firstDataReceived) {
          handlers.onError?.("Connection timeout", "TIMEOUT");
          close();
          reject(new Error("EventSource connection timeout"));
        }
      }, 30000);

      // Clear timeout when data is received
      const originalOnThinkingStart = handlers.onThinkingStart;
      handlers.onThinkingStart = () => {
        clearTimeout(timeout);
        originalOnThinkingStart?.();
      };
    } catch (error) {
      handlers.onError?.(
        error instanceof Error ? error.message : "Unknown error",
        "INIT_ERROR"
      );
      reject(error);
    }
  });
}

/**
 * Parse SSE payload into StreamEvent
 */
export function parseEventPayload(payload: string): StreamEvent | null {
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
