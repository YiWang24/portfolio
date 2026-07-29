import { tool } from "ai";
import { z } from "zod";
import { hybridSearch, type HybridSearchResult } from "@/server/db/vector";

function formatResults(results: HybridSearchResult[], query: string, category: string) {
  return {
    results: results.map((row) => ({
      citation: `[${row.path}#${row.chunkIndex}]`,
      source: row.path,
      content: row.content,
      score: Math.round(row.score * 10000) / 10000,
      matchedBy: row.matchedBy,
    })),
    query,
    category,
    total_found: results.length,
    retrieval: "hybrid (vector + full-text, RRF fusion)",
  };
}

function errorResponse(query: string, message: string) {
  return { error: message, query, results: [], total_found: 0 };
}

export const searchProfileTool = tool({
  description:
    "Hybrid semantic + keyword search over Yi Wang's long-form profile content (experience narratives, " +
    "project descriptions). Use for open-ended questions; for exact facts (dates, lists, grades) prefer getProfileFacts. " +
    "Each result carries a citation id — cite it when you use the content.",
  inputSchema: z.object({
    question: z.string().min(1).describe("Natural-language question or keywords to search for"),
    category: z
      .enum(["personal", "projects", "all"])
      .default("all")
      .describe("Restrict search: personal (experience/skills/education) | projects | all"),
  }),
  execute: async ({ question, category }) => {
    const prefix = category === "personal" ? "personal/" : category === "projects" ? "projects/" : "";
    try {
      const results = await hybridSearch(prefix, question, 5);
      return formatResults(results, question, category);
    } catch (err) {
      return errorResponse(question, err instanceof Error ? err.message : "rag error");
    }
  },
});

export const ragTools = {
  searchProfile: searchProfileTool,
};
