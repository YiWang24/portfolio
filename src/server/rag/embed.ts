import { embedMany } from "ai";
import { embeddingModel } from "@/server/ai/provider";
import type { TextChunk } from "@/server/rag/chunk";

export type EmbeddedChunk = TextChunk & { embedding: number[] };

const EMBED_BATCH = 16;

export async function embedChunks(chunks: TextChunk[]): Promise<EmbeddedChunk[]> {
  if (chunks.length === 0) return [];
  const out: EmbeddedChunk[] = [];

  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    const batch = chunks.slice(i, i + EMBED_BATCH);
    const { embeddings } = await embedMany({
      model: embeddingModel(),
      values: batch.map((chunk) => chunk.text),
    });
    batch.forEach((chunk, idx) => {
      const embedding = embeddings[idx];
      if (!embedding) {
        throw new Error(`Missing embedding for chunk ${chunk.path}#${chunk.index}`);
      }
      out.push({ ...chunk, embedding });
    });
  }

  return out;
}
