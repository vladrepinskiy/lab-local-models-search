import { styled } from 'goober';
import type { ResultDocument } from '../types/search.types';

interface ResultsListProps {
  documents: ResultDocument[];
  emptyMessage?: string;
}

export const ResultsList = ({
  documents,
  emptyMessage = 'No results to display',
}: ResultsListProps) => {
  if (documents.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>;
  }

  return (
    <Container>
      {documents.map((doc) => (
        <ResultItem key={doc.id}>
          <Title>{doc.title}</Title>
          <Content>{doc.content}</Content>
          {doc.score !== undefined && (
            <Score>Score: {doc.score.toFixed(4)}</Score>
          )}
        </ResultItem>
      ))}
    </Container>
  );
};

const Container = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  overflow-y: auto;
  padding-right: 4px; /* Space for scrollbar */
`;

const ResultItem = styled('div')`
  padding: 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: box-shadow 0.2s;
  flex-shrink: 0;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const Title = styled('h3')`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
`;

const Content = styled('p')`
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Score = styled('div')`
  margin-top: 8px;
  font-size: 12px;
  color: #999;
`;

const EmptyState = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
  text-align: center;
`;
