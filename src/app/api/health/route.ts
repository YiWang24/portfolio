import { NextResponse } from "next/server";
import { withClient } from "@/server/db/client";
import { captureError } from "@/server/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  let dbStatus: "ok" | "error" = "ok";
  let dbError: string | undefined;

  try {
    await withClient((client) => client.query("SELECT 1"));
  } catch (err) {
    dbStatus = "error";
    dbError = err instanceof Error ? err.message : "unknown db error";
    captureError(err, { route: "/api/health" });
  }

  const status = dbStatus === "ok" ? 200 : 503;
  return NextResponse.json(
    {
      status: dbStatus === "ok" ? "ok" : "degraded",
      db: dbStatus,
      ...(dbError ? { dbError } : {}),
      uptimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
