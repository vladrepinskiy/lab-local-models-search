// Search mode types (kept for backwards compatibility)
export type SearchMode = 'keyword' | 'llm' | 'vector';

// Database status types
export type DBStatus = 'unknown' | 'empty' | 'seeded';

// Result document interface
export interface ResultDocument {
  id: number;
  title: string;
  content: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

// Search result interface
export interface SearchResult {
  documents: ResultDocument[];
  totalCount: number;
  executionTimeMs: number;
  query: string;
  mode: SearchMode;
}

// Search metrics interface
export interface SearchMetrics {
  executionTimeMs: number;
  totalResults: number;
  documentsShown: number;
}
