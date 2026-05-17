import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { chatModel } from "../src/server/ai/provider";
import {
  contactSystem,
  createAgentState,
  makeTransferTools,
  routerSystem,
  techLeadSystem,
  type AgentName,
} from "../src/server/ai/agents";
import { contactAgentTools, techLeadTools } from "../src/server/ai/tools";

const TRANSFER_KEYS = ["transfer_to_tech_lead", "transfer_to_contact"];
const TECH_KEYS = Object.keys(techLeadTools);
const CONTACT_KEYS = Object.keys(contactAgentTools);

function systemFor(agent: AgentName) {
  return agent === "tech_lead" ? techLeadSystem : agent === "contact" ? contactSystem : routerSystem;
}
function activeFor(agent: AgentName) {
  return agent === "tech_lead" ? TECH_KEYS : agent === "contact" ? CONTACT_KEYS : TRANSFER_KEYS;
}

async function ask(prompt: string, label: string) {
  console.log(`\n=== ${label} === Q: ${prompt}`);
  const state = createAgentState();
  const transfer = makeTransferTools(state);
  const tools = { ...transfer, ...techLeadTools, ...contactAgentTools };

  const messages: UIMessage[] = [
    { id: "u1", role: "user", parts: [{ type: "text", text: prompt }] },
  ];

  const result = streamText({
    model: chatModel(),
    messages: convertToModelMessages(messages),
    system: systemFor(state.current),
    tools,
    stopWhen: stepCountIs(8),
    prepareStep: () => ({
      system: systemFor(state.current),
      activeTools: activeFor(state.current) as Array<keyof typeof tools>,
    }),
  });

  const toolsUsed: string[] = [];
  for await (const part of result.fullStream) {
    if (part.type === "tool-call") toolsUsed.push(part.toolName);
  }
  const final = await result.text;
  const agent = state.current;
  console.log(`agent=${agent} tools=[${toolsUsed.join(", ")}]`);
  console.log("answer:", final.trim().slice(0, 250));
}

async function main() {
  await ask("where did you study?", "personal RAG");
  await ask("what are your top github repos?", "github tool");
  await ask("what do you think about politics?", "safety");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
