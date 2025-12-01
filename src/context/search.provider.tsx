import type { ReactNode } from 'react';
import { createContext, useState } from 'react';
import { performKeywordSearch } from '../search/keywordSearch';
import { performLLMSearch } from '../search/llmSearch';
import type { SearchResult } from '../types/search.types';
import { performVectorSearch } from '../search/vectorSearch';

export interface SearchContextValue {
  query: string;
  setQuery: (query: string) => void;
  keywordResult: SearchResult | null;
  vectorResult: SearchResult | null;
  llmResult: SearchResult | null;
  searching: boolean;
  search: () => Promise<void>;
}

export const SearchContext = createContext<SearchContextValue | null>(null);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider = ({ children }: SearchProviderProps) => {
  const [query, setQuery] = useState('');
  const [keywordResult, setKeywordResult] = useState<SearchResult | null>(null);
  const [vectorResult, setVectorResult] = useState<SearchResult | null>(null);
  const [llmResult, setLlmResult] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);

  const search = async () => {
    if (!query.trim()) {
      return;
    }

    setSearching(true);
    try {
      // Run all searches in parallel
      const [keywordRes, vectorRes, llmRes] = await Promise.all([
        performKeywordSearch(query),
        performVectorSearch(query),
        performLLMSearch(query),
      ]);

      setKeywordResult(keywordRes);
      setVectorResult(vectorRes);
      setLlmResult(llmRes);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const value: SearchContextValue = {
    query,
    setQuery,
    keywordResult,
    vectorResult,
    llmResult,
    searching,
    search,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
