import { tool, type UIMessage } from "ai";
import { z } from "zod";
import { submitContact } from "@/server/contact";
import { captureError } from "@/server/observability";

const ANONYMOUS = "anonymous@visitor.com";

export const APPROVAL = {
  YES: "approve",
  NO: "deny",
} as const;

/**
 * Human-in-the-loop tool: no execute() — the tool call streams to the client,
 * which renders a confirmation UI. The visitor's decision comes back as the
 * tool output, and processContactApprovals() performs the real side effect
 * server-side on the follow-up request.
 */
export const sendContactMessageTool = tool({
  description:
    "Send a contact message from a visitor to Yi Wang via email. Use this when the user wants to reach out, " +
    "leave a message, or contact Yi Wang. The visitor will be asked to confirm before anything is sent.",
  inputSchema: z.object({
    replyTo: z
      .string()
      .optional()
      .describe("The visitor's email address for Yi Wang to reply to, if provided."),
    message: z.string().min(1).describe("The message content the visitor wants to send"),
  }),
});

type ContactToolPart = {
  type: "tool-sendContactMessage";
  toolCallId: string;
  state: string;
  input?: { replyTo?: string; message?: string };
  output?: unknown;
};

function isContactPart(part: { type: string }): part is ContactToolPart {
  return part.type === "tool-sendContactMessage";
}

async function executeSend(input: { replyTo?: string; message?: string }): Promise<string> {
  const email = input.replyTo && input.replyTo.trim().length > 0 ? input.replyTo.trim() : ANONYMOUS;
  try {
    await submitContact({
      email: email === ANONYMOUS ? null : email,
      message: input.message ?? "",
      ip: null,
      userAgent: "agent:contact_tool",
    });
    if (email === ANONYMOUS) {
      return "Message sent successfully! However, Yi Wang won't be able to reply since no email was provided.";
    }
    return `Message sent successfully! Yi Wang will get back to you soon at ${email}`;
  } catch (err) {
    captureError(err, { tool: "sendContactMessage", replyTo: email });
    return "Sorry, the message couldn't be sent right now. Please try again later or use the contact form.";
  }
}

/**
 * Scan messages for confirmed sendContactMessage calls and execute them,
 * replacing the visitor's approve/deny decision with the real result so the
 * model can report the outcome.
 */
export async function processContactApprovals(messages: UIMessage[]): Promise<UIMessage[]> {
  const processed: UIMessage[] = [];
  for (const message of messages) {
    if (message.role !== "assistant") {
      processed.push(message);
      continue;
    }
    const parts = await Promise.all(
      message.parts.map(async (part) => {
        if (!isContactPart(part) || part.state !== "output-available") return part;
        if (part.output === APPROVAL.YES) {
          const result = await executeSend(part.input ?? { message: "" });
          return { ...part, output: result };
        }
        if (part.output === APPROVAL.NO) {
          return { ...part, output: "The visitor declined to send the message. Do not send it." };
        }
        return part;
      })
    );
    processed.push({ ...message, parts } as UIMessage);
  }
  return processed;
}

export const contactTools = {
  sendContactMessage: sendContactMessageTool,
};
