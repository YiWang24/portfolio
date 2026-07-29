import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { getServerEnv } from "@/server/env";
import { withModelFallback } from "@/server/ai/fallback";

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

export function routerModel() {
  return getProvider().chatModel(getServerEnv().GLM_ROUTER_MODEL);
}

export function fallbackModel() {
  return getProvider().chatModel(getServerEnv().GLM_FALLBACK_MODEL);
}

export function resilientChatModel() {
  return withModelFallback(chatModel(), fallbackModel());
}

export function resilientRouterModel() {
  return withModelFallback(routerModel(), chatModel());
}

export function embeddingModel() {
  return getProvider().textEmbeddingModel(getServerEnv().GLM_EMBEDDING_MODEL);
}
