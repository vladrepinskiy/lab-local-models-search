import { faker } from '@faker-js/faker';
import { getDB } from './db';
import {
  DROP_DOCUMENTS_TABLE,
  CREATE_DOCUMENTS_TABLE,
  CREATE_FTS_INDEX,
} from '../constants/schema.constant';

const DEFAULT_DOCUMENT_COUNT = 1000;

const generateDocument = () => {
  return {
    title: faker.lorem.sentence({ min: 3, max: 8 }),
    content: faker.lorem.paragraphs({ min: 2, max: 5 }),
    metadata: {
      author: faker.person.fullName(),
      category: faker.helpers.arrayElement([
        'Technology',
        'Science',
        'Business',
        'Health',
        'Education',
      ]),
      tags: faker.helpers.arrayElements(
        ['AI', 'ML', 'Database', 'Web', 'Mobile', 'Cloud', 'Security'],
        { min: 1, max: 3 }
      ),
    },
  };
};

export const seedDatabase = async (
  count: number = DEFAULT_DOCUMENT_COUNT
): Promise<number> => {
  const db = await getDB();

  try {
    console.log(`Seeding database with ${count} documents...`);
    const startTime = performance.now();

    // Clear existing data
    await db.exec('DELETE FROM documents;');

    // Generate and insert documents in batches
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < count; i += batchSize) {
      const batchCount = Math.min(batchSize, count - i);
      const documents = Array.from({ length: batchCount }, generateDocument);

      // Build values for batch insert
      const values = documents
        .map(
          (_doc, idx) =>
            `($${idx * 3 + 1}, $${idx * 3 + 2}, $${idx * 3 + 3}::jsonb)`
        )
        .join(', ');

      const params = documents.flatMap((doc) => [
        doc.title,
        doc.content,
        JSON.stringify(doc.metadata),
      ]);

      const query = `
        INSERT INTO documents (title, content, metadata)
        VALUES ${values}
      `;

      await db.query(query, params);
      insertedCount += batchCount;
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
