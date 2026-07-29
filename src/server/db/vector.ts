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

const RRF_K = 60;

export type HybridSearchResult = VectorSearchResult & {
  score: number;
  matchedBy: Array<"vector" | "fulltext">;
};

export async function hybridSearch(
  pathPrefix: string,
  query: string,
  topK = 5
): Promise<HybridSearchResult[]> {
  const candidateK = topK * 2;

  const [vectorHits, textHits] = await Promise.all([
    cosineSearch(pathPrefix, query, candidateK),
    fullTextSearch(pathPrefix, query, candidateK),
  ]);

  const fused = new Map<string, HybridSearchResult>();

  const addRanked = (
    hits: VectorSearchResult[],
    source: "vector" | "fulltext"
  ) => {
    hits.forEach((hit, rank) => {
      const key = `${hit.path}#${hit.chunkIndex}`;
      const rrf = 1 / (RRF_K + rank + 1);
      const existing = fused.get(key);
      if (existing) {
        existing.score += rrf;
        existing.matchedBy.push(source);
        if (hit.similarity > existing.similarity) {
          existing.similarity = hit.similarity;
        }
      } else {
        fused.set(key, { ...hit, score: rrf, matchedBy: [source] });
      }
    });
  };

  addRanked(vectorHits, "vector");
  addRanked(textHits, "fulltext");

  return [...fused.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

async function fullTextSearch(
  pathPrefix: string,
  query: string,
  topK: number
): Promise<VectorSearchResult[]> {
  return withClient(async (client) => {
    const result = await client.query<{
      path: string;
      chunk_index: number;
      content: string;
      rank: number;
    }>(
      `SELECT path, chunk_index, content,
              ts_rank(content_tsv, websearch_to_tsquery('english', $1)) AS rank
       FROM vector_store
       WHERE path LIKE $2 || '%'
         AND content_tsv @@ websearch_to_tsquery('english', $1)
       ORDER BY rank DESC
       LIMIT $3`,
      [query, pathPrefix, topK]
    );
    return result.rows.map((row) => ({
      path: row.path,
      chunkIndex: row.chunk_index,
      content: row.content,
      similarity: row.rank,
    }));
  });
}
