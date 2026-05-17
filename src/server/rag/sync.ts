import { withClient } from "@/server/db/client";
import { chunkProfile, type ProfileJson } from "@/server/rag/chunk";
import { embedChunks, type EmbeddedChunk } from "@/server/rag/embed";

function toVectorLiteral(values: number[]): string {
  return `[${values.join(",")}]`;
}

async function upsertChunks(chunks: EmbeddedChunk[]): Promise<number> {
  if (chunks.length === 0) return 0;
  return withClient(async (client) => {
    let stored = 0;
    for (const chunk of chunks) {
      await client.query(
        `INSERT INTO vector_store (path, chunk_index, content, start_pos, end_pos, embedding)
         VALUES ($1, $2, $3, $4, $5, $6::vector)
         ON CONFLICT (path, chunk_index) DO UPDATE
           SET content = EXCLUDED.content,
               start_pos = EXCLUDED.start_pos,
               end_pos = EXCLUDED.end_pos,
               embedding = EXCLUDED.embedding,
               updated_at = NOW()`,
        [
          chunk.path,
          chunk.index,
          chunk.text,
          chunk.startPos,
          chunk.endPos,
          toVectorLiteral(chunk.embedding),
        ]
      );
      stored += 1;
    }
    return stored;
  });
}

async function pruneRemoved(paths: Set<string>, indexes: Map<string, Set<number>>): Promise<number> {
  return withClient(async (client) => {
    const result = await client.query<{ path: string; chunk_index: number }>(
      `SELECT path, chunk_index FROM vector_store WHERE path = ANY($1::text[])`,
      [Array.from(paths)]
    );
    let pruned = 0;
    for (const row of result.rows) {
      const keep = indexes.get(row.path);
      if (!keep || !keep.has(row.chunk_index)) {
        await client.query(
          `DELETE FROM vector_store WHERE path = $1 AND chunk_index = $2`,
          [row.path, row.chunk_index]
        );
        pruned += 1;
      }
    }
    return pruned;
  });
}

export type SyncResult = {
  documents: number;
  chunks: number;
  pruned: number;
};

export async function syncProfile(profile: ProfileJson): Promise<SyncResult> {
  const chunks = chunkProfile(profile);
  const paths = new Set(chunks.map((chunk) => chunk.path));
  const indexes = new Map<string, Set<number>>();
  for (const chunk of chunks) {
    const set = indexes.get(chunk.path) ?? new Set<number>();
    set.add(chunk.index);
    indexes.set(chunk.path, set);
  }

  const embedded = await embedChunks(chunks);
  const stored = await upsertChunks(embedded);
  const pruned = await pruneRemoved(paths, indexes);

  return { documents: paths.size, chunks: stored, pruned };
}
