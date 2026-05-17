import { tool } from "ai";
import { z } from "zod";
import { getServerEnv } from "@/server/env";

export const getContactCardTool = tool({
  description: "Get contact information card with email, LinkedIn, and scheduling link",
  inputSchema: z.object({}),
  execute: async () => {
    const env = getServerEnv();
    return {
      email: env.CONTACT_EMAIL,
      linkedin: env.LINKEDIN_URL ?? "",
      github: `https://github.com/${env.GITHUB_USERNAME}`,
      calendly: env.CALENDLY_URL ?? "",
    };
  },
});

export const utilityTools = {
  getContactCard: getContactCardTool,
};
