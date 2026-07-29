import { z } from "zod";

const serverEnvSchema = z.object({
  OPENAI_COMPAT_BASE_URL: z.string().url(),
  OPENAI_COMPAT_API_KEY: z.string().min(1),
  GLM_CHAT_MODEL: z.string().default("glm-5.2"),
  GLM_ROUTER_MODEL: z.string().default("glm-5.2"),
  GLM_FALLBACK_MODEL: z.string().default("glm-5.2"),
  GLM_EMBEDDING_MODEL: z.string().default("embedding-3"),
  GLM_EMBEDDING_DIM: z.coerce.number().int().positive().default(2048),

  POSTGRES_URL: z.string().min(1),
  POSTGRES_URL_NON_POOLING: z.string().min(1).optional(),

  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().min(1).optional(),

  GITHUB_TOKEN: z.string().min(1),
  GITHUB_USERNAME: z.string().min(1),

  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM: z.string().min(1),
  CONTACT_EMAIL: z.string().email(),

  LINKEDIN_URL: z.string().url().optional(),
  CALENDLY_URL: z.string().url().optional(),

  RAG_SYNC_KEY: z.string().min(16),

  CHAT_RATE_LIMIT_HOURLY: z.coerce.number().int().positive().default(60),
  CHAT_RATE_LIMIT_DAILY: z.coerce.number().int().positive().default(300),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid server environment:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
