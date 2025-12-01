import { styled } from 'goober';
import { MetricsBar } from './MetricsBar';
import { ResultsList } from './ResultsList';
import type { SearchResult } from '../types/search.types';

interface PanelProps {
  title: string;
  result: SearchResult | null;
}

export const Panel = ({ title, result }: PanelProps) => {
  const metrics = result
    ? {
        executionTimeMs: result.executionTimeMs,
        totalResults: result.totalCount,
        documentsShown: result.documents.length,
      }
    : null;

  return (
    <Container>
      <Header>
        <Title>{title}</Title>
        <MetricsBar metrics={metrics} />
      </Header>
      <Body>
        <ResultsList
          documents={result?.documents ?? []}
          emptyMessage="No results yet. Try searching!"
        />
      </Body>
    </Container>
  );
};

const Container = styled('div')`
  display: flex;
  flex-direction: column;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  min-height: 0; /* Important for proper flex behavior */
`;

const Header = styled('div')`
  flex-shrink: 0;
  margin-bottom: 16px;
`;

const Title = styled('h2')`
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
`;

const Body = styled('div')`
  flex: 1;
  min-height: 0; /* Important for proper flex behavior */
  overflow: hidden;
`;
