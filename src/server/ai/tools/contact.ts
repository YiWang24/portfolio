import { tool } from "ai";
import { z } from "zod";
import { submitContact } from "@/server/contact";
import { captureError } from "@/server/observability";

const ANONYMOUS = "anonymous@visitor.com";

export const sendContactMessageTool = tool({
  description:
    "Send a contact message from a visitor to Yi Wang via email. Use this when the user wants to reach out, leave a message, or contact Yi Wang.",
  inputSchema: z.object({
    replyTo: z
      .string()
      .optional()
      .describe(
        "The visitor's email address for Yi Wang to reply to. Use 'anonymous@visitor.com' if not provided."
      ),
    message: z
      .string()
      .min(1)
      .describe("The message content the visitor wants to send"),
  }),
  execute: async ({ replyTo, message }) => {
    const email = replyTo && replyTo.trim().length > 0 ? replyTo.trim() : ANONYMOUS;
    try {
      await submitContact({
        email: email === ANONYMOUS ? null : email,
        message,
        ip: null,
        userAgent: "agent:contact_tool",
      });
      if (email === ANONYMOUS) {
        return "Message sent successfully! However, Yi Wang won't be able to reply since no email was provided. If you'd like a response, please share your email.";
      }
      return `Message sent successfully! Yi Wang will get back to you soon at ${email}`;
    } catch (err) {
      captureError(err, { tool: "sendContactMessage", replyTo: email });
      return "Sorry, I couldn't send the message right now. Please try again later or reach out directly via the contact information on the website.";
    }
  },
});

export const contactTools = {
  sendContactMessage: sendContactMessageTool,
};
