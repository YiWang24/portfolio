import { describe, expect, it } from "vitest";
import {
  extractThinkingPreview,
  finalizeThinkingMessage,
  shouldShowThinking,
} from "@/utils/thinking";
import type { TerminalMessage } from "@/types/message";

describe("extractThinkingPreview", () => {
  it("strips markdown and returns the first non-empty line", () => {
    const input = "# Title\n\n**Bold line**\n- item";
    expect(extractThinkingPreview(input)).toBe("Title");
  });

  it("handles CRLF and leading blanks", () => {
    const input = "\r\n\r\n**Hello**\r\nSecond";
    expect(extractThinkingPreview(input)).toBe("Hello");
  });

  it("returns empty string when nothing remains", () => {
    const input = "\n- \n- \n";
    expect(extractThinkingPreview(input)).toBe("");
  });
});

describe("finalizeThinkingMessage", () => {
  it("preserves steps/thoughts and moves status to streaming", () => {
    const message: TerminalMessage = {
      id: "m1",
      role: "agent",
      content: "",
      status: "thinking",
      functionSteps: [{ id: "fn-0", name: "tool", status: "running" }],
      thoughts: [{ id: "t-0", message: "thinking", status: "running" }],
    };

    const updated = finalizeThinkingMessage(message);

    expect(updated.status).toBe("streaming");
    expect(updated.functionSteps?.[0].status).toBe("completed");
    expect(updated.thoughts?.[0].status).toBe("completed");
  });

  it("returns the original message when status is not thinking", () => {
    const message: TerminalMessage = {
      id: "m2",
      role: "agent",
      content: "",
      status: "streaming",
    };

    expect(finalizeThinkingMessage(message)).toEqual(message);
  });
});

describe("shouldShowThinking", () => {
  it("returns true when functionSteps exist", () => {
    const message: TerminalMessage = {
      id: "m3",
      role: "agent",
      content: "",
      status: "streaming",
      functionSteps: [{ id: "fn-0", name: "tool", status: "completed" }],
    };

    expect(shouldShowThinking(message)).toBe(true);
  });

  it("returns true when thoughts exist", () => {
    const message: TerminalMessage = {
      id: "m4",
      role: "agent",
      content: "",
      status: "completed",
      thoughts: [{ id: "t-0", message: "x", status: "completed" }],
    };

    expect(shouldShowThinking(message)).toBe(true);
  });

  it("returns false when no thinking data exists", () => {
    const message: TerminalMessage = {
      id: "m5",
      role: "agent",
      content: "",
      status: "completed",
    };

    expect(shouldShowThinking(message)).toBe(false);
  });
});
