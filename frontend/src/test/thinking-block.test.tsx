import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ThinkingBlock from "../components/ThinkingBlock";

const thoughts = [
  { id: "t1", message: "Analyzing intent...", status: "running" as const },
  { id: "t2", message: "Calling GitHub tool...", status: "done" as const },
];

describe("ThinkingBlock", () => {
  it("shows logs while thinking", () => {
    render(<ThinkingBlock thoughts={thoughts} status="thinking" />);
    expect(screen.getByText("Analyzing intent...")).toBeInTheDocument();
  });

  it("collapses on streaming and reopens on click", async () => {
    const { rerender } = render(
      <ThinkingBlock thoughts={thoughts} status="thinking" />
    );

    rerender(<ThinkingBlock thoughts={thoughts} status="streaming" />);

    await waitFor(() => {
      expect(screen.queryByText("Analyzing intent...")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Analyzing intent...")).toBeInTheDocument();
  });
});
