import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getServerEnv } from "@/server/env";
import { syncProfile } from "@/server/rag/sync";
import type { ProfileJson } from "@/server/rag/chunk";
import { captureError } from "@/server/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function loadProfile(): Promise<ProfileJson> {
  const path = join(process.cwd(), "src/data/profile.json");
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as ProfileJson;
}

function isAuthorized(request: NextRequest): boolean {
  const env = getServerEnv();
  const header = request.headers.get("x-sync-key") ?? request.headers.get("X-Sync-Key");
  return Boolean(header) && header === env.RAG_SYNC_KEY;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await loadProfile();
    const result = await syncProfile(profile);
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (err) {
    captureError(err, { route: "/api/rag/sync" });
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
