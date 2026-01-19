-- Enable pgvector extension (skip if not available)
-- Note: If this fails, install pgvector on your PostgreSQL server:
-- https://github.com/pgvector/pgvector#installation
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing table to recreate with correct schema
DROP TABLE IF EXISTS vector_store CASCADE;

-- Create vector_store table for RAG knowledge base
CREATE TABLE vector_store (
    id SERIAL PRIMARY KEY,
    path VARCHAR(255) NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    start_pos INTEGER,
    end_pos INTEGER,
    embedding vector(3072),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(path, chunk_index)
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_vector_store_embedding
    ON vector_store
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Create index for path queries
CREATE INDEX IF NOT EXISTS idx_vector_store_path ON vector_store(path);

-- Create contact_messages table for storing contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for contact messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
