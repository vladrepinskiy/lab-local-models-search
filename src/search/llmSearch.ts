import type { SearchResult } from '../types/search.types';

/**
 * Perform LLM-powered search (stub for future implementation)
 * Will be implemented in later milestones with web-llm
 */
export const performLLMSearch = async (
  query: string,
  _limit: number = 10
): Promise<SearchResult> => {
  const startTime = performance.now();

  // TODO: Implement LLM-powered search
  // 1. Process query through LLM
  // 2. Generate enhanced search terms or directly score documents
  // 3. Return ranked results

  console.warn('LLM search not yet implemented');

  const endTime = performance.now();

  return {
    documents: [],
    totalCount: 0,
    executionTimeMs: endTime - startTime,
    query,
    mode: 'llm',
  };
};
