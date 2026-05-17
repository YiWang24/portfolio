import { NextRequest, NextResponse } from "next/server";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { chatModel } from "@/server/ai/provider";
import {
  contactSystem,
  createAgentState,
  makeTransferTools,
  routerSystem,
  techLeadSystem,
  type AgentName,
} from "@/server/ai/agents";
import { contactAgentTools, techLeadTools } from "@/server/ai/tools";
import { checkChatRateLimit } from "@/server/rate-limit";
import { captureError } from "@/server/observability";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_USER_MESSAGE_CHARS = 500;
const MAX_STEPS = 8;

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "anonymous";
  return req.headers.get("x-real-ip") || "anonymous";
}

function truncateLatestUserMessage(messages: UIMessage[]): UIMessage[] {
  if (messages.length === 0) return messages;
  const last = messages[messages.length - 1];
  if (last.role !== "user") return messages;

  let charsRemaining = MAX_USER_MESSAGE_CHARS;
  const parts = last.parts.map((part) => {
    if (part.type !== "text" || charsRemaining <= 0) return part;
    if (part.text.length <= charsRemaining) {
      charsRemaining -= part.text.length;
      return part;
    }
    const truncated = part.text.slice(0, charsRemaining);
    charsRemaining = 0;
    return { ...part, text: truncated };
  });

  return [...messages.slice(0, -1), { ...last, parts }];
}

const TRANSFER_TOOL_KEYS = ["transfer_to_tech_lead", "transfer_to_contact"] as const;
const TECH_LEAD_TOOL_KEYS = Object.keys(techLeadTools);
const CONTACT_TOOL_KEYS = Object.keys(contactAgentTools);

function systemFor(agent: AgentName): string {
  switch (agent) {
    case "tech_lead":
      return techLeadSystem;
    case "contact":
      return contactSystem;
    case "router":
    default:
      return routerSystem;
  }
}

function activeToolsFor(agent: AgentName): string[] {
  switch (agent) {
    case "tech_lead":
      return TECH_LEAD_TOOL_KEYS;
    case "contact":
      return CONTACT_TOOL_KEYS;
    case "router":
    default:
      return [...TRANSFER_TOOL_KEYS];
  }
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);

  const rate = await checkChatRateLimit(ip);
  if (!rate.success) {
    return NextResponse.json(
      {
        error: `Rate limit exceeded (${rate.scope})`,
        retryAfter: Math.max(0, Math.ceil((rate.reset - Date.now()) / 1000)),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, Math.ceil((rate.reset - Date.now()) / 1000))),
        },
      }
    );
  }

  let payload: { messages?: UIMessage[] };
  try {
    payload = (await request.json()) as { messages?: UIMessage[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload.messages || !Array.isArray(payload.messages) || payload.messages.length === 0) {
    return NextResponse.json({ error: "messages array is required" }, { status: 400 });
  }

  const truncatedMessages = truncateLatestUserMessage(payload.messages);
  const modelMessages = convertToModelMessages(truncatedMessages);

  const state = createAgentState();
  const transferTools = makeTransferTools(state);

  const tools = {
    ...transferTools,
    ...techLeadTools,
    ...contactAgentTools,
  };

  try {
    const result = streamText({
      model: chatModel(),
      messages: modelMessages,
      system: systemFor(state.current),
      tools,
      stopWhen: stepCountIs(MAX_STEPS),
      prepareStep: async () => ({
        system: systemFor(state.current),
        activeTools: activeToolsFor(state.current) as Array<keyof typeof tools>,
      }),
      onError: ({ error }) => {
        captureError(error, { route: "/api/chat", agent: state.current });
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    captureError(err, { route: "/api/chat" });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "chat failed" },
      { status: 500 }
    );
  }
}
