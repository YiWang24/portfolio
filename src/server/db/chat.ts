import type { UIMessage } from "ai";
import { withClient } from "@/server/db/client";
import type { AgentName } from "@/server/ai/agents";

const AGENT_NAMES = new Set(["router", "tech_lead", "contact"]);

export async function ensureSession(sessionId: string): Promise<AgentName> {
  return withClient(async (client) => {
    const result = await client.query<{ agent: string }>(
      `INSERT INTO chat_sessions (id) VALUES ($1)
       ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
       RETURNING agent`,
      [sessionId]
    );
    const agent = result.rows[0]?.agent;
    return (AGENT_NAMES.has(agent ?? "") ? agent : "router") as AgentName;
  });
}

export async function setSessionAgent(sessionId: string, agent: AgentName): Promise<void> {
  await withClient((client) =>
    client.query(
      `UPDATE chat_sessions SET agent = $2, updated_at = NOW() WHERE id = $1`,
      [sessionId, agent]
    )
  );
}

export async function saveMessages(sessionId: string, messages: UIMessage[]): Promise<void> {
  if (messages.length === 0) return;
  await withClient(async (client) => {
    for (const message of messages) {
      await client.query(
        `INSERT INTO chat_messages (id, session_id, role, parts)
         VALUES ($1, $2, $3, $4::jsonb)
         ON CONFLICT (id) DO UPDATE SET parts = EXCLUDED.parts`,
        [message.id, sessionId, message.role, JSON.stringify(message.parts)]
      );
    }
  });
}

export async function loadMessages(sessionId: string): Promise<UIMessage[]> {
  return withClient(async (client) => {
    const result = await client.query<{
      id: string;
      role: string;
      parts: UIMessage["parts"];
    }>(
      `SELECT id, role, parts FROM chat_messages
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [sessionId]
    );
    return result.rows.map((row) => ({
      id: row.id,
      role: row.role as UIMessage["role"],
      parts: row.parts,
    }));
  });
}
