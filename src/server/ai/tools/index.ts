import { githubTools } from "@/server/ai/tools/github";
import { ragTools } from "@/server/ai/tools/rag";
import { contactTools } from "@/server/ai/tools/contact";
import { utilityTools } from "@/server/ai/tools/utility";

export const techLeadTools = {
  ...githubTools,
  ...ragTools,
  ...utilityTools,
};

export const contactAgentTools = {
  ...contactTools,
};

export { githubTools, ragTools, contactTools, utilityTools };
