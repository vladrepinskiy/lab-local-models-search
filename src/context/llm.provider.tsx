import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
import { initializeLLM, type ProgressCallback } from '../services/llm.service';

export interface LLMContextValue {
  isLoading: boolean;
  progress: number;
  statusMessage: string;
  error: Error | null;
  isInitialized: boolean;
  initialize: () => Promise<void>;
}

export const LLMContext = createContext<LLMContextValue | null>(null);

interface LLMProviderProps {
  children: ReactNode;
}

export const LLMProvider = ({ children }: LLMProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleInitialize = async () => {
    if (isInitialized) {
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setStatusMessage('Initializing model...');
    setError(null);

    try {
      const progressCallback: ProgressCallback = (report) => {
        setProgress(report.progress * 100); // Convert to percentage
        setStatusMessage(report.text || 'Loading model...');
      };

      await initializeLLM(progressCallback);

      setIsInitialized(true);
      setProgress(100);
      setStatusMessage('Model loaded successfully');
    } catch (err) {
      const error = err as Error;
      setError(error);
      setStatusMessage(`Error: ${error.message}`);
      console.error('Failed to initialize LLM:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize LLM eagerly on mount
  useEffect(() => {
    if (!isInitialized) {
      handleInitialize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const value: LLMContextValue = {
    isLoading,
    progress,
    statusMessage,
    error,
    isInitialized,
    initialize: handleInitialize,
  };

  return <LLMContext.Provider value={value}>{children}</LLMContext.Provider>;
};
