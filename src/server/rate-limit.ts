import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getServerEnv } from "@/server/env";

let cachedRedis: Redis | undefined;
let cachedHourly: Ratelimit | undefined;
let cachedDaily: Ratelimit | undefined;

function redis(): Redis | undefined {
  if (cachedRedis) return cachedRedis;
  const env = getServerEnv();
  if (!env.KV_REST_API_URL || !env.KV_REST_API_TOKEN) return undefined;
  cachedRedis = new Redis({ url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN });
  return cachedRedis;
}

function hourly(): Ratelimit | undefined {
  if (cachedHourly) return cachedHourly;
  const client = redis();
  if (!client) return undefined;
  const env = getServerEnv();
  cachedHourly = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(env.CHAT_RATE_LIMIT_HOURLY, "1 h"),
    prefix: "rl:chat:h",
  });
  return cachedHourly;
}

function daily(): Ratelimit | undefined {
  if (cachedDaily) return cachedDaily;
  const client = redis();
  if (!client) return undefined;
  const env = getServerEnv();
  cachedDaily = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(env.CHAT_RATE_LIMIT_DAILY, "1 d"),
    prefix: "rl:chat:d",
  });
  return cachedDaily;
}

export type RateLimitResult = {
  success: boolean;
  scope: "hourly" | "daily" | "ok";
  remaining: number;
  reset: number;
};

export async function checkChatRateLimit(ip: string): Promise<RateLimitResult> {
  const hourlyLimiter = hourly();
  const dailyLimiter = daily();
  if (!hourlyLimiter || !dailyLimiter) {
    return { success: true, scope: "ok", remaining: Number.POSITIVE_INFINITY, reset: 0 };
  }

  const h = await hourlyLimiter.limit(ip);
  if (!h.success) {
    return { success: false, scope: "hourly", remaining: h.remaining, reset: h.reset };
  }
  const d = await dailyLimiter.limit(ip);
  if (!d.success) {
    return { success: false, scope: "daily", remaining: d.remaining, reset: d.reset };
  }
  return {
    success: true,
    scope: "ok",
    remaining: Math.min(h.remaining, d.remaining),
    reset: Math.max(h.reset, d.reset),
  };
}
