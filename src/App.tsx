import { DBProvider } from './context/db.provider';
import { LLMProvider } from './context/llm.provider';
import { SearchProvider } from './context/search.provider';
import { AppShell } from './components/AppShell';

const App = () => {
  return (
    <DBProvider>
      <LLMProvider>
        <SearchProvider>
          <AppShell />
        </SearchProvider>
      </LLMProvider>
    </DBProvider>
  );
};

export default App;
