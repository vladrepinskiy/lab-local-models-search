import { useContext } from 'react';
import type { DBContextValue } from '../context/db.provider';
import { DBContext } from '../context/db.provider';

export const useDatabase = (): DBContextValue => {
  const context = useContext(DBContext);

  if (!context) {
    throw new Error('useDatabase must be used within a DBProvider');
  }

  return context;
};
