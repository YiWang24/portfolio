export type ContactPayload = {
  email: string;
  message: string;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function sendContactMessage(payload: ContactPayload): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/v1/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Contact request failed: ${response.status}`);
  }
}
