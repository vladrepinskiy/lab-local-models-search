// SQL DDL statements for database schema

export const CREATE_DOCUMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
  );
`;

export const CREATE_FTS_INDEX = `
  CREATE INDEX IF NOT EXISTS documents_fts_idx 
  ON documents 
  USING GIN (to_tsvector('english', title || ' ' || content));
`;

export const CREATE_VECTOR_EXTENSION = `
  -- Vector search will be added in future milestones
  -- CREATE EXTENSION IF NOT EXISTS vector;
  -- ALTER TABLE documents ADD COLUMN IF NOT EXISTS embedding vector(384);
`;

export const DROP_DOCUMENTS_TABLE = `
  DROP TABLE IF EXISTS documents CASCADE;
`;
