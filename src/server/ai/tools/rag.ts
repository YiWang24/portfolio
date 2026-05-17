import { tool } from "ai";
import { z } from "zod";
import { cosineSearch, type VectorSearchResult } from "@/server/db/vector";

function formatResults(results: VectorSearchResult[], query: string, category: string) {
  return {
    results: results.map((row) => ({
      source: row.path,
      file: row.path.includes("/") ? row.path.slice(row.path.lastIndexOf("/") + 1) : row.path,
      content: row.content,
      similarity: Math.round(row.similarity * 1000) / 1000,
    })),
    query,
    category,
    total_found: results.length,
  };
}

function errorResponse(query: string, message: string) {
  return { error: message, query, results: [], total_found: 0 };
}

export const queryPersonalInfoTool = tool({
  description:
    "Search personal information including resume, experience, skills, education, and contact details",
  inputSchema: z.object({
    question: z
      .string()
      .min(1)
      .describe("Question about experience, skills, education, or contact info"),
  }),
  execute: async ({ question }) => {
    try {
      const results = await cosineSearch("personal/", question, 5);
      return formatResults(results, question, "personal");
    } catch (err) {
      return errorResponse(question, err instanceof Error ? err.message : "rag error");
    }
  },
});

export const queryProjectsTool = tool({
  description: "Search project descriptions and technical details",
  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .describe("Project name or technology to search for"),
  }),
  execute: async ({ query }) => {
    try {
      const results = await cosineSearch("projects/", query, 5);
      return formatResults(results, query, "projects");
    } catch (err) {
      return errorResponse(query, err instanceof Error ? err.message : "rag error");
    }
  },
});

export const ragTools = {
  queryPersonalInfo: queryPersonalInfoTool,
  queryProjects: queryProjectsTool,
};
