import { styled } from 'goober';

interface LoadingOverlayProps {
  isLoading: boolean;
  progress?: number;
  statusMessage?: string;
  modelName?: string;
}

export const LoadingOverlay = ({
  isLoading,
  progress,
  statusMessage,
  modelName,
}: LoadingOverlayProps) => {
  if (!isLoading) {
    return null;
  }

  return (
    <Overlay>
      <Content>
        <Spinner />
        <Title>Loading LLM Model</Title>
        {modelName && <ModelName>{modelName}</ModelName>}
        {statusMessage && <StatusMessage>{statusMessage}</StatusMessage>}
        {progress !== undefined && (
          <ProgressContainer>
            <ProgressBar>
              <ProgressFill style={{ width: `${progress}%` }} />
            </ProgressBar>
            <ProgressText>{Math.round(progress)}%</ProgressText>
          </ProgressContainer>
        )}
      </Content>
    </Overlay>
  );
};

const Overlay = styled('div')`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const Content = styled('div')`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 32px;
  min-width: 300px;
  max-width: 500px;
  text-align: center;
`;

const Spinner = styled('div')`
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: #1a1a1a;
  border-radius: 50%;
  margin: 0 auto 24px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Title = styled('h2')`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
`;

const ModelName = styled('div')`
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
`;

const StatusMessage = styled('div')`
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
`;

const ProgressContainer = styled('div')`
  margin-top: 16px;
`;

const ProgressBar = styled('div')`
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled('div')`
  height: 100%;
  background: #1a1a1a;
  transition: width 0.3s ease;
`;

const ProgressText = styled('div')`
  font-size: 12px;
  color: #666;
`;

