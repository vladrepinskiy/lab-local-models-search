import { PGlite } from '@electric-sql/pglite';
import { vector } from '@electric-sql/pglite/vector';
import {
  CHECK_TABLE_EXISTS,
  COUNT_DOCUMENTS,
} from '../constants/queries.constant';
import {
  CREATE_DOCUMENTS_TABLE,
  CREATE_FTS_INDEX,
  CREATE_VECTOR_INDEX,
  DROP_DOCUMENTS_TABLE,
} from '../constants/schema.constant';
import artDatasetRaw from '../data/art-history-dataset.json';
import type { ArtHistoryDataset } from '../types/data.types';

const artDataset = artDatasetRaw as ArtHistoryDataset;

class DatabaseService {
  private dbInstance: PGlite | null = null;
  private initializationPromise: Promise<PGlite> | null = null;

  private async initializeSchema(): Promise<void> {
    if (!this.dbInstance) return;

    try {
      // Create the vector extension first (makes vector type available)
      await this.dbInstance.exec('CREATE EXTENSION IF NOT EXISTS vector;');

      // Now create tables and indexes
      await this.dbInstance.exec(CREATE_DOCUMENTS_TABLE);
      await this.dbInstance.exec(CREATE_FTS_INDEX);
      await this.dbInstance.exec(CREATE_VECTOR_INDEX);
    } catch (error) {
      console.error('Failed to initialize schema:', error);
      throw error;
    }
  }

  async getDB(): Promise<PGlite> {
    if (this.dbInstance) {
      return this.dbInstance;
    }

    // If initialization is in progress, wait for it
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Start initialization
    this.initializationPromise = (async () => {
      this.dbInstance = new PGlite({
        extensions: {
          vector,
        },
      });

      // Wait for PGlite to be ready
      await this.dbInstance.waitReady;

      await this.initializeSchema();

      return this.dbInstance;
    })();

    return this.initializationPromise;
  }

  async checkStatus(): Promise<{
    exists: boolean;
    count: number;
  }> {
    const db = await this.getDB();

    try {
      const existsResult = await db.query<{ exists: boolean }>(
        CHECK_TABLE_EXISTS
      );
      const exists = existsResult.rows[0]?.exists ?? false;

      if (!exists) {
        return { exists: false, count: 0 };
      }

      const countResult = await db.query<{ count: string }>(COUNT_DOCUMENTS);
      const count = parseInt(countResult.rows[0]?.count ?? '0', 10);

      return { exists, count };
    } catch (error) {
      console.error('Failed to check DB status:', error);
      return { exists: false, count: 0 };
    }
  }

  async executeQuery<T = unknown>(
    query: string,
    params?: unknown[]
  ): Promise<T[]> {
    const db = await this.getDB();
    const result = await db.query(query, params);
    return result.rows as T[];
  }

  async seed(): Promise<number> {
    const db = await this.getDB();

    try {
      console.log(
        `Seeding database with ${artDataset.documents.length} art history documents...`
      );

      // Check if embeddings are present
      const hasEmbeddings = artDataset.documents.some(
        (doc) => doc.embedding && doc.embedding.length > 0
      );

      if (!hasEmbeddings) {
        console.warn(
          '⚠️  No embeddings found in dataset. Please run "bun run generate-dataset" to generate embeddings first.'
        );
      }

      const startTime = performance.now();

      // Clear existing data
      await db.exec('DELETE FROM documents;');

      // Process documents in batches for efficient insertion
      const batchSize = 100;
      let insertedCount = 0;

      for (let i = 0; i < artDataset.documents.length; i += batchSize) {
        const batch = artDataset.documents.slice(i, i + batchSize);

        // Build values for batch insert (4 params per doc: title, content, metadata, embedding)
        const values = batch
          .map(
            (_doc, idx) =>
              `($${idx * 4 + 1}, $${idx * 4 + 2}, $${idx * 4 + 3}::jsonb, $${idx * 4 + 4}::vector)`
          )
          .join(', ');

        const params = batch.flatMap((doc) => [
          doc.title,
          doc.content,
          JSON.stringify(doc.metadata),
          doc.embedding && doc.embedding.length > 0
            ? `[${doc.embedding.join(',')}]`
            : null,
        ]);

        const query = `
          INSERT INTO documents (title, content, metadata, embedding)
          VALUES ${values}
        `;

        await db.query(query, params);
        insertedCount += batch.length;

        // Log progress every 100 documents
        if (
          insertedCount % 100 === 0 ||
          insertedCount === artDataset.documents.length
        ) {
          const elapsed = performance.now() - startTime;
          const rate = (insertedCount / elapsed) * 1000; // docs per second
          console.log(
            `Progress: ${insertedCount}/${artDataset.documents.length} documents (${rate.toFixed(1)} docs/sec)`
          );
        }
      }

      const endTime = performance.now();
      console.log(
        `✅ Seeded ${insertedCount} documents in ${((endTime - startTime) / 1000).toFixed(1)}s`
      );

      return insertedCount;
    } catch (error) {
      console.error('Failed to seed database:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    const db = await this.getDB();

    try {
      console.log('Clearing database...');
      await db.exec(DROP_DOCUMENTS_TABLE);
      // Vector extension is already created in initialization
      await db.exec(CREATE_DOCUMENTS_TABLE);
      await db.exec(CREATE_FTS_INDEX);
      await db.exec(CREATE_VECTOR_INDEX);
      console.log('Database cleared and schema recreated');
    } catch (error) {
      console.error('Failed to clear database:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.dbInstance) {
      await this.dbInstance.close();
      this.dbInstance = null;
      this.initializationPromise = null;
    }
  }
}

export const dbService = new DatabaseService();
