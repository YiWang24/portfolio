import { describe, expect, it, vi } from "vitest";
import { createInitialThoughts, createMessageId } from "../utils/terminal";

describe("createMessageId", () => {
  it("creates unique ids when called quickly", () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1234567890);

    const first = createMessageId("stream");
    const second = createMessageId("stream");

    expect(first).not.toBe(second);
    expect(first.startsWith("stream-")).toBe(true);

    nowSpy.mockRestore();
  });
});

describe("createInitialThoughts", () => {
  it("returns a running last step", () => {
    const thoughts = createInitialThoughts();
    expect(thoughts).toHaveLength(3);
    expect(thoughts[thoughts.length - 1].status).toBe("running");
  });
});
