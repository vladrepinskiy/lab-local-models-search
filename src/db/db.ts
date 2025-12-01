import { PGlite } from '@electric-sql/pglite';
import {
  CREATE_DOCUMENTS_TABLE,
  CREATE_FTS_INDEX,
} from '../constants/schema.constant';
import {
  CHECK_TABLE_EXISTS,
  COUNT_DOCUMENTS,
} from '../constants/queries.constant';

let dbInstance: PGlite | null = null;

const initializeSchema = async (): Promise<void> => {
  if (!dbInstance) return;

  try {
    await dbInstance.exec(CREATE_DOCUMENTS_TABLE);
    await dbInstance.exec(CREATE_FTS_INDEX);
  } catch (error) {
    console.error('Failed to initialize schema:', error);
    throw error;
  }
};

export const getDB = async (): Promise<PGlite> => {
  if (!dbInstance) {
    dbInstance = new PGlite();
    await initializeSchema();
  }
  return dbInstance;
};

export const checkDBStatus = async (): Promise<{
  exists: boolean;
  count: number;
}> => {
  const db = await getDB();

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
};

export const executeQuery = async <T = unknown>(
  query: string,
  params?: unknown[]
): Promise<T[]> => {
  const db = await getDB();
  const result = await db.query(query, params);
  return result.rows as T[];
};

export const closeDB = async (): Promise<void> => {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
};
