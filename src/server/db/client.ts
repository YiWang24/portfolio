import { Pool, type PoolClient } from "pg";
import { getServerEnv } from "@/server/env";

declare global {
  var __pgPool: Pool | undefined;
}

export function getPool(): Pool {
  if (globalThis.__pgPool) return globalThis.__pgPool;
  const env = getServerEnv();
  const pool = new Pool({
    connectionString: env.POSTGRES_URL,
    max: 5,
    idleTimeoutMillis: 10_000,
  });
  globalThis.__pgPool = pool;
  return pool;
}

export async function withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
