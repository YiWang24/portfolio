import type { LanguageModelV2 } from "@ai-sdk/provider";
import { captureError } from "@/server/observability";

/**
 * Model failover: try the primary model, and if the call itself fails
 * (provider outage, 5xx, timeout at initiation) transparently retry on the
 * fallback model. Mid-stream failures are not recoverable here by design.
 */
export function withModelFallback(
  primary: LanguageModelV2,
  fallback: LanguageModelV2
): LanguageModelV2 {
  return {
    specificationVersion: "v2",
    provider: primary.provider,
    modelId: primary.modelId,
    get supportedUrls() {
      return primary.supportedUrls;
    },
    async doGenerate(options) {
      try {
        return await primary.doGenerate(options);
      } catch (err) {
        captureError(err, { fallback: "doGenerate", from: primary.modelId, to: fallback.modelId });
        return fallback.doGenerate(options);
      }
    },
    async doStream(options) {
      try {
        return await primary.doStream(options);
      } catch (err) {
        captureError(err, { fallback: "doStream", from: primary.modelId, to: fallback.modelId });
        return fallback.doStream(options);
      }
    },
  };
}
