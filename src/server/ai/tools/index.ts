import { githubTools } from "@/server/ai/tools/github";
import { ragTools } from "@/server/ai/tools/rag";
import { contactTools } from "@/server/ai/tools/contact";
import { utilityTools } from "@/server/ai/tools/utility";
import { profileFactsTools } from "@/server/ai/tools/profile-facts";

export const techLeadTools = {
  ...githubTools,
  ...ragTools,
  ...profileFactsTools,
  ...utilityTools,
};

export const contactAgentTools = {
  ...contactTools,
};

export { githubTools, ragTools, contactTools, utilityTools, profileFactsTools };
