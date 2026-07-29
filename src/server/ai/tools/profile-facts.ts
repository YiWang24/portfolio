import { tool } from "ai";
import { z } from "zod";
import profileData from "@/data/profile.json";

const SECTIONS = [
  "about",
  "education",
  "experience",
  "projects",
  "skills",
  "certifications",
  "coursework",
] as const;

export const PROFILE_SECTIONS = SECTIONS;

export type Section = (typeof SECTIONS)[number];

export function sectionData(section: Section): unknown {
  switch (section) {
    case "skills":
      return profileData.modules;
    default:
      return profileData[section];
  }
}

export const getProfileFactsTool = tool({
  description:
    "Retrieve exact, authoritative facts from Yi Wang's structured profile (single source of truth). " +
    "Use this for ANY factual data: dates, titles, companies, grades, certification names, project lists, tech stacks. " +
    "This is deterministic — numbers and dates come straight from the data, never from semantic search.",
  inputSchema: z.object({
    section: z
      .enum(SECTIONS)
      .describe(
        "Profile section: about | education | experience | projects | skills | certifications | coursework"
      ),
  }),
  execute: async ({ section }) => ({
    section,
    source: "profile.json",
    data: sectionData(section),
  }),
});

export const profileFactsTools = {
  getProfileFacts: getProfileFactsTool,
};
