import { styled } from 'goober';
import { useDatabase } from '../hooks/useDatabase';
import { useSearch } from '../hooks/useSearch';
import { Button } from './core';

export const HeaderBar = () => {
  const { dbStatus, docCount, seeding, clearing, seedDB, clearDB } =
    useDatabase();
  const { query, setQuery, searching, search } = useSearch();

  const getStatusText = () => {
    if (seeding) return 'Seeding...';
    if (clearing) return 'Clearing...';

    switch (dbStatus) {
      case 'unknown':
        return 'DB: Unknown';
      case 'empty':
        return 'DB: Empty';
      case 'seeded':
        return `DB: Seeded (${docCount?.toLocaleString() ?? 0} docs)`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search();
  };

  return (
    <Container>
      <TopRow>
        <Title>Local Search Lab</Title>
        <ButtonGroup>
          <Button onClick={seedDB} disabled={seeding || clearing}>
            {seeding ? 'Seeding...' : 'Seed DB'}
          </Button>
          <Button
            onClick={clearDB}
            disabled={seeding || clearing}
            variant="secondary"
          >
            {clearing ? 'Clearing...' : 'Clear DB'}
          </Button>
          <StatusLabel>{getStatusText()}</StatusLabel>
        </ButtonGroup>
      </TopRow>
      <SearchRow as="form" onSubmit={handleSubmit}>
        <SearchInput
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your search query..."
          disabled={searching}
        />
        <Button type="submit" disabled={searching || !query.trim()}>
          {searching ? 'Searching...' : 'Search All'}
        </Button>
      </SearchRow>
    </Container>
  );
};

const Container = styled('header')`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const TopRow = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled('h1')`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
`;

const ButtonGroup = styled('div')`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const StatusLabel = styled('div')`
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
`;

const SearchRow = styled('div')`
  display: flex;
  gap: 12px;
`;

const SearchInput = styled('input')`
  flex: 1;
  height: 40px;
  padding: 0 16px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #1a1a1a;
  }

  &::placeholder {
    color: #999;
  }
`;
