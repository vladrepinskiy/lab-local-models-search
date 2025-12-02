// SQL DDL statements for database schema
// Note: vector extension is loaded via PGlite constructor, not via SQL

export const CREATE_DOCUMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    embedding vector(384)
  );
`;

export const CREATE_FTS_INDEX = `
  CREATE INDEX IF NOT EXISTS documents_fts_idx 
  ON documents 
  USING GIN (to_tsvector('english', title || ' ' || content));
`;

export const CREATE_VECTOR_INDEX = `
  CREATE INDEX IF NOT EXISTS documents_embedding_idx 
  ON documents 
  USING hnsw (embedding vector_cosine_ops);
`;

export const DROP_DOCUMENTS_TABLE = `
  DROP TABLE IF EXISTS documents CASCADE;
`;
