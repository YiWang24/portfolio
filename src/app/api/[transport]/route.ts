import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
  PROFILE_SECTIONS,
  sectionData,
} from "@/server/ai/tools/profile-facts";
import { hybridSearch } from "@/server/db/vector";
import { getServerEnv } from "@/server/env";

export const runtime = "nodejs";
export const maxDuration = 60;

function textResult(payload: unknown) {
  return {
    content: [
      { type: "text" as const, text: JSON.stringify(payload, null, 2) },
    ],
  };
}

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "get_profile",
      "Get exact, structured facts from Yi Wang's profile: dates, titles, companies, grades, certifications, project lists, tech stacks. Deterministic — sourced directly from profile data.",
      {
        section: z
          .enum(PROFILE_SECTIONS)
          .describe(
            "Profile section: about | education | experience | projects | skills | certifications | coursework"
          ),
      },
      async ({ section }) =>
        textResult({ section, source: "profile.json", data: sectionData(section) })
    );

    server.tool(
      "search_profile",
      "Hybrid semantic + keyword search (RRF fusion) over Yi Wang's long-form profile narratives. Use for open-ended questions; results include citation ids.",
      {
        question: z.string().min(1).describe("Natural-language question or keywords"),
        category: z
          .enum(["personal", "projects", "all"])
          .default("all")
          .describe("Restrict search: personal | projects | all"),
      },
      async ({ question, category }) => {
        const prefix =
          category === "personal"
            ? "personal/"
            : category === "projects"
              ? "projects/"
              : "";
        try {
          const results = await hybridSearch(prefix, question, 5);
          return textResult({
            query: question,
            retrieval: "hybrid (vector + full-text, RRF fusion)",
            results: results.map((row) => ({
              citation: `[${row.path}#${row.chunkIndex}]`,
              content: row.content,
              score: row.score,
              matchedBy: row.matchedBy,
            })),
          });
        } catch (err) {
          return textResult({
            error: err instanceof Error ? err.message : "search failed",
            results: [],
          });
        }
      }
    );

    server.tool(
      "get_contact_card",
      "Get Yi Wang's public contact information: email, LinkedIn, GitHub, and scheduling link.",
      {},
      async () => {
        const env = getServerEnv();
        return textResult({
          email: env.CONTACT_EMAIL,
          linkedin: env.LINKEDIN_URL ?? "",
          github: `https://github.com/${env.GITHUB_USERNAME}`,
          calendly: env.CALENDLY_URL ?? "",
        });
      }
    );
  },
  {
    serverInfo: {
      name: "yi-wang-portfolio",
      version: "1.0.0",
    },
  },
  {
    basePath: "/api",
    maxDuration: 60,
    verboseLogs: false,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
