/**
 * API Route: Chat Stream Proxy
 * Forwards SSE chat requests to backend through Cloudflare Zero Trust
 *
 * Note: Since EventSource doesn't support custom headers, this endpoint
 * accepts the request and adds CF-Access headers server-side.
 */

import { NextRequest } from "next/server";

const CF_ACCESS_CLIENT_ID = process.env.CF_CLIENT_ID;
const CF_ACCESS_CLIENT_SECRET = process.env.CF_CLIENT_SECRET;
// Prefer NEXT_PUBLIC_API_BASE_URL from Doppler, fallback to BACKEND_URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || process.env.BACKEND_URL || "http://localhost:8080";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId") || "";
  const message = searchParams.get("message") || "";

  if (!message) {
    return new Response("Missing message parameter", { status: 400 });
  }

  // Build backend URL with query params
  const params = new URLSearchParams();
  if (sessionId) params.set("sessionId", sessionId);
  params.set("message", message);

  const backendUrl = `${BACKEND_URL}/api/v1/chat/stream?${params.toString()}`;

  try {
    // Create fetch request with Cloudflare headers
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        ...(CF_ACCESS_CLIENT_ID && {
          "CF-Access-Client-Id": CF_ACCESS_CLIENT_ID,
        }),
        ...(CF_ACCESS_CLIENT_SECRET && {
          "CF-Access-Client-Secret": CF_ACCESS_CLIENT_SECRET,
        }),
      },
    });

    if (!response.ok) {
      return new Response(`Backend error: ${response.status}`, {
        status: response.status,
      });
    }

    // Check if response is SSE
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("text/event-stream")) {
      return new Response("Invalid response type from backend", {
        status: 500,
      });
    }

    // Create a readable stream to forward SSE events
    const readableStream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } catch (error) {
          console.error("Stream proxy error:", error);
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
      cancel() {
        response.body?.cancel();
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat stream proxy error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
