import { styled } from 'goober';
import { useLLM } from '../hooks/useLLM';
import { useSearch } from '../hooks/useSearch';
import { DBRepl } from './DBRepl';
import { HeaderBar } from './HeaderBar';
import { LoadingOverlay } from './LoadingOverlay';
import { Panel } from './Panel';

export const AppShell = () => {
  const { keywordResult, vectorResult, llmResult } = useSearch();
  const { isLoading, progress, statusMessage } = useLLM();

  return (
    <>
      <LoadingOverlay
        isLoading={isLoading}
        progress={progress}
        statusMessage={statusMessage}
        modelName="Llama-3.2-1B-Instruct-q4f16_1-MLC"
      />
      <Container>
        <Main>
          <HeaderBar />
          <PanelsGrid>
            <Panel title="Keyword Search" result={keywordResult} />
            <Panel title="Vector Search" result={vectorResult} />
            <Panel title="LLM Search" result={llmResult} />
          </PanelsGrid>
        </Main>
      </Container>
      <DBRepl />
    </>
  );
};

const Container = styled('div')`
  height: 100vh;
  background: #fafafa;
  padding: 24px;
  padding-bottom: 80px; /* Space for REPL toggle button */
  overflow: hidden;
`;

const Main = styled('main')`
  max-width: 1600px;
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
`;

const PanelsGrid = styled('div')`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  min-height: 0; /* Important for proper flex behavior */
`;
