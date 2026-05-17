import { generateText } from "ai";
import { chatModel } from "../src/server/ai/provider";

async function main() {
  const r = await generateText({
    model: chatModel(),
    prompt: "Reply with exactly one word: PONG",
  });
  console.log("Response:", r.text);
  console.log("Tokens used:", r.usage.totalTokens);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
