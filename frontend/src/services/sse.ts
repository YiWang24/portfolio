/**
 * Enhanced SSE Service
 * Handles streaming chat with thinking phases and tool execution display
 *
 * Now connects through internal proxy API which adds Cloudflare headers server-side
 */

import type {
  StreamEvent,
  StreamHandlers,
  ToolExecution,
} from "@/types/stream";

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
 * Custom EventSource implementation using fetch + ReadableStream
 * This allows us to go through our proxy API which adds CF-Access headers
 */
class ProxyEventSource {
  private url: string;
  private controller: AbortController | null = null;
  private eventHandlers: Map<string, Set<(event: MessageEvent) => void>> = new Map();
  private onErrorHandler: ((event: Event) => void) | null = null;
  private onOpenHandler: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  addEventListener(
    event: string,
    handler: (event: MessageEvent) => void
  ) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  removeEventListener(
    event: string,
    handler: (event: MessageEvent) => void
  ) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  set onopen(handler: ((event: Event) => void) | null) {
    this.onOpenHandler = handler;
  }

  set onerror(handler: ((event: Event) => void) | null) {
    this.onErrorHandler = handler;
  }

  async connect() {
    this.controller = new AbortController();
    const signal = this.controller.signal;

    try {
      const response = await fetch(this.url, { signal });

      if (!response.ok) {
        this.onErrorHandler?.(new Event("error"));
        return;
      }

      this.onOpenHandler?.(new Event("open"));

      const reader = response.body?.getReader();
      if (!reader) {
        this.onErrorHandler?.(new Event("error"));
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (!signal.aborted) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        let currentEvent = "message";
        let currentData = "";

        for (const line of lines) {
          if (line.trim() === "") {
            // Empty line = dispatch event
            if (currentData) {
              const handlers = this.eventHandlers.get(currentEvent);
              if (handlers) {
                const evt = new MessageEvent(currentEvent, { data: currentData });
                handlers.forEach((h) => h(evt));
              }
            }
            currentEvent = "message";
            currentData = "";
          } else if (line.startsWith("event:")) {
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            currentData = line.slice(5).trim();
          }
        }

        // Dispatch any remaining data
        if (currentData && buffer === "") {
          const handlers = this.eventHandlers.get(currentEvent);
          if (handlers) {
            const evt = new MessageEvent(currentEvent, { data: currentData });
            handlers.forEach((h) => h(evt));
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        this.onErrorHandler?.(new Event("error"));
      }
    } finally {
      this.controller = null;
    }
  }

  close() {
    this.controller?.abort();
    this.eventHandlers.clear();
  }
}

/**
 * Enhanced streaming chat function
 * Connects to /api/chat/stream endpoint (which proxies to backend with CF headers)
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
    const params = new URLSearchParams();
    if (sessionId) params.set("sessionId", sessionId);
    params.set("message", message);

    const url = `/api/chat/stream?${params.toString()}`;
    const source = new ProxyEventSource(url);

    let closed = false;
    let firstDataReceived = false;

    const close = () => {
      if (closed) return;
      closed = true;
      source.close();
      resolve();
    };

    // Set error handler
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

    // Set up event handlers
    source.addEventListener("session_start", (evt) => {
      firstDataReceived = true;
      try {
        const data = JSON.parse(evt.data) as {
          session_id?: string;
        };
        if (data.session_id) {
          handlers.onSessionStart?.(data.session_id);
        }
      } catch (e) {
        console.error("Failed to parse session_start event", e);
      }
    });

    source.addEventListener("thinking_start", () => {
      firstDataReceived = true;
      handlers.onThinkingStart?.();
    });

    source.addEventListener("thinking_delta", (evt) => {
      firstDataReceived = true;
      try {
        const data = JSON.parse(evt.data) as {
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

    source.addEventListener("tool_call_start", (evt) => {
      firstDataReceived = true;
      try {
        const data = JSON.parse(evt.data) as {
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
        const data = JSON.parse(evt.data) as {
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

    source.addEventListener("response_start", () => {
      firstDataReceived = true;
      handlers.onResponseStart?.();
    });

    source.addEventListener("response_delta", (evt) => {
      firstDataReceived = true;
      try {
        const data = JSON.parse(evt.data) as {
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

    source.addEventListener("complete", () => {
      firstDataReceived = true;
      handlers.onComplete?.();
      close();
    });

    source.addEventListener("error", (evt) => {
      try {
        const data = JSON.parse(evt.data) as {
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

    // Start connection
    source.connect().catch((error) => {
      handlers.onError?.(
        error instanceof Error ? error.message : "Unknown error",
        "INIT_ERROR"
      );
      reject(error);
    });
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
