import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGitHubStats } from "@/hooks/useGitHubStats";

// Mock fetch
global.fetch = vi.fn();

describe("useGitHubStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch and return GitHub stats successfully", async () => {
    const mockData = {
      totalCommits: 150,
      totalPRs: 5,
      languages: [
        { name: "TypeScript", percent: 70, color: "#3178c6" },
        { name: "Python", percent: 20, color: "#3572A5" },
      ],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useGitHubStats());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it("should handle fetch errors gracefully", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toContain("Failed to fetch GitHub stats");
  });

  it("should handle network errors", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe("Network error");
  });
});
