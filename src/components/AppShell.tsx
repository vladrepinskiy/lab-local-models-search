import { styled } from 'goober';
import { HeaderBar } from './HeaderBar';
import { Panel } from './Panel';
import { DBRepl } from './DBRepl';
import { useSearch } from '../hooks/useSearch';

export const AppShell = () => {
  const { keywordResult, vectorResult, llmResult } = useSearch();

  return (
    <>
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
