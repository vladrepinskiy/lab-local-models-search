import type { SearchResult } from '../types/search.types';

/**
 * Perform vector similarity search (stub for future implementation)
 * Will be implemented in later milestones with actual embeddings
 */
export const performVectorSearch = async (
  query: string,
  _limit: number = 10
): Promise<SearchResult> => {
  const startTime = performance.now();

  // TODO: Implement actual vector search
  // 1. Generate embedding for query
  // 2. Perform similarity search against document embeddings
  // 3. Return ranked results

  console.warn('Vector search not yet implemented');

  const endTime = performance.now();

  return {
    documents: [],
    totalCount: 0,
    executionTimeMs: endTime - startTime,
    query,
    mode: 'vector',
  };
};
