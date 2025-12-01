import { getDB } from './db';
import {
  DROP_DOCUMENTS_TABLE,
  CREATE_DOCUMENTS_TABLE,
  CREATE_FTS_INDEX,
} from '../constants/schema.constant';
import artDataset from '../data/art-history-dataset.json';

/**
 * Seed the database with Wikipedia art history articles
 */
export const seedDatabase = async (): Promise<number> => {
  const db = await getDB();

  try {
    console.log(
      `Seeding database with ${artDataset.documents.length} art history documents...`
    );
    const startTime = performance.now();

    // Clear existing data
    await db.exec('DELETE FROM documents;');

    // Insert documents in batches
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < artDataset.documents.length; i += batchSize) {
      const batch = artDataset.documents.slice(i, i + batchSize);

      // Build values for batch insert
      const values = batch
        .map(
          (_doc, idx) =>
            `($${idx * 3 + 1}, $${idx * 3 + 2}, $${idx * 3 + 3}::jsonb)`
        )
        .join(', ');

      const params = batch.flatMap((doc) => [
        doc.title,
        doc.content,
        JSON.stringify(doc.metadata),
      ]);

      const query = `
        INSERT INTO documents (title, content, metadata)
        VALUES ${values}
      `;

      await db.query(query, params);
      insertedCount += batch.length;
    }

    const endTime = performance.now();
    console.log(
      `Seeded ${insertedCount} documents in ${(endTime - startTime).toFixed(2)}ms`
    );

    return insertedCount;
  } catch (error) {
    console.error('Failed to seed database:', error);
    throw error;
  }
};

/**
 * Clear all data from the database
 */
export const clearDatabase = async (): Promise<void> => {
  const db = await getDB();

  try {
    console.log('Clearing database...');
    await db.exec(DROP_DOCUMENTS_TABLE);
    await db.exec(CREATE_DOCUMENTS_TABLE);
    await db.exec(CREATE_FTS_INDEX);
    console.log('Database cleared and schema recreated');
  } catch (error) {
    console.error('Failed to clear database:', error);
    throw error;
  }
};
