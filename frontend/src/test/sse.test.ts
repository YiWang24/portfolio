import { describe, expect, it } from "vitest";
import { parseStreamEvent, splitSsePayloads } from "../services/sse";

describe("parseStreamEvent", () => {
  it("parses token payloads", () => {
    const event = parseStreamEvent('{"type":"token","content":"hello"}');
    expect(event).toEqual({ type: "token", content: "hello" });
  });

  it("parses error payloads", () => {
    const event = parseStreamEvent('{"type":"error","message":"bad"}');
    expect(event).toEqual({ type: "error", message: "bad" });
  });

  it("parses complete payloads", () => {
    const event = parseStreamEvent('{"type":"complete"}');
    expect(event).toEqual({ type: "complete" });
  });

  it("parses thinking completion payloads", () => {
    const event = parseStreamEvent('{"type":"thinking_complete"}');
    expect(event).toEqual({ type: "thinking_complete" });
  });

  it("passes through raw text", () => {
    const event = parseStreamEvent("plain text");
    expect(event).toEqual({ type: "token", content: "plain text" });
  });
});

describe("splitSsePayloads", () => {
  it("extracts payloads separated by newlines", () => {
    const input =
      'data: {"type":"token","content":"Hi"}\n\n' +
      'data: {"type":"complete"}\n\n';
    const result = splitSsePayloads(input);
    expect(result.payloads).toEqual([
      '{"type":"token","content":"Hi"}',
      '{"type":"complete"}',
    ]);
    expect(result.rest).toBe("");
  });

  it("extracts payloads when data blocks are adjacent", () => {
    const input =
      'data:{"type":"thinking_complete"}data:{"type":"token","content":"Hi"}data:{"type":"complete"}';
    const result = splitSsePayloads(input);
    expect(result.payloads).toEqual([
      '{"type":"thinking_complete"}',
      '{"type":"token","content":"Hi"}',
      '{"type":"complete"}',
    ]);
    expect(result.rest).toBe("");
  });

  it("keeps incomplete tail in rest", () => {
    const input = 'data:{"type":"token","content":"Hi"';
    const result = splitSsePayloads(input);
    expect(result.payloads).toEqual([]);
    expect(result.rest).toBe(input);
  });
});
