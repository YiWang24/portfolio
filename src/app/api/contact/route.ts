import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitContact } from "@/server/contact";
import { captureError } from "@/server/observability";

export const runtime = "nodejs";

const payloadSchema = z.object({
  email: z.string().email().max(255).optional().nullable(),
  message: z.string().min(1).max(2000),
});

function clientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await submitContact({
      email: parsed.data.email ?? null,
      message: parsed.data.message,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (err) {
    captureError(err, { route: "/api/contact" });
    return NextResponse.json(
      { error: "Failed to submit contact message" },
      { status: 500 }
    );
  }
}
