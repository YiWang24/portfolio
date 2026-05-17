import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { getServerEnv } from "@/server/env";

let cached: ReturnType<typeof createOpenAICompatible> | undefined;

function getProvider() {
  if (cached) return cached;
  const env = getServerEnv();
  cached = createOpenAICompatible({
    name: "glm",
    baseURL: env.OPENAI_COMPAT_BASE_URL,
    apiKey: env.OPENAI_COMPAT_API_KEY,
  });
  return cached;
}

export function chatModel() {
  return getProvider().chatModel(getServerEnv().GLM_CHAT_MODEL);
}

export function embeddingModel() {
  return getProvider().textEmbeddingModel(getServerEnv().GLM_EMBEDDING_MODEL);
}
