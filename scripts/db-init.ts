import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

async function main(): Promise<void> {
  const connectionString =
    process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error("POSTGRES_URL (or POSTGRES_URL_NON_POOLING) is required");
  }

  const here = dirname(fileURLToPath(import.meta.url));
  const schemaPath = resolve(here, "../src/server/db/schema.sql");
  const sql = readFileSync(schemaPath, "utf8");

  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(sql);
    console.log(`Applied schema from ${schemaPath}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
