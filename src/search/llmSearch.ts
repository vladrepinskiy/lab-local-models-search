import { expandQuery } from '../services/llm.service';
import { performKeywordSearch } from './keywordSearch';
import type { SearchResult } from '../types/search.types';

export const performLLMSearch = async (
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
        mode: 'llm',
      };
    }

    const expandedQuery = await expandQuery(query);
    const keywordResult = await performKeywordSearch(expandedQuery, limit);

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    return {
      ...keywordResult,
      query, // Keep original query
      expandedQuery, // Store expanded query
      mode: 'llm',
      executionTimeMs: totalTime, // Total time including expansion
    };
  } catch (error) {
    console.error('[LLM Search] Search failed with error:', error);
    console.error('[LLM Search] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Fallback to keyword search on original query
    console.log(
      '[LLM Search] Falling back to keyword search on original query'
    );
    const fallbackResult = await performKeywordSearch(query, limit);
    const endTime = performance.now();
    const totalTime = endTime - startTime;

    console.log(
      `[LLM Search] Fallback search completed in ${totalTime.toFixed(2)}ms`
    );
    console.log(
      `[LLM Search] Fallback found ${fallbackResult.documents.length} documents`
    );

    return {
      ...fallbackResult,
      query,
      mode: 'llm',
      executionTimeMs: totalTime,
    };
  }
};
