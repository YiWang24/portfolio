import type {
  StreamEvent,
  StreamHandlers,
  ItemStatus,
} from "@/types/message";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

export function splitSsePayloads(buffer: string) {
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
      // Incomplete payload, keep in rest.
    }
    break;
  }

  return { payloads, rest: normalized.slice(cursor) };
}

// 检查是否是内部调试信息
function isInternalDebugInfo(content: string): boolean {
  const debugPatterns = [
    /^Function Call:/i,
    /^Function Response:/i,
    /^FunctionCall\{/i,
    /^FunctionResponse\{/i,
    /^Call:/i,
    /id=Optional\[/i,
    /args=Optional\[/i,
    /name=Optional\[/i,
    /response=Optional\[/i,
    /partialArgs=Optional/i,
    /willContinue=Optional/i,
    /scheduling=Optional/i,
  ];

  return debugPatterns.some((pattern) => pattern.test(content));
}

export function parseStreamEvent(payload: string): StreamEvent | { type: "skip" } {
  try {
    const parsed = JSON.parse(payload) as {
      type?: string;
      content?: string;
      message?: string;
      name?: string;
      status?: string;
      phase?: string;
      step?: string;
    };

    // Handle function_call type (tool calls)
    if (parsed.type === "function_call" && typeof parsed.name === "string") {
      return {
        type: "function_call",
        name: parsed.name,
        status: (parsed.status as ItemStatus) || "running",
      };
    }

    // Handle thought type
    if (parsed.type === "thought" && typeof parsed.message === "string") {
      return {
        type: "thought",
        message: parsed.message,
        status: (parsed.status as ItemStatus) || "completed",
      };
    }

    // Handle token type
    if (parsed.type === "token" && typeof parsed.content === "string") {
      if (isInternalDebugInfo(parsed.content)) {
        return { type: "skip" };
      }
      return { type: "token", content: parsed.content };
    }

    // Handle delta type
    if (parsed.type === "delta" && typeof parsed.content === "string") {
      if (isInternalDebugInfo(parsed.content)) {
        return { type: "skip" };
      }
      return { type: "delta", content: parsed.content };
    }

    // Handle status type
    if (parsed.type === "status" && typeof parsed.phase === "string") {
      const phase = parsed.phase as "start" | "thinking" | "thinking_complete";
      return { type: "status", phase };
    }

    // Handle error type
    if (parsed.type === "error" && typeof parsed.message === "string") {
      return { type: "error", message: parsed.message };
    }

    // Handle complete type
    if (parsed.type === "complete") {
      return { type: "complete" };
    }

    // Handle thinking_complete type
    if (parsed.type === "thinking_complete") {
      return { type: "thinking_complete" };
    }

    // If it has content field but no type, treat as token
    if (typeof parsed.content === "string") {
      if (isInternalDebugInfo(parsed.content)) {
        return { type: "skip" };
      }
      return { type: "token", content: parsed.content };
    }
  } catch {
    // 不是 JSON，检查是否是调试信息
    if (isInternalDebugInfo(payload)) {
      return { type: "skip" };
    }
  }

  // 如果是纯文本且不是调试信息，作为 token 返回
  if (!isInternalDebugInfo(payload)) {
    return { type: "token", content: payload };
  }

  return { type: "skip" };
}

export async function streamChat(
  message: string,
  sessionId: string,
  handlers: StreamHandlers
) {
  try {
    const params = new URLSearchParams();
    if (sessionId) params.set("sessionId", sessionId);
    params.set("message", message);
    const url = `${baseUrl}/api/v1/chat/stream?${params.toString()}`;

    await new Promise<void>((resolve) => {
      const source = new EventSource(url);
      let closed = false;

      const close = () => {
        if (closed) return;
        closed = true;
        source.close();
        resolve();
      };

      const handleJson = <T,>(data: string): T | null => {
        try {
          return JSON.parse(data) as T;
        } catch {
          return null;
        }
      };

      source.addEventListener("status", (evt) => {
        const payload = handleJson<{ phase?: string }>((evt as MessageEvent).data);
        if (!payload?.phase) return;
        const phase = payload.phase as "start" | "thinking" | "thinking_complete";
        handlers.onStatus?.({ phase });
        if (phase === "thinking_complete") {
          handlers.onThinkingComplete?.();
        }
      });

      source.addEventListener("delta", (evt) => {
        const payload = handleJson<{ content?: string }>((evt as MessageEvent).data);
        if (payload?.content && !isInternalDebugInfo(payload.content)) {
          handlers.onToken(payload.content);
        }
      });

      source.addEventListener("function_call", (evt) => {
        const payload = handleJson<{ name?: string; status?: ItemStatus }>(
          (evt as MessageEvent).data
        );
        if (payload?.name) {
          handlers.onFunctionCall?.({
            name: payload.name,
            status: payload.status || "running",
          });
        }
      });

      source.addEventListener("complete", () => {
        handlers.onComplete();
        close();
      });

      source.addEventListener("error", (evt) => {
        if ("data" in evt) {
          const payload = handleJson<{ message?: string }>(
            (evt as MessageEvent).data
          );
          if (payload?.message) {
            handlers.onError(payload.message);
            close();
            return;
          }
        }
        handlers.onError("Stream error");
        close();
      });
    });
  } catch (error) {
    handlers.onError(error instanceof Error ? error.message : "Stream error");
  }
}
