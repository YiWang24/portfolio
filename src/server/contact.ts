import { Resend } from "resend";
import { withClient } from "@/server/db/client";
import { getServerEnv } from "@/server/env";

let cachedResend: Resend | undefined;

function resend(): Resend {
  if (cachedResend) return cachedResend;
  cachedResend = new Resend(getServerEnv().RESEND_API_KEY);
  return cachedResend;
}

export type ContactSubmission = {
  email: string | null;
  message: string;
  ip: string | null;
  userAgent: string | null;
};

export type ContactResult = {
  persisted: boolean;
  emailed: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function submitContact(input: ContactSubmission): Promise<ContactResult> {
  const env = getServerEnv();

  await withClient((client) =>
    client.query(
      `INSERT INTO contact_messages (email, message, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [input.email, input.message, input.ip, input.userAgent]
    )
  );

  const subject = input.email
    ? `Portfolio contact from ${input.email}`
    : "Portfolio contact (no email provided)";

  const html = `
    <h2>New message from portfolio</h2>
    ${input.email ? `<p><strong>Reply to:</strong> ${escapeHtml(input.email)}</p>` : ""}
    <p><strong>Message:</strong></p>
    <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(input.message)}</pre>
    ${input.ip ? `<p style="color:#888;font-size:12px">IP: ${escapeHtml(input.ip)}</p>` : ""}
  `;

  const result = await resend().emails.send({
    from: env.RESEND_FROM,
    to: env.CONTACT_EMAIL,
    replyTo: input.email ?? undefined,
    subject,
    html,
  });

  return { persisted: true, emailed: !result.error };
}
