import { embed } from "ai";
import { embeddingModel } from "@/server/ai/provider";
import { withClient } from "@/server/db/client";

export type VectorSearchResult = {
  path: string;
  chunkIndex: number;
  content: string;
  similarity: number;
};

function toVectorLiteral(values: number[]): string {
  return `[${values.join(",")}]`;
}

export async function cosineSearch(
  pathPrefix: string,
  query: string,
  topK = 5
): Promise<VectorSearchResult[]> {
  const { embedding } = await embed({ model: embeddingModel(), value: query });
  const vectorLiteral = toVectorLiteral(embedding);

  return withClient(async (client) => {
    const result = await client.query<{
      path: string;
      chunk_index: number;
      content: string;
      similarity: number;
    }>(
      `SELECT path, chunk_index, content, 1 - (embedding <=> $1::vector) AS similarity
       FROM vector_store
       WHERE path LIKE $2 || '%'
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      [vectorLiteral, pathPrefix, topK]
    );
    return result.rows.map((row) => ({
      path: row.path,
      chunkIndex: row.chunk_index,
      content: row.content,
      similarity: row.similarity,
    }));
  });
}
