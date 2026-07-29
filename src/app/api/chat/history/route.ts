import { NextRequest, NextResponse } from "next/server";
import { loadMessages } from "@/server/db/chat";
import { captureError } from "@/server/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId || !UUID_RE.test(sessionId)) {
    return NextResponse.json({ messages: [] });
  }
  try {
    const messages = await loadMessages(sessionId);
    return NextResponse.json({ messages });
  } catch (err) {
    captureError(err, { route: "/api/chat/history" });
    return NextResponse.json({ messages: [] });
  }
}
