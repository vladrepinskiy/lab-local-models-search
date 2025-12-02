import { dbService } from '../services/db.service';
import type { ResultDocument, SearchResult } from '../types/search.types';

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

    // Check if query contains OR operators (from LLM expansion)
    // If it contains | separator, construct a to_tsquery with OR operators
    const isExpandedQuery = query.includes('|');

    let sql: string;
    let queryParams: unknown[];

    if (isExpandedQuery) {
      // Parse keywords separated by |
      const keywords = query
        .split('|')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
      console.log(
        '[Keyword Search] Expanded query detected with keywords:',
        keywords
      );

      // Construct to_tsquery with OR operators
      // to_tsquery expects: 'word1' | 'word2' | 'word3'
      // We need to properly escape special characters and quote each term
      const tsqueryParts = keywords.map((keyword) => {
        // Remove any existing quotes and escape special characters
        // to_tsquery special chars: & | ! ( ) : * ' "
        let cleaned = keyword.replace(/['"]/g, '').trim();

        // If keyword contains spaces, wrap in quotes
        if (cleaned.includes(' ')) {
          // Escape single quotes for SQL
          cleaned = cleaned.replace(/'/g, "''");
          return `'${cleaned}'`;
        } else {
          // Single word, no quotes needed but escape single quotes
          cleaned = cleaned.replace(/'/g, "''");
          return cleaned;
        }
      });

      // Join with OR operator (|) for to_tsquery
      const tsquery = tsqueryParts.join(' | ');

      console.log('[Keyword Search] Constructed tsquery:', tsquery);

      sql = `
        SELECT 
          id,
          title,
          content,
          ts_rank(
            to_tsvector('english', title || ' ' || content),
            to_tsquery('english', $1)
          ) as score
        FROM documents
        WHERE to_tsvector('english', title || ' ' || content) @@ to_tsquery('english', $1)
        ORDER BY score DESC
        LIMIT $2;
      `;

      queryParams = [tsquery, limit];
    } else {
      // Use plainto_tsquery for simple queries
      sql = `
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

      queryParams = [query, limit];
    }

    console.log('[Keyword Search] Executing SQL query:', sql);
    console.log('[Keyword Search] Query parameters:', queryParams);

    const documents = await dbService.executeQuery<ResultDocument>(
      sql,
      queryParams
    );

    console.log(
      `[Keyword Search] PGLite returned ${documents.length} documents`
    );
    if (documents.length > 0) {
      console.log('[Keyword Search] First result:', {
        id: documents[0].id,
        title: documents[0].title,
        score: documents[0].score,
      });
    }

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
