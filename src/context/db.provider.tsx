import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
import { checkDBStatus } from '../db/db';
import { clearDatabase, seedDatabase } from '../db/seed';
import type { DBStatus } from '../types/search.types';

export interface DBContextValue {
  dbStatus: DBStatus;
  docCount: number | null;
  seeding: boolean;
  clearing: boolean;
  seedDB: () => Promise<void>;
  clearDB: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export const DBContext = createContext<DBContextValue | null>(null);

interface DBProviderProps {
  children: ReactNode;
}

export const DBProvider = ({ children }: DBProviderProps) => {
  const [dbStatus, setDbStatus] = useState<DBStatus>('unknown');
  const [docCount, setDocCount] = useState<number | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);

  const refreshStatus = async () => {
    try {
      const status = await checkDBStatus();

      if (!status.exists) {
        setDbStatus('unknown');
        setDocCount(null);
      } else if (status.count === 0) {
        setDbStatus('empty');
        setDocCount(0);
      } else {
        setDbStatus('seeded');
        setDocCount(status.count);
      }
    } catch (error) {
      console.error('Failed to refresh DB status:', error);
      setDbStatus('unknown');
      setDocCount(null);
    }
  };

  const handleSeedDB = async () => {
    setSeeding(true);
    try {
      const count = await seedDatabase();
      setDocCount(count);
      setDbStatus('seeded');
    } catch (error) {
      console.error('Failed to seed database:', error);
    } finally {
      setSeeding(false);
    }
  };

  const handleClearDB = async () => {
    setClearing(true);
    try {
      await clearDatabase();
      setDocCount(0);
      setDbStatus('empty');
    } catch (error) {
      console.error('Failed to clear database:', error);
    } finally {
      setClearing(false);
    }
  };

  // Check DB status on mount
  useEffect(() => {
    refreshStatus();
  }, []);

  const value: DBContextValue = {
    dbStatus,
    docCount,
    seeding,
    clearing,
    seedDB: handleSeedDB,
    clearDB: handleClearDB,
    refreshStatus,
  };

  return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
};
