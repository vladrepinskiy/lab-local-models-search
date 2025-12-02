import { dbService } from '../services/db.service';
import { generateEmbedding } from '../services/embedding.service';
import type { SearchResult, ResultDocument } from '../types/search.types';

export const performVectorSearch = async (
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
        mode: 'vector',
      };
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Perform vector similarity search using cosine distance
    // Lower distance = more similar (0 = identical, 2 = opposite)
    const sql = `
      SELECT 
        id,
        title,
        content,
        (1 - (embedding <=> $1::vector)) as score
      FROM documents
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT $2;
    `;

    const embeddingString = `[${queryEmbedding.join(',')}]`;
    const documents = await dbService.executeQuery<ResultDocument>(sql, [
      embeddingString,
      limit,
    ]);

    const endTime = performance.now();
    const executionTimeMs = endTime - startTime;

    return {
      documents,
      totalCount: documents.length,
      executionTimeMs,
      query,
      mode: 'vector',
    };
  } catch (error) {
    console.error('Vector search failed:', error);
    const endTime = performance.now();
    return {
      documents: [],
      totalCount: 0,
      executionTimeMs: endTime - startTime,
      query,
      mode: 'vector',
    };
  }
};
