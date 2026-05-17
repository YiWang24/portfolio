-- Neon Postgres schema for the Next.js portfolio backend
-- Embedding model: GLM embedding-3 (2048 dimensions)

CREATE EXTENSION IF NOT EXISTS vector;

-- RAG vector store
CREATE TABLE IF NOT EXISTS vector_store (
    id SERIAL PRIMARY KEY,
    path VARCHAR(255) NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    start_pos INTEGER,
    end_pos INTEGER,
    embedding vector(2048),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(path, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_vector_store_path ON vector_store(path);

-- No ANN index: pgvector caps both HNSW and IVFFlat at 2000 dimensions, while
-- GLM embedding-3 emits 2048. The corpus is small (single-digit chunks per
-- path prefix), so sequential cosine scan is well under 10ms. If we later
-- swap to a <=2000-dim embedding model, add an HNSW index here.

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    message TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
    ON contact_messages(created_at DESC);
