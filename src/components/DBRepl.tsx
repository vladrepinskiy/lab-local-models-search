import { PGlite } from '@electric-sql/pglite';
import { Repl } from '@electric-sql/pglite-repl';
import { styled } from 'goober';
import { useEffect, useState } from 'react';
import { dbService } from '../services/db.service';
import { Button } from './core';

export const DBRepl = () => {
  const [db, setDb] = useState<PGlite | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      const instance = await dbService.getDB();
      setDb(instance);
    };
    initDB();
  }, []);

  if (!db) {
    return null;
  }

  return (
    <Container>
      <ToggleButtonWrapper>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="secondary"
          fullWidth
        >
          {isOpen ? '▼ Hide PGLite Repl' : '▲ Show PGLite Repl'}
        </Button>
      </ToggleButtonWrapper>
      {isOpen && (
        <ReplContainer>
          <Repl pg={db} border={false} theme="auto" />
        </ReplContainer>
      )}
    </Container>
  );
};

const Container = styled('div')`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
`;

const ToggleButtonWrapper = styled('div')`
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f5f5;
`;

const ReplContainer = styled('div')`
  height: 500px;
  width: 100%;
  overflow: hidden;

  /* Override REPL styles to fit our design */
  & > div {
    height: 100%;
  }
`;
