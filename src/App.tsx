import { DBProvider } from './context/db.provider';
import { SearchProvider } from './context/search.provider';
import { AppShell } from './components/AppShell';

const App = () => {
  return (
    <DBProvider>
      <SearchProvider>
        <AppShell />
      </SearchProvider>
    </DBProvider>
  );
};

export default App;
