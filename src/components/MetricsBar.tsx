import { styled } from 'goober';
import type { SearchMetrics } from '../types/search.types';

interface MetricsBarProps {
  metrics: SearchMetrics | null;
}

export const MetricsBar = ({ metrics }: MetricsBarProps) => {
  if (!metrics) {
    return (
      <Container>
        <Metric>
          <Label>Ready to search</Label>
        </Metric>
      </Container>
    );
  }

  return (
    <Container>
      <Metric>
        <Label>Time:</Label>
        <Value>{metrics.executionTimeMs.toFixed(2)}ms</Value>
      </Metric>
      <Metric>
        <Label>Results:</Label>
        <Value>{metrics.totalResults}</Value>
      </Metric>
      <Metric>
        <Label>Shown:</Label>
        <Value>{metrics.documentsShown}</Value>
      </Metric>
    </Container>
  );
};

const Container = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
`;

const Metric = styled('div')`
  display: flex;
  gap: 4px;
`;

const Label = styled('span')`
  font-weight: 500;
`;

const Value = styled('span')`
  color: #333;
`;
