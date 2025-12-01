// SQL queries for database operations

export const COUNT_DOCUMENTS = `
  SELECT COUNT(*) as count FROM documents;
`;

export const CHECK_TABLE_EXISTS = `
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'documents'
  );
`;
