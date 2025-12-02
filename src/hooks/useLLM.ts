import { useContext } from 'react';
import type { LLMContextValue } from '../context/llm.provider';
import { LLMContext } from '../context/llm.provider';

export const useLLM = (): LLMContextValue => {
  const context = useContext(LLMContext);

  if (!context) {
    throw new Error('useLLM must be used within an LLMProvider');
  }

  return context;
};
