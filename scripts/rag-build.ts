import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { syncProfile } from "../src/server/rag/sync";
import type { ProfileJson } from "../src/server/rag/chunk";

async function main(): Promise<void> {
  const here = dirname(fileURLToPath(import.meta.url));
  const profilePath = resolve(here, "../src/data/profile.json");
  const profile = JSON.parse(readFileSync(profilePath, "utf8")) as ProfileJson;

  console.log(`Syncing RAG from ${profilePath}`);
  const result = await syncProfile(profile);
  console.log(
    `Sync complete — documents=${result.documents} chunks=${result.chunks} pruned=${result.pruned}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
