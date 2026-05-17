import { NextResponse } from "next/server";
import { getGitHubStats } from "@/server/github";
import { captureError } from "@/server/observability";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET() {
  try {
    const stats = await getGitHubStats();
    return NextResponse.json(stats, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    captureError(err, { route: "/api/github/stats" });
    return NextResponse.json(
      { error: "Failed to fetch GitHub stats" },
      { status: 502 }
    );
  }
}
