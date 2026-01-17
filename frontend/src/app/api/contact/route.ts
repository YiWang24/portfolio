/**
 * API Route: Contact Form Proxy
 * Forwards contact form submissions to backend through Cloudflare Zero Trust
 */

import { NextRequest, NextResponse } from "next/server";

const CF_ACCESS_CLIENT_ID = process.env.CF_CLIENT_ID;
const CF_ACCESS_CLIENT_SECRET = process.env.CF_CLIENT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward request to backend with Cloudflare headers
    const response = await fetch(`${BACKEND_URL}/api/v1/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(CF_ACCESS_CLIENT_ID && {
          "CF-Access-Client-Id": CF_ACCESS_CLIENT_ID,
        }),
        ...(CF_ACCESS_CLIENT_SECRET && {
          "CF-Access-Client-Secret": CF_ACCESS_CLIENT_SECRET,
        }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend request failed: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Contact proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
