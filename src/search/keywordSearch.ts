import { executeQuery } from '../db/db';
import type { SearchResult, ResultDocument } from '../types/search.types';

//Perform a full-text keyword search using PostgreSQL's built-in FTS
export const performKeywordSearch = async (
  query: string,
  limit: number = 10
): Promise<SearchResult> => {
  const startTime = performance.now();

  try {
    if (!query.trim()) {
      return {
        documents: [],
        totalCount: 0,
        executionTimeMs: 0,
        query,
        mode: 'keyword',
      };
    }

    // Use PostgreSQL full-text search
    const sql = `
      SELECT 
        id,
        title,
        content,
        ts_rank(
          to_tsvector('english', title || ' ' || content),
          plainto_tsquery('english', $1)
        ) as score
      FROM documents
      WHERE to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)
      ORDER BY score DESC
      LIMIT $2;
    `;

    const documents = await executeQuery<ResultDocument>(sql, [query, limit]);

    const endTime = performance.now();
    const executionTimeMs = endTime - startTime;

    return {
      documents,
      totalCount: documents.length,
      executionTimeMs,
      query,
      mode: 'keyword',
    };
  } catch (error) {
    console.error('Keyword search failed:', error);
    const endTime = performance.now();
    return {
      documents: [],
      totalCount: 0,
      executionTimeMs: endTime - startTime,
      query,
      mode: 'keyword',
    };
  }
};
