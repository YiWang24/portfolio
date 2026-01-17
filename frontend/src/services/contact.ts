/**
 * Contact Service
 * Sends contact form submissions through the internal API proxy
 * (which forwards to backend via Cloudflare Zero Trust)
 */

export type ContactPayload = {
  email: string;
  message: string;
};

/**
 * Send contact message through the proxy API route
 * The API route adds CF-Access headers server-side
 */
export async function sendContactMessage(payload: ContactPayload): Promise<void> {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `Contact request failed: ${response.status}`);
  }
}
